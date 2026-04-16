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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { slugify } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    orgName: "",
    email: "",
    password: "",
  });

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const redirect = searchParams?.get("redirect") ?? "";
  const isInviteFlow = redirect.startsWith("/invite/");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: `${form.firstName} ${form.lastName}`,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account. Please try again.");
        return;
      }

      if (isInviteFlow) {
        // Skip org creation — the invite acceptance page will add them to the existing org
        toast.success("Account created! Accepting your invite...");
        router.push(redirect);
        router.refresh();
        return;
      }

      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          orgName: form.orgName,
          orgSlug: slugify(form.orgName),
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to set up your account");
        return;
      }

      toast.success("Account created! Welcome to KeySherpa.");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-light flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: "#F5F1EA" }}>
      <Link href="/" className="mb-8">
        <LogoFull height={36} color="#2C2A26" accentColor="#A0522D" />
      </Link>

      <Card className="w-full max-w-md border" style={{ backgroundColor: "rgba(255,255,255,0.6)", borderColor: "#D4C9B8", boxShadow: "0 8px 40px rgba(139,115,85,0.08)" }}>
        <CardHeader>
          <CardTitle className="text-xl" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>{isInviteFlow ? "Create your account to join the team" : "Create your account"}</CardTitle>
          <CardDescription style={{ color: "#6B705C" }}>
            {isInviteFlow ? "Sign up to accept your team invitation." : "Get started with KeySherpa."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {!isInviteFlow && (
              <div className="space-y-2">
                <Label htmlFor="orgName">Company / Organization name</Label>
                <Input
                  id="orgName"
                  name="orgName"
                  placeholder="Sunrise Homes"
                  value={form.orgName}
                  onChange={handleChange}
                  required
                />
                {form.orgName && (
                  <p className="text-xs text-muted-foreground">
                    Your tour URL:{" "}
                    <span className="font-mono text-foreground">
                      /tour/{slugify(form.orgName)}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@sunrisehomes.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#A0522D" }} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: "#A0522D" }}>
                Sign in
              </Link>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
