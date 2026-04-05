import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createTourAccessCode, deleteTourAccessCode, generateAccessCode } from "@/server/seam/locks";

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

  const { deviceId, durationMinutes = 60 } = (await req.json()) as {
    deviceId: string;
    durationMinutes?: number;
  };

  if (!deviceId) return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });

  const code = generateAccessCode();
  const startsAt = new Date();
  const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  const accessCodeId = await createTourAccessCode(deviceId, code, startsAt, endsAt);

  return NextResponse.json({ code, accessCodeId, expiresAt: endsAt.toISOString() });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessCodeId = req.nextUrl.searchParams.get("accessCodeId");
  if (!accessCodeId) return NextResponse.json({ error: "Missing accessCodeId" }, { status: 400 });

  await deleteTourAccessCode(accessCodeId);
  return NextResponse.json({ success: true });
}
