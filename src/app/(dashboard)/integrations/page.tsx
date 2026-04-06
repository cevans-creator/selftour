import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { listDevices } from "@/server/seam/locks";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Battery, Lock, Unlock, Plug, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { GenerateCodeDialog } from "@/components/dashboard/generate-code-dialog";
import { LockEventLog } from "@/components/dashboard/lock-event-log";

export default async function IntegrationsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) redirect("/login");

  // Fetch connected devices from Seam
  let devices: Awaited<ReturnType<typeof listDevices>> = [];
  let seamError = false;

  try {
    devices = await listDevices();
  } catch {
    seamError = true;
  }

  const hasDevices = !seamError && devices.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect and manage your smart lock devices.</p>
      </div>

      {/* Setup Guide */}
      <Card className="border-[#316ee0]/20 bg-[#316ee0]/[0.06]">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-[#316ee0]" />
                <h3 className="font-semibold text-white">Lock Setup Guide</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { label: "Create Seam account", done: hasDevices },
                  { label: "Connect lock to Seam", done: hasDevices },
                  { label: "Add API key to settings", done: hasDevices },
                  { label: "Assign lock to property", done: false },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-2 text-sm">
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-[#316ee0] flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-white/20 flex-shrink-0" />
                    )}
                    <span className={step.done ? "text-white/30 line-through" : "text-white/60"}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/docs/lock-setup"
              target="_blank"
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#316ee0] px-4 py-2 text-sm font-medium text-white hover:bg-[#2558c8] transition-colors"
            >
              View Full Guide →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Seam Connect */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              Smart Locks (via Seam)
            </CardTitle>
            <Badge variant={seamError ? "destructive" : "success"}>
              {seamError ? "Not Connected" : "Connected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Seam connects to SmartThings, Schlage, August, Yale, and 150+ other smart lock brands.
            Use the Seam Connect Webview below to link your account, then assign device IDs to your properties.
          </p>

          {/* Seam Connect Webview embed */}
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Plug className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">Seam Connect Webview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              In production, embed the Seam Connect Webview here using{" "}
              <code className="font-mono">@seamapi/react</code> to let users connect their lock accounts.
            </p>
            <a
              href="https://docs.seam.co/latest/ui-components/connect-webviews"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-primary hover:underline"
            >
              View Seam Connect Webview docs →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices ({devices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {seamError ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Could not fetch devices. Make sure your SEAM_API_KEY is configured correctly.
            </div>
          ) : devices.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No devices connected yet. Use the Seam Connect Webview above to link your locks.
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.deviceId}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${device.connected ? "bg-green-100" : "bg-red-100"}`}>
                      {device.connected ? (
                        <Wifi className="h-5 w-5 text-green-600" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{device.deviceId}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {device.locked !== null && (
                      <div className="flex items-center gap-1.5 text-sm">
                        {device.locked ? (
                          <Lock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Unlock className="h-4 w-4 text-orange-500" />
                        )}
                        <span>{device.locked ? "Locked" : "Unlocked"}</span>
                      </div>
                    )}

                    {device.batteryLevel !== null && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Battery
                          className={`h-4 w-4 ${(device.batteryLevel ?? 1) < 20 ? "text-yellow-500" : "text-green-600"}`}
                        />
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}

                    <Badge variant={device.connected ? "success" : "destructive"}>
                      {device.connected ? "Online" : "Offline"}
                    </Badge>

                    <GenerateCodeDialog deviceId={device.deviceId} deviceName={device.name} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lock Activity Log */}
      <Card>
        <CardContent className="p-6">
          <LockEventLog />
        </CardContent>
      </Card>

      {/* Other integrations coming soon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { name: "Twilio", description: "SMS notifications and AI assistant", status: "active" },
          { name: "Resend", description: "Transactional email delivery", status: "active" },
          { name: "Stripe", description: "Payments and Identity verification", status: "active" },
        ].map((integration) => (
          <Card key={integration.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
                <Badge variant={integration.status === "active" ? "success" : "gray"}>
                  {integration.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
