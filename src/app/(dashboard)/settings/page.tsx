import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { organizations, orgMembers } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const members = await db
    .select({
      userId: orgMembers.userId,
      role: orgMembers.role,
      orgId: orgMembers.organizationId,
    })
    .from(orgMembers)
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!members[0]) redirect("/login");

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, members[0].orgId))
    .limit(1);

  if (!org) redirect("/login");

  // Get all team members for this org
  const teamRows = await db
    .select({ userId: orgMembers.userId, role: orgMembers.role })
    .from(orgMembers)
    .where(eq(orgMembers.organizationId, org.id));

  return (
    <SettingsForm
      org={{
        name: org.name,
        primaryColor: org.primaryColor,
        twilioPhoneNumber: org.twilioPhoneNumber ?? "",
        resendDomain: org.resendDomain ?? "",
        planTier: org.planTier,
        slug: org.slug,
        logoUrl: org.logoUrl ?? null,
      }}
      currentUserEmail={user.email ?? ""}
      currentUserRole={members[0].role}
      teamCount={teamRows.length}
    />
  );
}
