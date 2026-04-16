"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { LogoFull } from "@/components/logo";
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
    <div className="theme-light min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F5F1EA" }}>
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          <LogoFull height={36} color="#2C2A26" accentColor="#A0522D" />
        </div>

        <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>
          Team Invite
        </h1>

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2" style={{ color: "#6B705C" }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Checking your account...</span>
          </div>
        )}

        {status === "not_logged_in" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "#6B705C" }}>
              You need to log in or create an account to accept this invite.
            </p>
            <Button asChild className="w-full text-white" style={{ backgroundColor: "#A0522D" }}>
              <Link href={`/login?redirect=/invite/${token}`}>Log In / Sign Up</Link>
            </Button>
          </div>
        )}

        {status === "accepting" && (
          <div className="flex items-center justify-center gap-2" style={{ color: "#6B705C" }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Joining the team as {userEmail}...</span>
          </div>
        )}

        {status === "accepted" && (
          <div className="space-y-3">
            <CheckCircle2 className="h-10 w-10 mx-auto" style={{ color: "#A0522D" }} />
            <p className="font-medium" style={{ color: "#2C2A26" }}>You&apos;re in! Redirecting to dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="h-10 w-10 mx-auto" style={{ color: "#A0522D" }} />
            <p className="text-sm" style={{ color: "#A0522D" }}>{errorMsg}</p>
            <Button asChild variant="outline" style={{ borderColor: "#D4C9B8", color: "#3A3632" }}>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
