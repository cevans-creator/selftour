import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, hubs } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

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

  const { claimCode } = (await req.json()) as { claimCode: string };
  if (!claimCode) return NextResponse.json({ error: "Missing claim code" }, { status: 400 });

  // Normalize: uppercase, trim, ensure KS- prefix
  let code = claimCode.trim().toUpperCase();
  if (!code.startsWith("KS-")) code = `KS-${code}`;

  const [hub] = await db
    .select()
    .from(hubs)
    .where(and(eq(hubs.claimCode, code), isNull(hubs.organizationId)))
    .limit(1);

  if (!hub) {
    return NextResponse.json({ error: "Invalid or already claimed code" }, { status: 400 });
  }

  await db
    .update(hubs)
    .set({
      organizationId: membership.org.id,
      claimedAt: new Date(),
    })
    .where(eq(hubs.id, hub.id));

  return NextResponse.json({ hubId: hub.id, hubName: hub.name });
}
