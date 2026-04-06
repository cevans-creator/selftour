import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { organizations, properties } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params;

  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const activeProperties = await db
      .select()
      .from(properties)
      .where(and(eq(properties.organizationId, org.id), eq(properties.status, "active")))
      .orderBy(properties.name);

    return NextResponse.json({
      org: {
        name: org.name,
        primaryColor: org.primaryColor,
        logoUrl: org.logoUrl,
        slug: org.slug,
        twilioPhoneNumber: org.twilioPhoneNumber ?? null,
      },
      properties: activeProperties,
    });
  } catch (err) {
    console.error("[Tour Org API] Error:", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
