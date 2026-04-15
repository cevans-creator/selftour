import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, hubs, properties } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  // Verify property belongs to this org
  const [property] = await db.select().from(properties)
    .where(and(eq(properties.id, id), eq(properties.organizationId, membership.org.id)))
    .limit(1);
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  // Find hub assigned to this property
  const [hub] = await db.select().from(hubs)
    .where(eq(hubs.propertyId, id))
    .limit(1);

  if (!hub) {
    return NextResponse.json({ hub: null, lockPaired: false });
  }

  const online = hub.lastSeenAt
    ? Date.now() - hub.lastSeenAt.getTime() < 60_000
    : false;

  const lockPaired = property.seamDeviceId?.startsWith(`${hub.id}:`) ?? false;

  return NextResponse.json({
    hub: {
      id: hub.id,
      name: hub.name,
      online,
      lastSeenAt: hub.lastSeenAt?.toISOString() ?? null,
    },
    lockPaired,
  });
}
