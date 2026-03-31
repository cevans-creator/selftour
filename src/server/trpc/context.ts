import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { orgMembers, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function createContext(opts?: { req?: NextRequest }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server component — can't set cookies here, handled by middleware
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let organization: typeof organizations.$inferSelect | null = null;
  let memberRole: string | null = null;

  if (user) {
    const [membership] = await db
      .select({
        organization: organizations,
        role: orgMembers.role,
      })
      .from(orgMembers)
      .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
      .where(eq(orgMembers.userId, user.id))
      .limit(1);

    if (membership) {
      organization = membership.organization;
      memberRole = membership.role;
    }
  }

  return {
    db,
    supabase,
    user: user ?? null,
    organization,
    memberRole,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
