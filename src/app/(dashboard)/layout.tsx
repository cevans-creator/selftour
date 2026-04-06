import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SupportChat } from "@/components/dashboard/support-chat";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get org membership
  const [membership] = await db
    .select({
      org: organizations,
      role: orgMembers.role,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar
        orgName={membership.org.name}
        orgSlug={membership.org.slug}
        userEmail={user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle grid */}
        <div className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl p-4 pt-16 md:pt-6 md:p-6">{children}</div>
      </main>
      <SupportChat />
    </div>
  );
}
