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

  const [hub] = await db.select().from(hubs)
    .where(and(eq(hubs.id, hubId), eq(hubs.organizationId, membership.org.id)))
    .limit(1);
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  // Look up paired nodeId from property's seamDeviceId (format: "hubId:nodeId")
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

  // Always clear the DB link at the end (so UI shows "no lock" even if Z-Wave removal fails)
  const clearDb = async () => {
    if (property) {
      await db.update(properties).set({
        seamDeviceId: null,
        updatedAt: new Date(),
      }).where(eq(properties.id, property.id));
    }
  };

  // Force = skip Z-Wave entirely, just wipe DB (nuclear option)
  if (force) {
    await clearDb();
    return NextResponse.json({ success: true, forced: true });
  }

  if (!nodeId) {
    // Nothing paired — just clear DB
    await clearDb();
    return NextResponse.json({ success: true });
  }

  // Send remove_node command — the hub will try force-remove first, then exclusion
  const [cmd] = await db.insert(hubCommands).values({
    hubId,
    commandType: "remove_node",
    payload: { nodeId },
    status: "pending",
  }).returning();
  if (!cmd) return NextResponse.json({ error: "Failed to create command" }, { status: 500 });

  // Wait up to 90 sec for result
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const [result] = await db.select().from(hubCommands).where(eq(hubCommands.id, cmd.id)).limit(1);
    if (result?.status === "completed") {
      await clearDb();
      return NextResponse.json({ success: true, method: (result.result as Record<string, unknown>)?.method });
    }
    if (result?.status === "failed") {
      // Clear DB anyway so user can try again / use Force Clear
      return NextResponse.json({
        error: result.error ?? "Remove failed",
        hint: "Click 'Force Clear' to wipe the database entry. You may need to factory reset the lock before pairing again.",
      }, { status: 500 });
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  await db.update(hubCommands).set({
    status: "failed",
    error: "Remove timed out",
    completedAt: new Date(),
  }).where(eq(hubCommands.id, cmd.id));
  return NextResponse.json({
    error: "Remove timed out",
    hint: "Click 'Force Clear' to wipe the database entry and try again.",
  }, { status: 408 });
}
