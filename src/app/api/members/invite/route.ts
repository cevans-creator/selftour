import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, orgInvites } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";
import { PLAN_LIMITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [membership] = await db
    .select({ org: organizations, role: orgMembers.role })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only owners and admins can invite
  if (!["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners and admins can invite members" }, { status: 403 });
  }

  const { email, role } = (await req.json()) as { email: string; role?: string };
  if (!email?.trim()) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const inviteRole = (role === "admin" || role === "agent" || role === "viewer") ? role : "agent";
  const orgId = membership.org.id;

  // Check plan member limit
  const currentMembers = await db
    .select()
    .from(orgMembers)
    .where(eq(orgMembers.organizationId, orgId));
  const limit = PLAN_LIMITS[membership.org.planTier]?.teamMembers ?? 1;
  if (currentMembers.length >= limit) {
    return NextResponse.json({
      error: `Your ${membership.org.planTier} plan allows ${limit} team member${limit !== 1 ? "s" : ""}. Upgrade to add more.`,
    }, { status: 403 });
  }

  // Check if already a member
  const existingMembers = currentMembers.filter((m) => {
    // We can't easily check email here without querying auth.users,
    // so we'll let the accept flow handle duplicate detection
    return false;
  });

  // Generate invite token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(orgInvites).values({
    organizationId: orgId,
    email: email.toLowerCase().trim(),
    role: inviteRole,
    token,
    invitedBy: user.id,
    expiresAt,
  });

  // Send invite email
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keysherpa.io"}/invite/${token}`;
  const resend = getResendClient();
  if (resend) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email.toLowerCase().trim(),
      subject: `You're invited to join ${membership.org.name} on KeySherpa`,
      text: `${user.email} has invited you to join ${membership.org.name} on KeySherpa as ${inviteRole === "admin" ? "an admin" : `a ${inviteRole}`}.\n\nClick here to accept: ${inviteUrl}\n\nThis invite expires in 7 days.`,
    });
  }

  return NextResponse.json({ success: true, inviteUrl });
}
