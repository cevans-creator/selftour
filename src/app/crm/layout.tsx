import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { LogoFull } from "@/components/logo";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  const admins = (process.env.PLATFORM_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  if (!admins.includes(user.email.toLowerCase())) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a09] text-white">
      <header className="border-b border-white/[0.06] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LogoFull height={24} color="#EDE6D9" accentColor="#A0522D" />
          <span className="text-xs font-medium text-white/30 border-l border-white/10 pl-4">Sales CRM</span>
        </div>
        <span className="text-xs text-white/20">{user.email}</span>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
