import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { tours, properties, visitors, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params;

  try {
    const [row] = await db
      .select({
        tour: tours,
        property: properties,
        visitor: visitors,
        org: organizations,
      })
      .from(tours)
      .innerJoin(properties, eq(tours.propertyId, properties.id))
      .innerJoin(visitors, eq(tours.visitorId, visitors.id))
      .innerJoin(organizations, eq(tours.organizationId, organizations.id))
      .where(eq(tours.id, tourId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const { tour, property, visitor, org } = row;

    return NextResponse.json({
      tour: {
        id: tour.id,
        status: tour.status,
        scheduledAt: tour.scheduledAt,
        endsAt: tour.endsAt,
        accessCode: tour.accessCode,
        propertyAddress: property.address,
        propertyCity: `${property.city}, ${property.state}`,
        visitorFirstName: visitor.firstName,
      },
      org: {
        name: org.name,
        primaryColor: org.primaryColor,
        logoUrl: org.logoUrl,
        twilioPhoneNumber: org.twilioPhoneNumber,
      },
    });
  } catch (err) {
    console.error("[Tour Access] Error:", err);
    return NextResponse.json({ error: "Failed to load tour" }, { status: 500 });
  }
}
