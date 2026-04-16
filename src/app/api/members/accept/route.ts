import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, orgInvites } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be logged in to accept an invite" }, { status: 401 });

  const { token } = (await req.json()) as { token: string };
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  // Find the invite
  const [invite] = await db
    .select()
    .from(orgInvites)
    .where(and(eq(orgInvites.token, token), isNull(orgInvites.acceptedAt)))
    .limit(1);

  if (!invite) {
    return NextResponse.json({ error: "Invalid or already used invite" }, { status: 400 });
  }

  // Check expiration
  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "This invite has expired. Ask the admin to send a new one." }, { status: 400 });
  }

  // Check email matches (case-insensitive)
  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json({
      error: `This invite was sent to ${invite.email}. Please log in with that email.`,
    }, { status: 403 });
  }

  // Check if already a member of this org
  const [existing] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.organizationId, invite.organizationId), eq(orgMembers.userId, user.id)))
    .limit(1);

  if (existing) {
    // Mark invite as accepted even if already a member
    await db.update(orgInvites).set({ acceptedAt: new Date() }).where(eq(orgInvites.id, invite.id));
    return NextResponse.json({ success: true, alreadyMember: true });
  }

  // Add as member
  await db.insert(orgMembers).values({
    organizationId: invite.organizationId,
    userId: user.id,
    role: invite.role,
  });

  // Mark invite as accepted
  await db.update(orgInvites).set({ acceptedAt: new Date() }).where(eq(orgInvites.id, invite.id));

  return NextResponse.json({ success: true, orgId: invite.organizationId });
}
