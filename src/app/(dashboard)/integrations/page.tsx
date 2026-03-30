import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { orgMembers, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { listDevices } from "@/server/seam/locks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Battery, Lock, Unlock, Plug } from "lucide-react";

export default async function IntegrationsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(s) { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect and manage your smart lock devices.</p>
      </div>

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
                  className="flex items-center justify-between rounded-lg border p-4"
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

                  <div className="flex items-center gap-4">
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
                  </div>
                </div>
              ))}
            </div>
          )}
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
