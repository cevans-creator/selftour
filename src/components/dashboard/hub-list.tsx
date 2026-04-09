"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Router,
  Plus,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Trash2,
  Link as LinkIcon,
  Radio,
} from "lucide-react";

interface Hub {
  id: string;
  name: string;
  lastSeenAt: string | null;
  createdAt: string;
  propertyId: string | null;
  propertyName: string | null;
  propertyAddress: string | null;
  online: boolean;
}

interface Property {
  id: string;
  name: string;
  address: string;
  seamDeviceId: string | null;
}

interface HubListProps {
  hubs: Hub[];
  properties: Property[];
  orgId: string;
}

export function HubList({ hubs, properties, orgId }: HubListProps) {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerPropertyId, setRegisterPropertyId] = useState("");
  const [registering, setRegistering] = useState(false);
  const [newHub, setNewHub] = useState<{ hubId: string; authToken: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignPropertyId, setAssignPropertyId] = useState("");
  const [pairing, setPairing] = useState<string | null>(null);
  const [pairResult, setPairResult] = useState<{ nodeId: number } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!registerName.trim()) return;
    setRegistering(true);
    try {
      const res = await fetch("/api/hub/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          propertyId: registerPropertyId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewHub({ hubId: data.hubId, authToken: data.authToken });
      } else {
        alert(data.error || "Failed to register hub");
      }
    } catch {
      alert("Failed to register hub");
    } finally {
      setRegistering(false);
    }
  };

  const handleCopyEnv = () => {
    if (!newHub) return;
    const env = `HUB_ID=${newHub.hubId}\nAUTH_TOKEN=${newHub.authToken}\nAPI_BASE=https://www.keysherpa.io\nZWAVE_DEVICE=/dev/zwave`;
    navigator.clipboard.writeText(env);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDoneRegister = () => {
    setNewHub(null);
    setShowRegister(false);
    setRegisterName("");
    setRegisterPropertyId("");
    router.refresh();
  };

  const handleAssign = async (hubId: string) => {
    if (!assignPropertyId) return;
    setAssigning(hubId);
    try {
      const res = await fetch("/api/hub/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId, propertyId: assignPropertyId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to assign");
      }
    } catch {
      alert("Failed to assign hub");
    } finally {
      setAssigning(null);
      setAssignPropertyId("");
    }
  };

  const handlePairLock = async (hubId: string) => {
    setPairing(hubId);
    setPairResult(null);
    try {
      const res = await fetch("/api/hub/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId }),
      });
      const data = await res.json();
      if (res.ok && data.nodeId) {
        setPairResult({ nodeId: data.nodeId });
        router.refresh();
      } else {
        alert(data.error || "Pairing failed or timed out. Make sure the lock is in pairing mode.");
      }
    } catch {
      alert("Pairing request failed");
    } finally {
      setPairing(null);
    }
  };

  const handleDelete = async (hubId: string) => {
    if (!confirm("Delete this hub? This cannot be undone.")) return;
    setDeleting(hubId);
    try {
      const res = await fetch(`/api/hub/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to delete hub");
    } finally {
      setDeleting(null);
    }
  };

  const formatLastSeen = (iso: string | null) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return "Just now";
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hubs</h1>
          <p className="text-sm text-white/40 mt-1">
            {hubs.length} hub{hubs.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button
          onClick={() => setShowRegister(true)}
          className="bg-[#316ee0] hover:bg-[#2860c9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Hub
        </Button>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111] border-white/10">
            <CardContent className="p-6 space-y-4">
              {!newHub ? (
                <>
                  <h2 className="text-lg font-semibold text-white">Register New Hub</h2>
                  <div>
                    <label className="text-xs text-white/50 font-medium">Hub Name</label>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. 123 Main St Hub"
                      className="mt-1 w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#316ee0]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-medium">Assign to Property (optional)</label>
                    <select
                      value={registerPropertyId}
                      onChange={(e) => setRegisterPropertyId(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#316ee0]"
                    >
                      <option value="">None</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — {p.address}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => { setShowRegister(false); setRegisterName(""); setRegisterPropertyId(""); }}
                      className="flex-1 border-white/10 text-white/60 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRegister}
                      disabled={registering || !registerName.trim()}
                      className="flex-1 bg-[#316ee0] hover:bg-[#2860c9] text-white"
                    >
                      {registering ? "Registering..." : "Register"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-white">Hub Registered</h2>
                  <p className="text-sm text-white/50">
                    Save these credentials — the auth token will <strong className="text-white">not</strong> be shown again.
                  </p>
                  <div className="rounded-lg bg-black border border-white/10 p-4 space-y-2 font-mono text-xs text-white/80">
                    <div>HUB_ID={newHub.hubId}</div>
                    <div>AUTH_TOKEN={newHub.authToken}</div>
                    <div>API_BASE=https://www.keysherpa.io</div>
                    <div>ZWAVE_DEVICE=/dev/zwave</div>
                  </div>
                  <Button
                    onClick={handleCopyEnv}
                    variant="outline"
                    className="w-full border-white/10 text-white/60 hover:text-white"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy .env"}
                  </Button>
                  <Button
                    onClick={handleDoneRegister}
                    className="w-full bg-[#316ee0] hover:bg-[#2860c9] text-white"
                  >
                    Done
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hub Cards */}
      {hubs.length === 0 ? (
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="py-16 text-center">
            <Router className="h-10 w-10 text-white/15 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-white/40">No hubs registered</h3>
            <p className="text-xs text-white/25 mt-1">Register a Pi hub to start controlling Z-Wave locks.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hubs.map((hub) => (
            <Card key={hub.id} className="bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${hub.online ? "bg-emerald-500/10" : "bg-white/[0.04]"}`}>
                      <Router className={`h-5 w-5 ${hub.online ? "text-emerald-400" : "text-white/20"}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{hub.name}</h3>
                      <p className="text-xs text-white/30 font-mono mt-0.5">{hub.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={hub.online ? "default" : "destructive"} className={hub.online ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : ""}>
                      {hub.online ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                      {hub.online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-white/40">
                    <span>Last seen</span>
                    <span className="text-white/60">{formatLastSeen(hub.lastSeenAt)}</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>Property</span>
                    <span className="text-white/60">
                      {hub.propertyName ?? "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                  {!hub.propertyId ? (
                    <div className="flex gap-2 flex-1">
                      <select
                        value={assignPropertyId}
                        onChange={(e) => setAssignPropertyId(e.target.value)}
                        className="flex-1 rounded-lg bg-white/[0.06] border border-white/10 px-2 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="">Select property...</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() => handleAssign(hub.id)}
                        disabled={!assignPropertyId || assigning === hub.id}
                        className="bg-[#316ee0] hover:bg-[#2860c9] text-white text-xs"
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePairLock(hub.id)}
                      disabled={pairing === hub.id || !hub.online}
                      className="border-white/10 text-white/60 hover:text-white text-xs"
                    >
                      <Radio className="h-3 w-3 mr-1" />
                      {pairing === hub.id ? "Pairing... (put lock in pair mode)" : "Pair Lock"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(hub.id)}
                    disabled={deleting === hub.id}
                    className="border-white/10 text-red-400/60 hover:text-red-400 hover:border-red-400/20 text-xs ml-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Pair result */}
                {pairResult && (
                  <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                    Lock paired as Node {pairResult.nodeId}. Device ID: {hub.id}:{pairResult.nodeId}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
