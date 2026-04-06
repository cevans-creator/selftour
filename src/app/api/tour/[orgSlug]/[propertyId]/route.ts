import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { organizations, properties, tours } from "@/server/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; propertyId: string }> }
) {
  const { orgSlug, propertyId } = await params;

  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing bookings for conflict detection in the slot picker
    const bookings = await db
      .select({
        scheduledAt: tours.scheduledAt,
        endsAt: tours.endsAt,
      })
      .from(tours)
      .where(
        and(
          eq(tours.propertyId, property.id),
          gte(tours.scheduledAt, new Date()),
          sql`${tours.status} NOT IN ('cancelled', 'no_show')`
        )
      );

    return NextResponse.json({
      property,
      org: {
        name: org.name,
        primaryColor: org.primaryColor,
        logoUrl: org.logoUrl,
        slug: org.slug,
      },
      bookings,
    });
  } catch (err) {
    console.error("[Tour Property API] Error:", err);
    return NextResponse.json({ error: "Failed to load property" }, { status: 500 });
  }
}
