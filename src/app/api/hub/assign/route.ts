import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, hubs, properties } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

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

  const { hubId, propertyId } = (await req.json()) as { hubId: string; propertyId: string };
  if (!hubId || !propertyId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Verify hub belongs to this org
  const [hub] = await db.select().from(hubs)
    .where(and(eq(hubs.id, hubId), eq(hubs.organizationId, membership.org.id)))
    .limit(1);
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  // Verify property belongs to this org
  const [property] = await db.select().from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.organizationId, membership.org.id)))
    .limit(1);
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  // Assign hub to property
  await db.update(hubs).set({ propertyId, updatedAt: new Date() }).where(eq(hubs.id, hubId));

  // Update property lock provider to pi (device ID will be set after pairing)
  await db.update(properties).set({
    lockProvider: "pi",
    updatedAt: new Date(),
  }).where(eq(properties.id, propertyId));

  return NextResponse.json({ success: true });
}
