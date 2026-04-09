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

  const { hubId } = (await req.json()) as { hubId: string };
  if (!hubId) return NextResponse.json({ error: "Missing hubId" }, { status: 400 });

  // Verify hub belongs to this org
  const [hub] = await db.select().from(hubs)
    .where(and(eq(hubs.id, hubId), eq(hubs.organizationId, membership.org.id)))
    .limit(1);
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  // Send pair command to hub
  const [cmd] = await db.insert(hubCommands).values({
    hubId,
    commandType: "pair_lock",
    payload: {},
    status: "pending",
  }).returning();

  if (!cmd) return NextResponse.json({ error: "Failed to create command" }, { status: 500 });

  // Wait for result (up to 120 seconds for pairing)
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const [result] = await db.select().from(hubCommands).where(eq(hubCommands.id, cmd.id)).limit(1);
    if (result?.status === "completed") {
      const nodeId = (result.result as Record<string, unknown>)?.nodeId as number;

      // Auto-set the property's seamDeviceId to hubId:nodeId
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
      return NextResponse.json({ error: result.error ?? "Pairing failed" }, { status: 500 });
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Timed out
  await db.update(hubCommands).set({
    status: "failed",
    error: "Pairing timed out — make sure the lock is in pairing mode",
    completedAt: new Date(),
  }).where(eq(hubCommands.id, cmd.id));

  return NextResponse.json({ error: "Pairing timed out" }, { status: 408 });
}
