import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, hubs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

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

  const { name, propertyId } = (await req.json()) as { name: string; propertyId?: string };
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  // Generate auth token — returned once, never stored in plain text
  const authToken = randomBytes(32).toString("hex");
  const authTokenHash = createHash("sha256").update(authToken).digest("hex");

  const [hub] = await db
    .insert(hubs)
    .values({
      organizationId: membership.org.id,
      propertyId: propertyId ?? null,
      name,
      authTokenHash,
    })
    .returning();

  return NextResponse.json({
    hubId: hub!.id,
    authToken, // Shown once — save this in Pi env file
    message: "Save this token — it will not be shown again.",
  });
}
