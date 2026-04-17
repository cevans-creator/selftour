import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { crmContacts, crmNotes, orgMembers } from "@/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// Only allow owner/admin of the KeySherpa platform org
async function requirePlatformAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const platformOrgId = process.env.PLATFORM_ORG_ID;
  if (!platformOrgId) return null;

  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership || membership.organizationId !== platformOrgId) return null;
  if (!["owner", "admin"].includes(membership.role)) return null;
  return user;
}

// GET — list all contacts with latest note
export async function GET(req: NextRequest) {
  const user = await requirePlatformAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stage = req.nextUrl.searchParams.get("stage");

  const contacts = await db
    .select()
    .from(crmContacts)
    .where(stage ? eq(crmContacts.stage, stage as any) : undefined)
    .orderBy(desc(crmContacts.updatedAt));

  return NextResponse.json({ contacts });
}

// POST — create a new contact
export async function POST(req: NextRequest) {
  const user = await requirePlatformAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { companyName, contactName, email, phone, propertyCount, source, stage } = body;

  if (!companyName || !contactName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [contact] = await db.insert(crmContacts).values({
    companyName,
    contactName,
    email,
    phone: phone ?? null,
    propertyCount: propertyCount ?? null,
    source: source ?? "manual",
    stage: stage ?? "new_lead",
  }).returning();

  return NextResponse.json({ contact });
}

// PATCH — update a contact (stage, details, etc.)
export async function PATCH(req: NextRequest) {
  const user = await requirePlatformAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // If moving to closed_won or closed_lost, set closedAt
  if (updates.stage === "closed_won" || updates.stage === "closed_lost") {
    updates.closedAt = new Date();
  }

  await db.update(crmContacts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(crmContacts.id, id));

  return NextResponse.json({ success: true });
}

// DELETE — remove a contact
export async function DELETE(req: NextRequest) {
  const user = await requirePlatformAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(crmContacts).where(eq(crmContacts.id, id));
  return NextResponse.json({ success: true });
}
