import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { organizations, orgMembers, crmContacts } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";
import { WelcomeBuilderEmail } from "@/server/email/templates/welcome-builder";
import React from "react";

interface SetupBody {
  userId: string;
  orgName: string;
  orgSlug: string;
  firstName: string;
  lastName: string;
}

/**
 * Called after Supabase auth signup to create the organization + owner membership.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SetupBody;
    const { userId, orgName, orgSlug, firstName, lastName } = body;

    if (!userId || !orgName || !orgSlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug is taken
    const [existing] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    // If taken, append a random suffix
    const finalSlug = existing
      ? `${orgSlug}-${Math.random().toString(36).slice(2, 6)}`
      : orgSlug;

    // Create organization
    const [org] = await db
      .insert(organizations)
      .values({
        name: orgName,
        slug: finalSlug,
      })
      .returning();

    if (!org) {
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    // Create owner membership
    await db.insert(orgMembers).values({
      organizationId: org.id,
      userId,
      role: "owner",
    });

    // Send welcome email (best effort)
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    try {
      await getResendClient()?.emails.send({
        from: EMAIL_FROM,
        to: body.userId, // In production, pass email separately
        subject: `Welcome to KeySherpa, ${firstName}!`,
        react: React.createElement(WelcomeBuilderEmail, {
          firstName,
          orgName,
          dashboardUrl,
        }),
      });
    } catch (emailErr) {
      console.warn("[Setup] Failed to send welcome email:", emailErr);
    }

    // Auto-move matching CRM contact to Closed Won
    try {
      const result = await db.execute(
        sql`SELECT email FROM auth.users WHERE id = ${userId} LIMIT 1`
      );
      const rows = result as unknown as Array<{ email: string }>;
      const userEmail = rows[0]?.email;
      if (userEmail) {
        await db
          .update(crmContacts)
          .set({ stage: "closed_won", closedAt: new Date(), updatedAt: new Date() })
          .where(eq(crmContacts.email, userEmail.toLowerCase()));
      }
    } catch { /* best effort */ }

    return NextResponse.json({ orgId: org.id, orgSlug: finalSlug });
  } catch (err) {
    console.error("[Setup] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
