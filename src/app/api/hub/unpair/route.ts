import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, hubs, hubCommands, properties } from "@/server/db/schema";
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

  const { hubId, force } = (await req.json()) as { hubId: string; force?: boolean };
  if (!hubId) return NextResponse.json({ error: "Missing hubId" }, { status: 400 });

  // Verify hub belongs to this org
  const [hub] = await db.select().from(hubs)
    .where(and(eq(hubs.id, hubId), eq(hubs.organizationId, membership.org.id)))
    .limit(1);
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  // Look up the paired nodeId from the property's seamDeviceId (format: "hubId:nodeId")
  let nodeId: number | undefined;
  let property: typeof properties.$inferSelect | undefined;
  if (hub.propertyId) {
    const [p] = await db.select().from(properties).where(eq(properties.id, hub.propertyId)).limit(1);
    property = p;
    if (p?.seamDeviceId?.startsWith(`${hubId}:`)) {
      const parsed = parseInt(p.seamDeviceId.split(":")[1]!, 10);
      if (!isNaN(parsed)) nodeId = parsed;
    }
  }

  // Force clear: wipe the DB entry without talking to the hub (for stale/ghost locks)
  if (force) {
    if (property) {
      await db.update(properties).set({
        seamDeviceId: null,
        updatedAt: new Date(),
      }).where(eq(properties.id, property.id));
    }
    return NextResponse.json({ success: true, forced: true });
  }

  // Send unpair command to hub
  const [cmd] = await db.insert(hubCommands).values({
    hubId,
    commandType: "unpair_lock",
    payload: nodeId ? { nodeId } : {},
    status: "pending",
  }).returning();

  if (!cmd) return NextResponse.json({ error: "Failed to create command" }, { status: 500 });

  // Wait for result (up to 120 seconds)
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const [result] = await db.select().from(hubCommands).where(eq(hubCommands.id, cmd.id)).limit(1);
    if (result?.status === "completed") {
      // Clear the property's lock so the hub can be re-paired
      if (property) {
        await db.update(properties).set({
          seamDeviceId: null,
          updatedAt: new Date(),
        }).where(eq(properties.id, property.id));
      }
      return NextResponse.json({ success: true });
    }
    if (result?.status === "failed") {
      return NextResponse.json({ error: result.error ?? "Unpairing failed" }, { status: 500 });
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  await db.update(hubCommands).set({
    status: "failed",
    error: "Unpairing timed out",
    completedAt: new Date(),
  }).where(eq(hubCommands.id, cmd.id));

  return NextResponse.json({ error: "Unpairing timed out" }, { status: 408 });
}
