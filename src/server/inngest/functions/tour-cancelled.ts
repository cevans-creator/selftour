import { inngest } from "../client";
import { db } from "@/server/db/client";
import { tours, tourEvents, visitors, properties, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";
import { TourCancellationEmail } from "@/server/email/templates/tour-cancellation";
import { formatDate, formatTime } from "@/lib/utils";
import { sendSms } from "@/server/twilio/sms";
import React from "react";

export const tourCancelled = inngest.createFunction(
  { id: "tour-cancelled-notification", name: "Tour Cancelled — Notify Visitor" },
  { event: "tour/cancelled" },
  async ({ event, step }) => {
    const { tourId, reason } = event.data;

    await step.run("send-cancellation-notification", async () => {
      // Fetch full tour details
      const [tour] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
      if (!tour) return;

      const [visitor] = await db.select().from(visitors).where(eq(visitors.id, tour.visitorId)).limit(1);
      const [property] = await db.select().from(properties).where(eq(properties.id, tour.propertyId)).limit(1);
      const [org] = await db.select().from(organizations).where(eq(organizations.id, tour.organizationId)).limit(1);

      if (!visitor || !property || !org) return;

      const tourDate = formatDate(tour.scheduledAt);
      const tourTime = formatTime(tour.scheduledAt);
      const propertyAddress = `${property.address}, ${property.city}, ${property.state}`;

      // SMS notification (non-fatal)
      try {
        await sendSms(
          visitor.phone,
          `Hi ${visitor.firstName}, your tour of ${propertyAddress} on ${tourDate} at ${tourTime} has been cancelled. Please contact us to reschedule.`
        );
      } catch (err) {
        console.warn("[SMS] Skipping cancellation SMS:", err instanceof Error ? err.message : err);
      }

      // Email notification
      const resend = getResendClient();
      if (resend) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: visitor.email,
          subject: `Tour Cancelled: ${property.address}`,
          react: React.createElement(TourCancellationEmail, {
            visitorFirstName: visitor.firstName,
            propertyAddress,
            tourDate,
            tourTime,
            cancelReason: reason,
            orgName: org.name,
            orgLogoUrl: org.logoUrl ?? undefined,
            orgPrimaryColor: org.primaryColor,
          }),
        });
      }

      await db.insert(tourEvents).values({
        tourId,
        eventType: "email_sent",
        payload: { trigger: "tour_cancelled" },
      });
    });
  }
);
