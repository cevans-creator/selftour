import Link from "next/link";
import { LogoFull } from "@/components/logo";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a09] text-white">
      <header className="border-b border-white/[0.06] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LogoFull height={24} color="#EDE6D9" accentColor="#A0522D" />
          <span className="text-xs font-medium text-white/30 border-l border-white/10 pl-4">Sales CRM</span>
        </div>
        <Link href="/dashboard" className="text-xs text-white/40 hover:text-white/60 transition-colors">
          Back to Dashboard
        </Link>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
