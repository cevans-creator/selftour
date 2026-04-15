import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, hubs, hubCommands, properties } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
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

  const hubId = req.nextUrl.searchParams.get("hubId");
  if (!hubId) return NextResponse.json({ error: "Missing hubId" }, { status: 400 });

  const [hub] = await db.select().from(hubs)
    .where(and(eq(hubs.id, hubId), eq(hubs.organizationId, membership.org.id)))
    .limit(1);
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  // Send list_nodes command
  const [cmd] = await db.insert(hubCommands).values({
    hubId,
    commandType: "list_nodes",
    payload: {},
    status: "pending",
  }).returning();
  if (!cmd) return NextResponse.json({ error: "Failed to create command" }, { status: 500 });

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const [result] = await db.select().from(hubCommands).where(eq(hubCommands.id, cmd.id)).limit(1);
    if (result?.status === "completed") {
      const rawNodes = ((result.result as Record<string, unknown>)?.nodes as Array<Record<string, unknown>>) ?? [];

      // Cross-reference with properties to show which nodes are already linked
      const orgProps = await db.select().from(properties).where(eq(properties.organizationId, membership.org.id));
      const linkedMap = new Map<number, { propertyId: string; propertyName: string }>();
      for (const p of orgProps) {
        if (p.seamDeviceId?.startsWith(`${hubId}:`)) {
          const n = parseInt(p.seamDeviceId.split(":")[1]!, 10);
          if (!isNaN(n)) linkedMap.set(n, { propertyId: p.id, propertyName: p.name });
        }
      }

      const nodes = rawNodes.map((n) => {
        const nodeId = n.nodeId as number;
        const linked = linkedMap.get(nodeId);
        return {
          nodeId,
          label: n.label ?? null,
          manufacturer: n.manufacturer ?? null,
          isAlive: n.isAlive ?? null,
          linkedProperty: linked ?? null,
        };
      });
      return NextResponse.json({ nodes });
    }
    if (result?.status === "failed") {
      return NextResponse.json({ error: result.error ?? "Failed to list nodes" }, { status: 500 });
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  return NextResponse.json({ error: "Hub did not respond — is it online?" }, { status: 408 });
}
