"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, CreditCard, Globe, Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SettingsFormProps {
  org: {
    name: string;
    primaryColor: string;
    twilioPhoneNumber: string;
    resendDomain: string;
    planTier: string;
    slug: string;
    logoUrl: string | null;
  };
  currentUserEmail: string;
  currentUserRole: string;
  teamCount: number;
}

export function SettingsForm({ org, currentUserEmail, currentUserRole, teamCount }: SettingsFormProps) {
  const [form, setForm] = useState({
    name: org.name,
    primaryColor: org.primaryColor,
    twilioPhoneNumber: org.twilioPhoneNumber,
    resendDomain: org.resendDomain,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(org.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/settings/logo", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { logoUrl: newUrl } = await res.json() as { logoUrl: string };
      setLogoUrl(newUrl);
      toast.success("Logo updated");
      router.refresh();
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoRemove = async () => {
    setLogoUploading(true);
    try {
      await fetch("/api/settings/logo", { method: "DELETE" });
      setLogoUrl(null);
      toast.success("Logo removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/org", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
      router.refresh(); // re-fetches server layout so sidebar name updates
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const planLabel: Record<string, string> = {
    rookie: "Rookie",
    pro: "Pro",
    elite: "Elite",
    free: "Free",
    starter: "Starter",
    growth: "Growth",
    enterprise: "Enterprise",
  };

  const planLimits: Record<string, string> = {
    rookie: "10 properties · 200 tours/month · 5 team members",
    pro: "50 properties · 1,000 tours/month · 15 team members",
    elite: "Unlimited properties · Unlimited tours · Unlimited team members",
    free: "2 properties · 20 tours/month · 1 team member",
    starter: "10 properties · 100 tours/month · 3 team members",
    growth: "50 properties · 500 tours/month · 10 team members",
    enterprise: "Unlimited",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings and billing.</p>
      </div>

      {/* Org settings */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo upload */}
            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div
                  className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden cursor-pointer group"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoUrl ? (
                    <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" unoptimized />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-white/20 group-hover:text-white/40 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-white/45">PNG, JPG, SVG · recommended 400×400px or wider</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading}
                      className="border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/90 text-xs">
                      {logoUploading ? "Uploading…" : logoUrl ? "Replace" : "Upload logo"}
                    </Button>
                    {logoUrl && (
                      <Button type="button" variant="ghost" size="sm"
                        onClick={handleLogoRemove}
                        disabled={logoUploading}
                        className="text-white/30 hover:text-red-400 text-xs">
                        <X className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleLogoUpload(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <p className="text-xs text-white/30">
                Booking URL:{" "}
                <span className="font-mono text-white/50">
                  keysherpa.io/tour/{form.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-") || "…"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={form.primaryColor}
                  onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="h-10 w-16 cursor-pointer rounded-md border border-input"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="font-mono w-32"
                  maxLength={7}
                />
                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: form.primaryColor }} />
              </div>
              <p className="text-xs text-muted-foreground">Used on visitor-facing tour pages.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twilioPhone">Twilio Phone Number</Label>
              <Input
                id="twilioPhone"
                value={form.twilioPhoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, twilioPhoneNumber: e.target.value }))}
                placeholder="+15005550006"
              />
              <p className="text-xs text-muted-foreground">
                The number visitors receive SMS from and can text for AI support.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resendDomain">Email Sending Domain</Label>
              <Input
                id="resendDomain"
                value={form.resendDomain}
                onChange={(e) => setForm((p) => ({ ...p, resendDomain: e.target.value }))}
                placeholder="yourdomain.com"
              />
            </div>

            <Button type="submit" isLoading={isSaving} disabled={currentUserRole === "agent"}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            {currentUserRole === "agent" && (
              <p className="text-xs text-muted-foreground">Only owners can update settings.</p>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Plan
          </CardTitle>
          <CardDescription>Manage your subscription and billing information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{planLabel[org.planTier] ?? org.planTier}</p>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{planLimits[org.planTier]}</p>
            </div>
            {org.planTier === "free" && <Button>Upgrade Plan</Button>}
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your personal account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#316ee0]/15 text-[#316ee0] text-sm font-semibold ring-1 ring-[#316ee0]/25">
                {currentUserEmail.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{currentUserEmail}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUserRole} · {teamCount} team member{teamCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <Badge variant={currentUserRole === "owner" ? "default" : "secondary"} className="capitalize">
              {currentUserRole}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
