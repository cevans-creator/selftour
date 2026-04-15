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

  const { hubId, useExistingNode, dskPin } = (await req.json()) as {
    hubId: string;
    useExistingNode?: number; // if set, skip inclusion and just link this existing node to the property
    dskPin?: string; // 5-digit PIN from lock's interior label (for S2 locks like Kwikset 620)
  };
  if (!hubId) return NextResponse.json({ error: "Missing hubId" }, { status: 400 });

  const [hub] = await db.select().from(hubs)
    .where(and(eq(hubs.id, hubId), eq(hubs.organizationId, membership.org.id)))
    .limit(1);
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  // ── Fast path: user chose to reuse an existing paired node (no physical pairing) ──
  if (useExistingNode) {
    if (hub.propertyId) {
      await db.update(properties).set({
        seamDeviceId: `${hubId}:${useExistingNode}`,
        lockProvider: "pi",
        updatedAt: new Date(),
      }).where(eq(properties.id, hub.propertyId));
    }
    return NextResponse.json({ success: true, nodeId: useExistingNode, method: "linked_existing" });
  }

  // ── Step 1: Clear any existing nodes on the controller for one-lock-per-hub ──
  const [clearCmd] = await db.insert(hubCommands).values({
    hubId,
    commandType: "clear_all_nodes",
    payload: {},
    status: "pending",
  }).returning();
  if (clearCmd) {
    const clearDeadline = Date.now() + 20_000;
    while (Date.now() < clearDeadline) {
      const [r] = await db.select().from(hubCommands).where(eq(hubCommands.id, clearCmd.id)).limit(1);
      if (r?.status === "completed" || r?.status === "failed") break;
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
  // Also clear the DB link since we're about to re-pair fresh
  if (hub.propertyId) {
    await db.update(properties).set({
      seamDeviceId: null,
      updatedAt: new Date(),
    }).where(eq(properties.id, hub.propertyId));
  }

  // ── Step 2: Run inclusion on the hub ──
  const [cmd] = await db.insert(hubCommands).values({
    hubId,
    commandType: "pair_lock",
    payload: dskPin ? { dskPin } : {},
    status: "pending",
  }).returning();
  if (!cmd) return NextResponse.json({ error: "Failed to create command" }, { status: 500 });

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const [result] = await db.select().from(hubCommands).where(eq(hubCommands.id, cmd.id)).limit(1);
    if (result?.status === "completed") {
      const nodeId = (result.result as Record<string, unknown>)?.nodeId as number;
      if (hub.propertyId && nodeId) {
        await db.update(properties).set({
          seamDeviceId: `${hubId}:${nodeId}`,
          lockProvider: "pi",
          updatedAt: new Date(),
        }).where(eq(properties.id, hub.propertyId));
      }
      return NextResponse.json({ success: true, nodeId });
    }
    if (result?.status === "failed") {
      return NextResponse.json({
        error: result.error ?? "Pairing failed",
        hint: "If the lock was previously paired to another hub, factory reset it first (Kwikset: remove batteries, hold A button, reinsert batteries, hold A for 30 sec).",
      }, { status: 500 });
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  await db.update(hubCommands).set({
    status: "failed",
    error: "Pairing timed out — lock not detected",
    completedAt: new Date(),
  }).where(eq(hubCommands.id, cmd.id));

  return NextResponse.json({
    error: "Pairing timed out",
    hint: "Make sure the lock is within a few feet of the hub during pairing. If the lock was previously paired, factory reset it first.",
  }, { status: 408 });
}
