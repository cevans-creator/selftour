"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Radio, Unlink, Wifi, WifiOff, Router, Link as LinkIcon, AlertCircle } from "lucide-react";

interface HubInfo {
  id: string;
  name: string;
  online: boolean;
  lastSeenAt: string | null;
}

interface HubNode {
  nodeId: number;
  label: string | null;
  manufacturer: string | null;
  isAlive: boolean | null;
  linkedProperty: { propertyId: string; propertyName: string } | null;
}

interface PropertySmartLockProps {
  propertyId: string;
}

export function PropertySmartLock({ propertyId }: PropertySmartLockProps) {
  const [loading, setLoading] = useState(true);
  const [hub, setHub] = useState<HubInfo | null>(null);
  const [lockPaired, setLockPaired] = useState(false);
  const [orphanNodes, setOrphanNodes] = useState<HubNode[]>([]);
  const [pairing, setPairing] = useState(false);
  const [linking, setLinking] = useState(false);
  const [unpairing, setUnpairing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/hub`);
      if (!res.ok) return;
      const data = await res.json();
      setHub(data.hub);
      setLockPaired(data.lockPaired);

      // If hub exists and online but no lock paired, look for orphan nodes we could link
      if (data.hub && data.hub.online && !data.lockPaired) {
        try {
          const nodesRes = await fetch(`/api/hub/nodes?hubId=${data.hub.id}`);
          if (nodesRes.ok) {
            const nodesData = await nodesRes.json();
            const orphans = ((nodesData.nodes ?? []) as HubNode[]).filter((n) => !n.linkedProperty);
            setOrphanNodes(orphans);
          }
        } catch {
          // silent — orphan detection is best-effort
        }
      } else {
        setOrphanNodes([]);
      }
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePair = async () => {
    if (!hub) return;
    setPairing(true);
    toast.info("Press the SMALL A button on your lock now (single tap).", { duration: 15000 });
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
        toast.error(data.error || "Pairing failed", { description: data.hint, duration: 10000 });
      }
    } catch {
      toast.error("Pair request failed");
    } finally {
      setPairing(false);
    }
  };

  const handleLinkExisting = async (nodeId: number) => {
    if (!hub) return;
    setLinking(true);
    try {
      const res = await fetch("/api/hub/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId: hub.id, useExistingNode: nodeId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Lock linked! (Node ${data.nodeId})`);
        await load();
      } else {
        toast.error(data.error || "Link failed");
      }
    } catch {
      toast.error("Link request failed");
    } finally {
      setLinking(false);
    }
  };

  const handleUnpair = async (force = false) => {
    if (!hub) return;
    const msg = force
      ? "Force clear? This wipes the database entry only. Use if the normal remove is stuck."
      : "Remove the lock from this hub? You'll need to pair it again to use it.";
    if (!confirm(msg)) return;
    setUnpairing(true);
    if (!force) {
      toast.info("Removing lock... this may take up to 90 seconds.", { duration: 10000 });
    }
    try {
      const res = await fetch("/api/hub/unpair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId: hub.id, force }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(force ? "Lock cleared" : "Lock removed");
        await load();
      } else {
        toast.error(data.error || "Remove failed", { description: data.hint, duration: 10000 });
      }
    } catch {
      toast.error("Remove request failed");
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
              <div className="text-xs">
                {lockPaired ? (
                  <span className="text-emerald-600 font-medium">Lock paired ✓</span>
                ) : (
                  <span className="text-muted-foreground">No lock paired</span>
                )}
              </div>
            </div>

            {lockPaired ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUnpair(false)}
                  disabled={unpairing || !hub.online}
                >
                  {unpairing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unlink className="h-4 w-4 mr-2" />}
                  {unpairing ? "Removing..." : "Remove Lock"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleUnpair(true)}
                  disabled={unpairing}
                  className="text-muted-foreground"
                >
                  Force Clear
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Existing orphan nodes — offer to link instead of re-pair */}
                {orphanNodes.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-amber-700 dark:text-amber-400">Existing lock detected on this hub</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This hub already has {orphanNodes.length === 1 ? "a paired lock" : `${orphanNodes.length} paired locks`} that {orphanNodes.length === 1 ? "isn't" : "aren't"} linked to any property. If {orphanNodes.length === 1 ? "this is" : "one of these is"} the lock for this property, link it here instead of re-pairing:
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {orphanNodes.map((n) => (
                        <div key={n.nodeId} className="flex items-center justify-between gap-2 rounded-md bg-background/50 p-2">
                          <div className="text-xs">
                            <span className="font-medium">Node {n.nodeId}</span>
                            {n.label && <span className="text-muted-foreground"> — {n.label}</span>}
                            {n.isAlive === false && <span className="text-red-500 ml-2">offline</span>}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleLinkExisting(n.nodeId)}
                            disabled={linking || pairing}
                          >
                            {linking ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <LinkIcon className="h-3 w-3 mr-1" />}
                            Use this lock
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handlePair}
                  disabled={pairing || linking || !hub.online}
                >
                  {pairing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Radio className="h-4 w-4 mr-2" />}
                  {pairing ? "Pairing... press button on lock" : "Pair New Lock"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Click Pair, then press the <strong>small A button</strong> on the lock (single tap). Pairing uses S0 security and takes ~30 seconds. The hub must be within a few feet of the lock. If the lock was previously paired elsewhere, run "Remove Lock" first or factory reset the lock.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
