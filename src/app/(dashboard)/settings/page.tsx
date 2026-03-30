"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, CreditCard, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [orgForm, setOrgForm] = useState({
    name: "Sunrise Homes",
    primaryColor: "#2563eb",
    twilioPhoneNumber: "+15005550006",
    resendDomain: "sunrisehomes.com",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Settings saved");
    setIsSaving(false);
  };

  const teamMembers = [
    { name: "Jane Smith", email: "jane@sunrisehomes.com", role: "owner" },
    { name: "Bob Jones", email: "bob@sunrisehomes.com", role: "agent" },
  ];

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
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={orgForm.name}
                onChange={(e) => setOrgForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={orgForm.primaryColor}
                  onChange={(e) => setOrgForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="h-10 w-16 cursor-pointer rounded-md border border-input"
                />
                <Input
                  value={orgForm.primaryColor}
                  onChange={(e) => setOrgForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="font-mono w-32"
                  maxLength={7}
                />
                <div
                  className="h-10 w-10 rounded-md border"
                  style={{ backgroundColor: orgForm.primaryColor }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This color is used on visitor-facing tour pages.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twilioPhone">Twilio Phone Number</Label>
              <Input
                id="twilioPhone"
                value={orgForm.twilioPhoneNumber}
                onChange={(e) => setOrgForm((p) => ({ ...p, twilioPhoneNumber: e.target.value }))}
                placeholder="+15005550006"
              />
              <p className="text-xs text-muted-foreground">
                The number visitors will receive SMS from and can text for AI support.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resendDomain">Email Sending Domain</Label>
              <Input
                id="resendDomain"
                value={orgForm.resendDomain}
                onChange={(e) => setOrgForm((p) => ({ ...p, resendDomain: e.target.value }))}
                placeholder="yourdomain.com"
              />
            </div>

            <Button type="submit" isLoading={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
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
          <CardDescription>
            Manage your subscription and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Free Plan</p>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">2 properties · 20 tours/month · 1 team member</p>
            </div>
            <Button>
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage who has access to your organization.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">Invite Member</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.email} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === "owner" ? "default" : "secondary"} className="capitalize">
                    {member.role}
                  </Badge>
                  {member.role !== "owner" && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
