"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  MessageSquare,
  Brain,
  Plug,
  Settings,
  LogOut,
  KeyRound,
  ExternalLink,
  Menu,
  X,
  Router,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ICON_MAP = {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  MessageSquare,
  Brain,
  Plug,
  Settings,
  Router,
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Properties", href: "/properties", icon: "Home" },
  { label: "Tours", href: "/tours", icon: "Calendar" },
  { label: "Visitors", href: "/visitors", icon: "Users" },
  { label: "Messaging", href: "/messaging", icon: "MessageSquare" },
  { label: "AI Knowledge", href: "/ai-knowledge", icon: "Brain" },
  { label: "Hubs", href: "/hubs", icon: "Router" },
  { label: "Team", href: "/members", icon: "Users" },
  { label: "Integrations", href: "/integrations", icon: "Plug" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

interface SidebarProps {
  orgName: string;
  orgSlug: string;
  userEmail: string;
  logoUrl?: string | null;
}

function SidebarContent({
  orgName,
  orgSlug,
  userEmail,
  logoUrl,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col bg-black border-r border-white/[0.06]">
      {/* Header — org logo when set, KeySherpa branding when not */}
      <div className="flex h-16 items-center px-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0" onClick={onNavigate}>
          {logoUrl ? (
            <div className="relative h-8 w-8 flex-shrink-0 rounded-lg overflow-hidden bg-white/[0.06]">
              <Image src={logoUrl} alt={orgName} fill className="object-contain p-0.5" unoptimized />
            </div>
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#316ee0] shadow-[0_0_16px_rgba(49,110,224,0.4)]">
              <KeyRound className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="text-sm font-semibold text-white truncate" style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}>
            {logoUrl ? orgName : "KeySherpa"}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#316ee0]/15 text-white border border-[#316ee0]/25 shadow-[0_0_12px_rgba(49,110,224,0.1)]"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/80 border border-transparent"
                  )}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#316ee0]" : "")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Powered by — only shown when org has a custom logo */}
      {logoUrl && (
        <div className="px-6 pb-1 pt-2">
          <Link href="https://keysherpa.io" target="_blank" className="flex items-center gap-1.5 opacity-30 hover:opacity-50 transition-opacity">
            <KeyRound className="h-3 w-3 text-white" />
            <span className="text-[10px] text-white tracking-wide" style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}>
              Powered by KeySherpa
            </span>
          </Link>
        </div>
      )}

      {/* User Menu */}
      <div className="border-t border-white/[0.06] p-4 space-y-1">
        <a
          href={`/tour/${orgSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/35 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View tour page
        </a>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#316ee0]/15 text-[#316ee0] text-xs font-semibold ring-1 ring-[#316ee0]/25">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/50">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md p-1 text-white/25 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ orgName, orgSlug, userEmail, logoUrl }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-64 flex-col flex-shrink-0">
        <SidebarContent orgName={orgName} orgSlug={orgSlug} userEmail={userEmail} logoUrl={logoUrl} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-black border-b border-white/[0.06] px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          {logoUrl ? (
            <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-white/[0.06]">
              <Image src={logoUrl} alt={orgName} fill className="object-contain p-0.5" unoptimized />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#316ee0]">
              <KeyRound className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          <span className="text-base font-semibold text-white tracking-wide">
            {logoUrl ? orgName : "KeySherpa"}
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-white/40 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 flex-shrink-0">
            <SidebarContent
              orgName={orgName}
              orgSlug={orgSlug}
              userEmail={userEmail}
              logoUrl={logoUrl}
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
