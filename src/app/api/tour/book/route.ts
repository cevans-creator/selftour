import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import {
  tours,
  properties,
  visitors,
  organizations,
} from "@/server/db/schema";
import { eq, and, or, gte, lte, sql } from "drizzle-orm";
import { inngest } from "@/server/inngest/client";
import { addMinutes } from "date-fns";
import { buildAccessUrl, normalizePhone } from "@/lib/utils";

interface BookingBody {
  orgSlug: string;
  propertyId: string;
  scheduledAt: string;
  visitorFirstName: string;
  visitorLastName: string;
  visitorEmail: string;
  visitorPhone: string;
  stripeIdentitySessionId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BookingBody;
    const {
      orgSlug,
      propertyId,
      scheduledAt,
      visitorFirstName,
      visitorLastName,
      visitorEmail,
      visitorPhone,
      stripeIdentitySessionId,
    } = body;

    // Look up org
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Look up property
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.organizationId, org.id),
          eq(properties.status, "active")
        )
      )
      .limit(1);

    if (!property) {
      return NextResponse.json({ error: "Property not found or inactive" }, { status: 404 });
    }

    const scheduledDate = new Date(scheduledAt);
    const endsAt = addMinutes(scheduledDate, property.tourDurationMinutes);

    // Conflict detection
    const bufferStart = addMinutes(scheduledDate, -property.bufferMinutes);
    const bufferEnd = addMinutes(endsAt, property.bufferMinutes);

    const conflicts = await db
      .select({ id: tours.id })
      .from(tours)
      .where(
        and(
          eq(tours.propertyId, property.id),
          sql`${tours.scheduledAt} < ${bufferEnd.toISOString()} AND ${tours.endsAt} > ${bufferStart.toISOString()}`
        )
      )
      .limit(1);

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please choose another time." },
        { status: 409 }
      );
    }

    const phone = normalizePhone(visitorPhone);

    // Upsert visitor
    let visitor = (
      await db
        .select()
        .from(visitors)
        .where(
          and(
            eq(visitors.organizationId, org.id),
            eq(visitors.email, visitorEmail)
          )
        )
        .limit(1)
    )[0];

    if (!visitor) {
      [visitor] = await db
        .insert(visitors)
        .values({
          organizationId: org.id,
          firstName: visitorFirstName,
          lastName: visitorLastName,
          email: visitorEmail,
          phone,
          idVerificationMethod: stripeIdentitySessionId ? "stripe_identity" : "none",
          idVerificationStatus: stripeIdentitySessionId ? "pending" : null,
          stripeIdentitySessionId: stripeIdentitySessionId ?? null,
        })
        .returning();
    }

    if (!visitor) {
      return NextResponse.json({ error: "Failed to create visitor" }, { status: 500 });
    }

    // Create tour
    const [tour] = await db
      .insert(tours)
      .values({
        organizationId: org.id,
        propertyId: property.id,
        visitorId: visitor.id,
        scheduledAt: scheduledDate,
        endsAt,
        status: "scheduled",
      })
      .returning();

    if (!tour) {
      return NextResponse.json({ error: "Failed to create tour" }, { status: 500 });
    }

    const accessUrl = buildAccessUrl(org.slug, tour.id);

    // Fire Inngest lifecycle
    await inngest.send({
      name: "tour/booked",
      data: {
        tourId: tour.id,
        propertyId: property.id,
        visitorId: visitor.id,
        organizationId: org.id,
        scheduledAt: scheduledDate.toISOString(),
        endsAt: endsAt.toISOString(),
        visitorPhone: phone,
        visitorEmail,
        visitorFirstName,
        propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
        seamDeviceId: property.seamDeviceId,
        accessUrl,
        orgName: org.name,
        orgLogoUrl: org.logoUrl,
        orgPrimaryColor: org.primaryColor,
      },
    });

    return NextResponse.json({ tourId: tour.id, accessUrl });
  } catch (err) {
    console.error("[Tour Book] Error:", err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
