import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { tours, properties, visitors, orgMembers, organizations } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { inngest } from "@/server/inngest/client";
import { addMinutes } from "date-fns";
import { buildAccessUrl, buildManageUrl, normalizePhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = membership.org;

  const {
    propertyId,
    scheduledAt,
    visitorFirstName,
    visitorLastName,
    visitorEmail,
    visitorPhone,
  } = (await req.json()) as {
    propertyId: string;
    scheduledAt: string;
    visitorFirstName: string;
    visitorLastName: string;
    visitorEmail: string;
    visitorPhone: string;
  };

  if (!propertyId || !scheduledAt || !visitorFirstName || !visitorLastName || !visitorEmail || !visitorPhone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Look up property (must belong to this org)
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.organizationId, org.id)))
    .limit(1);

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const scheduledDate = new Date(scheduledAt);
  const endsAt = addMinutes(scheduledDate, property.tourDurationMinutes);

  // Conflict detection (with buffer)
  const bufferStart = addMinutes(scheduledDate, -property.bufferMinutes);
  const bufferEnd = addMinutes(endsAt, property.bufferMinutes);

  const conflicts = await db
    .select({ id: tours.id })
    .from(tours)
    .where(
      and(
        eq(tours.propertyId, property.id),
        sql`${tours.status} NOT IN ('cancelled', 'no_show')`,
        sql`${tours.scheduledAt} < ${bufferEnd.toISOString()} AND ${tours.endsAt} > ${bufferStart.toISOString()}`
      )
    )
    .limit(1);

  if (conflicts.length > 0) {
    return NextResponse.json(
      { error: "This time slot conflicts with an existing tour. Please choose another time." },
      { status: 409 }
    );
  }

  const phone = normalizePhone(visitorPhone);

  // Upsert visitor
  let visitor = (
    await db
      .select()
      .from(visitors)
      .where(and(eq(visitors.organizationId, org.id), eq(visitors.email, visitorEmail)))
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
        idVerificationMethod: "none",
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
  const manageUrl = buildManageUrl(org.slug, tour.id);

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
      manageUrl,
      orgName: org.name,
      orgLogoUrl: org.logoUrl,
      orgPrimaryColor: org.primaryColor,
    },
  });

  return NextResponse.json({ tourId: tour.id, accessUrl });
}
