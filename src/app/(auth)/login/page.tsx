"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { LogoFull } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const redirect = searchParams?.get("redirect") ?? "/dashboard";

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      router.push(redirect.startsWith("/") ? redirect : "/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: "#F5F1EA" }}>
      <Link href="/" className="mb-8">
        <LogoFull height={36} color="#2C2A26" accentColor="#A0522D" />
      </Link>

      <Card className="w-full max-w-md border" style={{ backgroundColor: "rgba(255,255,255,0.6)", borderColor: "#D4C9B8", boxShadow: "0 8px 40px rgba(139,115,85,0.08)" }}>
        <CardHeader>
          <CardTitle className="text-xl" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>Sign in to your account</CardTitle>
          <CardDescription style={{ color: "#6B705C" }}>
            Enter your email and password to access your dashboard.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#A0522D" }} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
            <p className="text-center text-sm" style={{ color: "#6B705C" }}>
              Don&apos;t have an account?{" "}
              <Link href={redirect !== "/dashboard" ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"} className="font-medium hover:underline" style={{ color: "#A0522D" }}>
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
