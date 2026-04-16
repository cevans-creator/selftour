import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { organizations, orgMembers } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(255),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  twilioPhoneNumber: z.string().max(20).optional().nullable(),
  resendDomain: z.string().max(255).optional().nullable(),
  crmWebhookUrl: z.string().max(500).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [membership] = await db
    .select({ orgId: orgMembers.organizationId, role: orgMembers.role })
    .from(orgMembers)
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (membership.role !== "owner" && membership.role !== "admin") {
    return NextResponse.json({ error: "Only owners can update settings" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = parsed.data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  await db
    .update(organizations)
    .set({
      name: parsed.data.name,
      slug,
      ...(parsed.data.primaryColor ? { primaryColor: parsed.data.primaryColor } : {}),
      twilioPhoneNumber: parsed.data.twilioPhoneNumber ?? null,
      resendDomain: parsed.data.resendDomain ?? null,
      crmWebhookUrl: parsed.data.crmWebhookUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, membership.orgId));

  return NextResponse.json({ ok: true, slug });
}
