"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Radio, Unlink, Wifi, WifiOff, Router } from "lucide-react";

interface HubInfo {
  id: string;
  name: string;
  online: boolean;
  lastSeenAt: string | null;
}

interface PropertySmartLockProps {
  propertyId: string;
}

export function PropertySmartLock({ propertyId }: PropertySmartLockProps) {
  const [loading, setLoading] = useState(true);
  const [hub, setHub] = useState<HubInfo | null>(null);
  const [lockPaired, setLockPaired] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [unpairing, setUnpairing] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/properties/${propertyId}/hub`);
      if (!res.ok) return;
      const data = await res.json();
      setHub(data.hub);
      setLockPaired(data.lockPaired);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [propertyId]);

  const handlePair = async () => {
    if (!hub) return;
    setPairing(true);
    toast.info("Put your lock in pairing mode now (hold the button on the lock for 3 seconds).", { duration: 10000 });
    try {
      const res = await fetch("/api/hub/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId: hub.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Lock paired! (Node ${data.nodeId})`);
        await load();
      } else {
        toast.error(data.error || "Pairing failed");
      }
    } catch {
      toast.error("Pair request failed");
    } finally {
      setPairing(false);
    }
  };

  const handleUnpair = async () => {
    if (!hub) return;
    if (!confirm("Unpair the lock from this hub? You'll need to pair it again to use it.")) return;
    setUnpairing(true);
    try {
      const res = await fetch("/api/hub/unpair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId: hub.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Lock unpaired");
        await load();
      } else {
        toast.error(data.error || "Unpair failed");
      }
    } catch {
      toast.error("Unpair request failed");
    } finally {
      setUnpairing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Lock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : !hub ? (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">No hub assigned to this property yet.</p>
            <Button type="button" variant="outline" asChild>
              <Link href="/hubs">Go to Hubs page</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Router className={`h-5 w-5 ${hub.online ? "text-emerald-500" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{hub.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {hub.online ? (
                    <>
                      <Wifi className="h-3 w-3 text-emerald-500" /> Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" /> Offline
                    </>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {lockPaired ? (
                  <span className="text-emerald-600 font-medium">Lock paired ✓</span>
                ) : (
                  <span>No lock paired</span>
                )}
              </div>
            </div>

            {lockPaired ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleUnpair}
                disabled={unpairing || !hub.online}
              >
                {unpairing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unlink className="h-4 w-4 mr-2" />}
                {unpairing ? "Unpairing..." : "Unpair Lock"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handlePair}
                  disabled={pairing || !hub.online}
                >
                  {pairing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Radio className="h-4 w-4 mr-2" />}
                  {pairing ? "Pairing... put lock in pair mode" : "Pair Lock"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Click Pair Lock, then put your smart lock in pairing/inclusion mode (usually hold a button on the lock for 3 seconds — check your lock's manual). The hub must be near the lock.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
