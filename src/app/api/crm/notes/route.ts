import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { crmNotes, orgMembers } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [m] = await db.select().from(orgMembers).where(eq(orgMembers.userId, user.id)).limit(1);
  if (!m || !["owner", "admin"].includes(m.role)) return null;
  return user;
}

// GET — list notes for a contact
export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contactId = req.nextUrl.searchParams.get("contactId");
  if (!contactId) return NextResponse.json({ error: "Missing contactId" }, { status: 400 });

  const notes = await db
    .select()
    .from(crmNotes)
    .where(eq(crmNotes.contactId, contactId))
    .orderBy(desc(crmNotes.createdAt));

  return NextResponse.json({ notes });
}

// POST — add a note
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contactId, content } = await req.json();
  if (!contactId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [note] = await db.insert(crmNotes).values({
    contactId,
    content: content.trim(),
    createdBy: user.email ?? "unknown",
  }).returning();

  return NextResponse.json({ note });
}
