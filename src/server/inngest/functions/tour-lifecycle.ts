import { inngest } from "../client";
import { db } from "@/server/db/client";
import { tours, tourEvents, visitors, properties, organizations, orgMembers, hubs } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
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
      manageUrl,
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
          manageUrl,
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
          manageUrl,
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

    // ─── Step 3.5: 30min before — pre-tour hub online check ───────────────

    const hubCheckAt = new Date(scheduledDate.getTime() - 30 * 60 * 1000);
    await step.sleepUntil("sleep-until-hub-check", hubCheckAt);

    await step.run("pre-tour-hub-check", async () => {
      const [tourRow] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tourRow || tourRow.status === "cancelled") return;

      // Look up the property's hub
      const [property] = await db.select().from(properties).where(eq(properties.id, tourRow.propertyId)).limit(1);
      if (!property || property.lockProvider !== "pi" || !property.seamDeviceId) return;

      const hubId = property.seamDeviceId.split(":")[0];
      if (!hubId) return;

      const [hub] = await db.select().from(hubs).where(eq(hubs.id, hubId)).limit(1);
      if (!hub) return;

      const hubOnline = hub.lastSeenAt
        ? Date.now() - hub.lastSeenAt.getTime() < 120_000 // 2-minute window
        : false;

      if (!hubOnline) {
        console.warn(`[PRE-TOUR CHECK] Hub ${hubId} is OFFLINE for tour ${tourId} at ${propertyAddress}`);

        await logTourEvent(tourId, "hub_offline", { hubId, lastSeenAt: hub.lastSeenAt?.toISOString() });

        // Alert admin via email
        const resend = getResendClient();
        const adminEmail = await getOrgAdminEmail(tourRow.organizationId);
        if (resend && adminEmail) {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: adminEmail,
            subject: `⚠️ Hub offline — tour in 30 min at ${propertyAddress}`,
            text: `Your KeySherpa hub at ${propertyAddress} appears OFFLINE.\n\nA tour is scheduled in 30 minutes (${formatTime(scheduledDate)}).\n\nIf the hub doesn't come back online, the visitor won't receive a door code.\n\nPlease check:\n- Is the hub plugged in and powered?\n- Does it have cellular signal?\n\nView hub status in your dashboard.`,
          });
        }

        // Alert via SMS
        try {
          const [org] = await db.select().from(organizations).where(eq(organizations.id, tourRow.organizationId)).limit(1);
          if (org?.twilioPhoneNumber) {
            await sendSms(
              org.twilioPhoneNumber,
              `⚠️ KeySherpa: Hub OFFLINE at ${propertyAddress}. Tour in 30 min. Check hub power/signal immediately.`
            );
          }
        } catch { /* best effort */ }
      }
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

        try {
          accessCodeId = await createTourAccessCode(
            seamDeviceId,
            code,
            codeStartsAt,
            codeEndsAt
          );
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("[ACCESS CODE] Failed to create access code:", errMsg);

          // Log the failure as a tour event so it's visible in the dashboard
          await logTourEvent(tourId, "access_code_failed", {
            error: errMsg,
            device_id: seamDeviceId,
          });

          // Alert the org admin via email
          const resend = getResendClient();
          if (resend) {
            const tour = await getTourWithDetails(tourId);
            const adminEmail = tour?.org
              ? await getOrgAdminEmail(tour.org.id)
              : null;
            if (adminEmail) {
              await resend.emails.send({
                from: EMAIL_FROM,
                to: adminEmail,
                subject: `⚠️ Lock code failed — ${propertyAddress}`,
                text: `The access code for ${propertyAddress} could not be created.\n\nTour: ${formatDate(scheduledDate)} at ${formatTime(scheduledDate)}\nVisitor: ${visitorFirstName} (${visitorPhone})\nError: ${errMsg}\n\nThe visitor will NOT receive a door code. You may need to manually provide access or check the hub.\n\nView tour: ${accessUrl}`,
              });
            }
          }

          // Alert admin via SMS too
          try {
            const tour = await getTourWithDetails(tourId);
            const adminPhone = tour?.org?.twilioPhoneNumber;
            if (adminPhone) {
              await sendSms(
                adminPhone,
                `⚠️ KeySherpa: Lock code FAILED for ${propertyAddress} at ${formatTime(scheduledDate)}. Visitor ${visitorFirstName} will NOT get a code. Check hub status immediately.`
              );
            }
          } catch { /* best effort */ }

          // Don't throw — let the tour continue in a degraded state
          // Visitor page will show an error instead of a code
        }
      }

      // Save access code to tour (even if lock programming failed — code is saved for manual use)
      await db
        .update(tours)
        .set({
          accessCode: code,
          seamAccessCodeId: accessCodeId,
          status: accessCodeId ? "access_sent" : "scheduled", // stay scheduled if code creation failed
          updatedAt: new Date(),
        })
        .where(eq(tours.id, tourId));

      // Send access code via SMS (only if code was actually programmed on the lock)
      if (accessCodeId) {
        try {
          await sendSms(
            visitorPhone,
            `Your tour starts in 15 min! Door code: ${code}\n\n${propertyAddress}\nView instructions: ${accessUrl}\n\nText questions to this number.`
          );
        } catch (err) {
          console.warn("[SMS] Skipping access code SMS:", err instanceof Error ? err.message : err);
        }

        await logTourEvent(tourId, "sms_sent", { trigger: "access_code_sent", code });
        await logTourEvent(tourId, "access_code_created", {
          access_code_id: accessCodeId,
          device_id: seamDeviceId,
        });
      }

      return accessCodeId ? code : null;
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

      // Notify team — tour is starting
      try {
        const tour = await getTourWithDetails(tourId);
        if (tour?.org?.twilioPhoneNumber) {
          await sendSms(
            tour.org.twilioPhoneNumber,
            `Tour starting now at ${propertyAddress}. Visitor: ${visitorFirstName} (${visitorPhone}).`
          );
        }
      } catch { /* best effort */ }
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

        // Notify team — no-show
        try {
          const tour = await getTourWithDetails(tourId);
          if (tour?.org?.twilioPhoneNumber) {
            await sendSms(
              tour.org.twilioPhoneNumber,
              `No-show: ${visitorFirstName} did not unlock the door at ${propertyAddress}. Tour was scheduled for ${formatTime(scheduledDate)}.`
            );
          }
        } catch { /* best effort */ }
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

      // Notify team — tour completed
      try {
        const tour = await getTourWithDetails(tourId);
        if (tour?.org?.twilioPhoneNumber) {
          await sendSms(
            tour.org.twilioPhoneNumber,
            `Tour completed at ${propertyAddress}. Visitor: ${visitorFirstName}. Access code has been deleted.`
          );
        }

        // Fire CRM webhook if configured
        if (tour?.org?.crmWebhookUrl) {
          await fetch(tour.org.crmWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "tour.completed",
              tour: {
                id: tourId,
                scheduledAt,
                endsAt,
                propertyAddress,
                status: "completed",
                source: tour.tour.source ?? null,
              },
              visitor: {
                firstName: tour.visitor.firstName,
                lastName: tour.visitor.lastName,
                email: tour.visitor.email,
                phone: tour.visitor.phone,
              },
              property: {
                name: tour.property.name,
                address: tour.property.address,
                city: tour.property.city,
                state: tour.property.state,
                zip: tour.property.zip,
              },
              organization: tour.org.name,
              timestamp: new Date().toISOString(),
            }),
          }).catch((err) => console.warn("[CRM Webhook] Failed:", err));
        }
      } catch { /* best effort */ }
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

async function getOrgAdminEmail(orgId: string): Promise<string | null> {
  const [member] = await db
    .select({ userId: orgMembers.userId })
    .from(orgMembers)
    .where(eq(orgMembers.organizationId, orgId))
    .limit(1);
  if (!member) return null;

  // Query Supabase auth.users for the email (raw SQL since auth schema isn't in Drizzle)
  const result = await db.execute(
    sql`SELECT email FROM auth.users WHERE id = ${member.userId} LIMIT 1`
  );
  const rows = result as unknown as Array<{ email: string }>;
  return rows[0]?.email ?? null;
}
