import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { tours, visitors, properties, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params;

  const [tour] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [visitor] = await db.select().from(visitors).where(eq(visitors.id, tour.visitorId)).limit(1);
  const [property] = await db.select().from(properties).where(eq(properties.id, tour.propertyId)).limit(1);
  const [org] = await db.select().from(organizations).where(eq(organizations.id, tour.organizationId)).limit(1);

  if (!visitor || !property || !org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    tour: {
      id: tour.id,
      status: tour.status,
      scheduledAt: tour.scheduledAt,
      endsAt: tour.endsAt,
    },
    property: {
      id: property.id,
      address: property.address,
      city: property.city,
      state: property.state,
    },
    visitor: {
      firstName: visitor.firstName,
    },
    org: {
      name: org.name,
      slug: org.slug,
      primaryColor: org.primaryColor,
      logoUrl: org.logoUrl,
    },
  });
}
