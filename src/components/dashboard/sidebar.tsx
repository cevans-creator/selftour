"use client";

import Link from "next/link";
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
  ChevronDown,
  KeyRound,
  ExternalLink,
  Menu,
  X,
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
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Properties", href: "/properties", icon: "Home" },
  { label: "Tours", href: "/tours", icon: "Calendar" },
  { label: "Visitors", href: "/visitors", icon: "Users" },
  { label: "Messaging", href: "/messaging", icon: "MessageSquare" },
  { label: "AI Knowledge", href: "/ai-knowledge", icon: "Brain" },
  { label: "Integrations", href: "/integrations", icon: "Plug" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

interface SidebarProps {
  orgName: string;
  orgSlug: string;
  userEmail: string;
}

function SidebarContent({
  orgName,
  orgSlug,
  userEmail,
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
    <div className="flex h-full flex-col bg-slate-950">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-lg shadow-violet-500/30">
            <KeyRound className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">KeySherpa</span>
        </Link>
      </div>

      {/* Org Switcher */}
      <div className="px-4 py-3 border-b border-slate-800">
        <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-800/60 transition-colors">
          <span className="font-medium text-slate-200 truncate">{orgName}</span>
          <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
        </button>
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="border-t border-slate-800 p-4 space-y-1">
        <a
          href={`/tour/${orgSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View tour page
        </a>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 text-xs font-semibold ring-1 ring-violet-500/30">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-300">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md p-1 text-slate-500 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ orgName, orgSlug, userEmail }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-64 flex-col flex-shrink-0">
        <SidebarContent orgName={orgName} orgSlug={orgSlug} userEmail={userEmail} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-slate-950 border-b border-slate-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
            <KeyRound className="h-3.5 w-3.5" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">KeySherpa</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 flex-shrink-0">
            <SidebarContent
              orgName={orgName}
              orgSlug={orgSlug}
              userEmail={userEmail}
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
