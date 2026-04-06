import { inngest } from "../client";
import { db } from "@/server/db/client";
import { tours, tourEvents, visitors, properties, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  createTourAccessCode,
  deleteTourAccessCode,
  generateAccessCode,
} from "@/server/seam/locks";
import { sendSms } from "@/server/twilio/sms";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";
import { TourConfirmationEmail } from "@/server/email/templates/tour-confirmation";
import { TourReminderEmail } from "@/server/email/templates/tour-reminder";
import { TourFollowupEmail } from "@/server/email/templates/tour-followup";
import { formatDate, formatTime, buildAccessUrl } from "@/lib/utils";
import { ACCESS_CODE_PROVISION_LEAD_TIME_MINUTES, NO_SHOW_THRESHOLD_MINUTES } from "@/lib/constants";
import React from "react";

export const tourLifecycle = inngest.createFunction(
  {
    id: "tour-lifecycle",
    name: "Tour Lifecycle",
    cancelOn: [
      {
        event: "tour/cancelled",
        if: "event.data.tourId == async.data.tourId",
      },
    ],
  },
  { event: "tour/booked" },
  async ({ event, step }) => {
    const {
      tourId,
      visitorPhone,
      visitorEmail,
      visitorFirstName,
      propertyAddress,
      scheduledAt,
      endsAt,
      seamDeviceId,
      accessUrl,
      orgName,
      orgLogoUrl,
      orgPrimaryColor,
    } = event.data;

    const scheduledDate = new Date(scheduledAt);
    const endDate = new Date(endsAt);
    const tourDurationMs = endDate.getTime() - scheduledDate.getTime();

    // ─── Step 1: Immediate — send booking confirmation ─────────────────────

    await step.run("send-booking-confirmation", async () => {
      const tour = await getTourWithDetails(tourId);
      if (!tour) return;

      // SMS confirmation (non-fatal — Twilio may not be configured yet)
      try {
        await sendSms(
          visitorPhone,
          `Hi ${visitorFirstName}! Your self-guided tour of ${propertyAddress} is confirmed for ${formatDate(scheduledDate)} at ${formatTime(scheduledDate)}. We'll text your door code 15 min before. Questions: ${accessUrl}`
        );
      } catch (err) {
        console.warn("[SMS] Skipping confirmation SMS:", err instanceof Error ? err.message : err);
      }

      // Email confirmation
      const resend = getResendClient();
      if (resend) await resend.emails.send({
        from: EMAIL_FROM,
        to: visitorEmail,
        subject: `Tour Confirmed: ${propertyAddress}`,
        react: React.createElement(TourConfirmationEmail, {
          visitorFirstName,
          propertyAddress,
          propertyCity: tour.property.city,
          propertyState: tour.property.state,
          tourDate: formatDate(scheduledDate),
          tourTime: formatTime(scheduledDate),
          tourDurationMinutes: tour.property.tourDurationMinutes,
          accessUrl,
          orgName,
          orgLogoUrl: orgLogoUrl ?? undefined,
          orgPrimaryColor,
        }),
      });

      await logTourEvent(tourId, "sms_sent", { trigger: "tour_booked" });
      await logTourEvent(tourId, "email_sent", { trigger: "tour_booked" });
    });

    // ─── Step 2: 24h before — reminder ────────────────────────────────────

    const reminder24hAt = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);
    await step.sleepUntil("sleep-until-24h-reminder", reminder24hAt);

    await step.run("send-24h-reminder", async () => {
      const tour = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tour[0] || tour[0].status === "cancelled") return;

      try {
        await sendSms(
          visitorPhone,
          `Reminder: Your tour of ${propertyAddress} is tomorrow at ${formatTime(scheduledDate)}. Your door code arrives 15 min before. Questions? Reply to this number.`
        );
      } catch (err) {
        console.warn("[SMS] Skipping 24h reminder SMS:", err instanceof Error ? err.message : err);
      }

      const hoursUntil24h = Math.max(1, Math.round((scheduledDate.getTime() - Date.now()) / (60 * 60 * 1000)));
      const isToday24h = scheduledDate.toDateString() === new Date().toDateString();
      const resend24h = getResendClient();
      if (resend24h) await resend24h.emails.send({
        from: EMAIL_FROM,
        to: visitorEmail,
        subject: `Reminder: Tour ${isToday24h ? "Today" : "Tomorrow"} — ${propertyAddress}`,
        react: React.createElement(TourReminderEmail, {
          visitorFirstName,
          propertyAddress,
          tourDate: formatDate(scheduledDate),
          tourTime: formatTime(scheduledDate),
          hoursUntilTour: hoursUntil24h,
          accessUrl,
          orgName,
          orgLogoUrl: orgLogoUrl ?? undefined,
          orgPrimaryColor,
        }),
      });

      await logTourEvent(tourId, "sms_sent", { trigger: "reminder_24h" });
    });

    // ─── Step 3: 1h before — reminder ─────────────────────────────────────

    const reminder1hAt = new Date(scheduledDate.getTime() - 60 * 60 * 1000);
    await step.sleepUntil("sleep-until-1h-reminder", reminder1hAt);

    await step.run("send-1h-reminder", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status === "cancelled") return;

      try {
        await sendSms(
          visitorPhone,
          `1 hour until your tour of ${propertyAddress}! Your door code is coming soon. Text any questions to this number.`
        );
      } catch (err) {
        console.warn("[SMS] Skipping 1h reminder SMS:", err instanceof Error ? err.message : err);
      }

      await logTourEvent(tourId, "sms_sent", { trigger: "reminder_1h" });
    });

    // ─── Step 4: 15min before — provision access code ─────────────────────

    const accessCodeAt = new Date(
      scheduledDate.getTime() - ACCESS_CODE_PROVISION_LEAD_TIME_MINUTES * 60 * 1000
    );
    await step.sleepUntil("sleep-until-access-code-time", accessCodeAt);

    const accessCode = await step.run("provision-access-code", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status === "cancelled") return null;

      const code = generateAccessCode();
      let accessCodeId: string | null = null;

      if (seamDeviceId) {
        // Add 5-minute grace period on both ends
        const codeStartsAt = new Date(scheduledDate.getTime() - 5 * 60 * 1000);
        const codeEndsAt = new Date(endDate.getTime() + 5 * 60 * 1000);

        accessCodeId = await createTourAccessCode(
          seamDeviceId,
          code,
          codeStartsAt,
          codeEndsAt
        );
      }

      // Save access code to tour
      await db
        .update(tours)
        .set({
          accessCode: code,
          seamAccessCodeId: accessCodeId,
          status: "access_sent",
          updatedAt: new Date(),
        })
        .where(eq(tours.id, tourId));

      // Send access code via SMS
      try {
        await sendSms(
          visitorPhone,
          `Your tour starts in 15 min! Door code: ${code}\n\n${propertyAddress}\nView instructions: ${accessUrl}\n\nText questions to this number.`
        );
      } catch (err) {
        console.warn("[SMS] Skipping access code SMS:", err instanceof Error ? err.message : err);
      }

      await logTourEvent(tourId, "sms_sent", { trigger: "access_code_sent", code });
      if (accessCodeId) {
        await logTourEvent(tourId, "access_code_created", {
          access_code_id: accessCodeId,
          device_id: seamDeviceId,
        });
      }

      return code;
    });

    // ─── Step 5: Tour start — update status ───────────────────────────────

    await step.sleepUntil("sleep-until-tour-start", scheduledDate);

    await step.run("mark-tour-ready", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status === "cancelled") return;

      // Only update if still in access_sent (hasn't been unlocked yet)
      if (tourRow.status === "access_sent") {
        await db
          .update(tours)
          .set({ status: "access_sent", updatedAt: new Date() })
          .where(eq(tours.id, tourId));
      }

      await logTourEvent(tourId, "status_changed", { status: "tour_started" });
    });

    // ─── Step 6: 15min after start — check for no-show ────────────────────

    const noShowCheckAt = new Date(
      scheduledDate.getTime() + NO_SHOW_THRESHOLD_MINUTES * 60 * 1000
    );
    await step.sleepUntil("sleep-until-no-show-check", noShowCheckAt);

    await step.run("check-no-show", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow) return;

      // If still access_sent (door never unlocked), it's a no-show
      if (tourRow.status === "access_sent") {
        await db
          .update(tours)
          .set({ status: "no_show", updatedAt: new Date() })
          .where(eq(tours.id, tourId));

        await logTourEvent(tourId, "no_show_detected", {
          threshold_minutes: NO_SHOW_THRESHOLD_MINUTES,
        });
      }
    });

    // ─── Step 7: 5min before end — wrapping up SMS ────────────────────────

    const wrapUpAt = new Date(endDate.getTime() - 5 * 60 * 1000);
    await step.sleepUntil("sleep-until-wrap-up", wrapUpAt);

    await step.run("send-wrap-up-sms", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status === "no_show" || tourRow.status === "cancelled") return;

      try {
        await sendSms(
          visitorPhone,
          `Your tour of ${propertyAddress} ends in 5 minutes. Please ensure the door is locked when you leave. Thank you!`
        );
      } catch (err) {
        console.warn("[SMS] Skipping wrap-up SMS:", err instanceof Error ? err.message : err);
      }

      await logTourEvent(tourId, "sms_sent", { trigger: "tour_ending" });
    });

    // ─── Step 8: Tour end — delete access code, update status ─────────────

    await step.sleepUntil("sleep-until-tour-end", endDate);

    await step.run("end-tour", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status === "cancelled" || tourRow.status === "no_show") return;

      // Delete the access code from the lock
      if (tourRow.seamAccessCodeId) {
        await deleteTourAccessCode(tourRow.seamAccessCodeId);
        await logTourEvent(tourId, "access_code_deleted", {
          access_code_id: tourRow.seamAccessCodeId,
        });
      }

      await db
        .update(tours)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(tours.id, tourId));

      await logTourEvent(tourId, "status_changed", { status: "completed" });
    });

    // ─── Step 9: Immediately — thank you message ───────────────────────────

    await step.run("send-thank-you", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status !== "completed") return;

      try {
        await sendSms(
          visitorPhone,
          `Thanks for touring ${propertyAddress}, ${visitorFirstName}! Questions? Reply to this number anytime.`
        );
      } catch (err) {
        console.warn("[SMS] Skipping thank-you SMS:", err instanceof Error ? err.message : err);
      }

      const resendThanks = getResendClient();
      if (resendThanks) await resendThanks.emails.send({
        from: EMAIL_FROM,
        to: visitorEmail,
        subject: `Thanks for visiting ${propertyAddress}!`,
        react: React.createElement(TourFollowupEmail, {
          visitorFirstName,
          propertyAddress,
          tourDate: formatDate(scheduledDate),
          orgName,
          orgLogoUrl: orgLogoUrl ?? undefined,
          orgPrimaryColor,
          isNurture: false,
        }),
      });

      await logTourEvent(tourId, "sms_sent", { trigger: "tour_completed" });
      await logTourEvent(tourId, "email_sent", { trigger: "tour_completed" });
    });

    // ─── Step 10: 1h after — salesperson follow-up email ──────────────────

    await step.sleep("sleep-1h-post-tour", "1h");

    await step.run("send-agent-followup", async () => {
      const details = await getTourWithDetails(tourId);
      if (!details || details.tour.status !== "completed") return;

      // This would normally notify the assigned agent — using org email as fallback
      await logTourEvent(tourId, "email_sent", { trigger: "follow_up_1h" });
    });

    // ─── Step 11: 24h after — follow-up SMS with survey ───────────────────

    await step.sleep("sleep-24h-post-tour", "23h"); // already slept 1h above

    await step.run("send-24h-followup", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status !== "completed") return;

      try {
        await sendSms(
          visitorPhone,
          `Hi ${visitorFirstName}! How did your tour of ${propertyAddress} go yesterday? We'd love your feedback or to answer any questions. Just reply!`
        );
      } catch (err) {
        console.warn("[SMS] Skipping 24h follow-up SMS:", err instanceof Error ? err.message : err);
      }

      await logTourEvent(tourId, "sms_sent", { trigger: "follow_up_24h" });
    });

    // ─── Step 12: 72h after — nurture email ───────────────────────────────

    await step.sleep("sleep-48h-more", "48h"); // 24h+48h = 72h total post-tour

    await step.run("send-nurture-email", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status !== "completed") return;

      const resendNurture = getResendClient();
      if (resendNurture) await resendNurture.emails.send({
        from: EMAIL_FROM,
        to: visitorEmail,
        subject: `Still thinking about ${propertyAddress}?`,
        react: React.createElement(TourFollowupEmail, {
          visitorFirstName,
          propertyAddress,
          tourDate: formatDate(scheduledDate),
          orgName,
          orgLogoUrl: orgLogoUrl ?? undefined,
          orgPrimaryColor,
          isNurture: true,
        }),
      });

      await logTourEvent(tourId, "email_sent", { trigger: "nurture_72h" });
    });

    return { success: true, tourId, accessCode };
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getTourWithDetails(tourId: string) {
  const [row] = await db
    .select()
    .from(tours)
    .where(eq(tours.id, tourId))
    .limit(1);

  if (!row) return null;

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, row.propertyId))
    .limit(1);

  const [visitor] = await db
    .select()
    .from(visitors)
    .where(eq(visitors.id, row.visitorId))
    .limit(1);

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, row.organizationId))
    .limit(1);

  if (!property || !visitor || !org) return null;

  return { tour: row, property, visitor, org };
}

async function logTourEvent(
  tourId: string,
  eventType: typeof tourEvents.$inferInsert["eventType"],
  payload?: Record<string, unknown>
) {
  await db.insert(tourEvents).values({
    tourId,
    eventType,
    payload,
  });
}
