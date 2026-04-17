import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { crmContacts, orgMembers } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const platformOrgId = process.env.PLATFORM_ORG_ID;
  const [m] = await db.select().from(orgMembers).where(eq(orgMembers.userId, user.id)).limit(1);
  if (!m || !platformOrgId || m.organizationId !== platformOrgId || !["owner", "admin"].includes(m.role)) return new NextResponse("Unauthorized", { status: 401 });

  const contacts = await db.select().from(crmContacts).orderBy(desc(crmContacts.createdAt));

  const headers = ["Company", "Contact", "Email", "Phone", "Properties", "Stage", "Source", "Created"];
  const rows = contacts.map((c) => [
    c.companyName,
    c.contactName,
    c.email,
    c.phone ?? "",
    c.propertyCount ?? "",
    c.stage,
    c.source ?? "",
    c.createdAt.toISOString().split("T")[0],
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="keysherpa-leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
