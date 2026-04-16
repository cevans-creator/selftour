import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, orgInvites } from "@/server/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function GET(_req: NextRequest) {
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

  const orgId = membership.org.id;

  // Get all members with their emails from auth.users
  const members = await db.select().from(orgMembers).where(eq(orgMembers.organizationId, orgId));

  const membersWithEmail = await Promise.all(
    members.map(async (m) => {
      const result = await db.execute(
        sql`SELECT email FROM auth.users WHERE id = ${m.userId} LIMIT 1`
      );
      const rows = result as unknown as Array<{ email: string }>;
      return {
        id: m.id,
        userId: m.userId,
        role: m.role,
        email: rows[0]?.email ?? "unknown",
        createdAt: m.createdAt.toISOString(),
        isCurrentUser: m.userId === user.id,
      };
    })
  );

  // Get pending invites
  const pendingInvites = await db
    .select()
    .from(orgInvites)
    .where(and(eq(orgInvites.organizationId, orgId), isNull(orgInvites.acceptedAt)));

  const invites = pendingInvites
    .filter((i) => new Date() < i.expiresAt)
    .map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      createdAt: i.createdAt.toISOString(),
      expiresAt: i.expiresAt.toISOString(),
    }));

  return NextResponse.json({
    members: membersWithEmail,
    invites,
    currentUserRole: membership.role,
  });
}

// Update role or remove member
export async function PATCH(req: NextRequest) {
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

  if (!["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners and admins can manage members" }, { status: 403 });
  }

  const { memberId, action, role } = (await req.json()) as {
    memberId: string;
    action: "update_role" | "remove";
    role?: string;
  };
  if (!memberId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Find the target member
  const [target] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.id, memberId), eq(orgMembers.organizationId, membership.org.id)))
    .limit(1);
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Can't modify the owner
  if (target.role === "owner" && membership.role !== "owner") {
    return NextResponse.json({ error: "Cannot modify the owner" }, { status: 403 });
  }

  // Can't remove yourself
  if (action === "remove" && target.userId === user.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  if (action === "update_role") {
    if (!role || !["admin", "agent", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    // Can't change owner's role
    if (target.role === "owner") {
      return NextResponse.json({ error: "Cannot change the owner's role" }, { status: 403 });
    }
    await db.update(orgMembers).set({ role: role as "admin" | "agent" | "viewer" }).where(eq(orgMembers.id, memberId));
    return NextResponse.json({ success: true });
  }

  if (action === "remove") {
    await db.delete(orgMembers).where(eq(orgMembers.id, memberId));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// Cancel a pending invite
export async function DELETE(req: NextRequest) {
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

  if (!["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners and admins can cancel invites" }, { status: 403 });
  }

  const { inviteId } = (await req.json()) as { inviteId: string };
  if (!inviteId) return NextResponse.json({ error: "Missing inviteId" }, { status: 400 });

  await db.delete(orgInvites).where(
    and(eq(orgInvites.id, inviteId), eq(orgInvites.organizationId, membership.org.id))
  );

  return NextResponse.json({ success: true });
}
