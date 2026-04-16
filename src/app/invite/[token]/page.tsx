"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { KeyRound, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "not_logged_in" | "accepting" | "accepted" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        setStatus("accepting");
        // Auto-accept
        try {
          const res = await fetch("/api/members/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (res.ok) {
            setStatus("accepted");
            setTimeout(() => router.push("/dashboard"), 2000);
          } else {
            setStatus("error");
            setErrorMsg(data.error || "Failed to accept invite");
          }
        } catch {
          setStatus("error");
          setErrorMsg("Something went wrong. Please try again.");
        }
      } else {
        setStatus("not_logged_in");
      }
    }
    void checkAuth();
  }, [token, router, supabase.auth]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white">KeySherpa Invite</h1>

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 text-white/50">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking your account...</span>
          </div>
        )}

        {status === "not_logged_in" && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              You need to log in or create an account to accept this invite.
            </p>
            <Button asChild className="w-full bg-[#316ee0] hover:bg-[#2860c9] text-white">
              <Link href={`/login?redirect=/invite/${token}`}>Log In / Sign Up</Link>
            </Button>
          </div>
        )}

        {status === "accepting" && (
          <div className="flex items-center justify-center gap-2 text-white/50">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Joining the team as {userEmail}...</span>
          </div>
        )}

        {status === "accepted" && (
          <div className="space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="text-emerald-400 font-medium">You&apos;re in! Redirecting to dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="h-10 w-10 text-red-400 mx-auto" />
            <p className="text-red-400 text-sm">{errorMsg}</p>
            <Button asChild variant="outline" className="border-white/10 text-white/60 hover:text-white">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
