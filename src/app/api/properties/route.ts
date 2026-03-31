import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { properties, orgMembers, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [membership] = await db
      .select({ org: organizations, role: orgMembers.role })
      .from(orgMembers)
      .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
      .where(eq(orgMembers.userId, user.id))
      .limit(1);

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      type: string;
      bedrooms?: number;
      bathrooms?: string;
      squareFeet?: number;
      price?: number;
      description?: string;
      seamDeviceId?: string;
      tourDurationMinutes: number;
      bufferMinutes: number;
      availableFrom?: string;
      availableTo?: string;
      availableDays?: number[];
    };

    const [property] = await db
      .insert(properties)
      .values({
        organizationId: membership.org.id,
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        type: body.type as typeof properties.$inferInsert["type"],
        bedrooms: body.bedrooms ?? null,
        bathrooms: body.bathrooms ?? null,
        squareFeet: body.squareFeet ?? null,
        price: body.price ?? null,
        description: body.description ?? null,
        imageUrls: [],
        seamDeviceId: body.seamDeviceId || null,
        tourDurationMinutes: body.tourDurationMinutes,
        bufferMinutes: body.bufferMinutes,
        availableFrom: body.availableFrom ?? "09:00",
        availableTo: body.availableTo ?? "17:00",
        availableDays: body.availableDays ?? [1, 2, 3, 4, 5],
      })
      .returning();

    return NextResponse.json(property);
  } catch (err) {
    console.error("[Properties API] Error:", err);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
