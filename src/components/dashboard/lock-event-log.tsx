"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, KeyRound, Plus, Minus, RefreshCw, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockEvent {
  eventId: string;
  eventType: string;
  deviceId: string;
  deviceName: string;
  propertyName: string | null;
  occurredAt: string;
  accessCodeId: string | null;
}

interface LockEventLogProps {
  deviceId?: string;
}

const EVENT_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "lock.locked":               { label: "Locked",       icon: Lock,     color: "text-[#316ee0] bg-[#316ee0]/10" },
  "lock.unlocked":             { label: "Unlocked",     icon: Unlock,   color: "text-orange-400 bg-orange-400/10" },
  "access_code.set_on_device": { label: "Code Active",  icon: KeyRound, color: "text-purple-400 bg-purple-400/10" },
  "access_code.created":       { label: "Code Added",   icon: Plus,     color: "text-green-400 bg-green-400/10" },
  "access_code.deleted":       { label: "Code Removed", icon: Minus,    color: "text-white/30 bg-white/[0.04]" },
};

function EventRow({ event }: { event: LockEvent }) {
  const meta = EVENT_META[event.eventType] ?? {
    label: event.eventType,
    icon: KeyRound,
    color: "text-white/40 bg-white/[0.04]",
  };
  const Icon = meta.icon;
  const time = new Date(event.occurredAt);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${meta.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80">{meta.label}</p>
        {event.accessCodeId && (
          <p className="text-xs text-white/25 font-mono truncate">code {event.accessCodeId.slice(0, 8)}…</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium text-white/55">
          {time.toLocaleDateString([], { month: "short", day: "numeric" })}
        </p>
        <p className="text-xs text-white/30">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function DeviceGroup({ deviceName, propertyName, events }: { deviceName: string; propertyName: string | null; events: LockEvent[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {open ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-white/35" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/35" />
          )}
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-white/80 truncate">{deviceName}</span>
            <span className={`text-xs truncate ${propertyName ? "text-white/35" : "text-white/20 italic"}`}>
              {propertyName ?? "Unassigned"}
            </span>
          </div>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/40 flex-shrink-0">
            {events.length}
          </span>
        </div>
      </button>

      {open && (
        <div className="p-2 space-y-1.5">
          {events.map((e) => <EventRow key={e.eventId} event={e} />)}
        </div>
      )}
    </div>
  );
}

export function LockEventLog({ deviceId }: LockEventLogProps) {
  const [events, setEvents] = useState<LockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const url = deviceId
        ? `/api/locks/events?deviceId=${deviceId}`
        : "/api/locks/events";
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { events: LockEvent[] };
      setEvents(data.events);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  useEffect(() => { void load(); }, [load]);

  // Group events by device
  const grouped = events.reduce<Record<string, { name: string; propertyName: string | null; events: LockEvent[] }>>((acc, e) => {
    if (!acc[e.deviceId]) acc[e.deviceId] = { name: e.deviceName, propertyName: e.propertyName, events: [] };
    acc[e.deviceId]!.events.push(e);
    return acc;
  }, {});

  const deviceIds = Object.keys(grouped);
  const filteredDeviceIds = filter === "all" ? deviceIds : [filter];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white/80">Lock Activity Log</h3>
          <p className="text-xs text-white/35 mt-0.5">Last 50 events · 30 days</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={isLoading}
          className="gap-1.5 border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/80">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      {/* Device filter */}
      {!isLoading && !error && deviceIds.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-[#316ee0]/20 text-[#316ee0] border border-[#316ee0]/30"
                : "bg-white/[0.04] text-white/40 border border-white/[0.07] hover:text-white/70"
            }`}
          >
            All devices
          </button>
          {deviceIds.map((id) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === id
                  ? "bg-[#316ee0]/20 text-[#316ee0] border border-[#316ee0]/30"
                  : "bg-white/[0.04] text-white/40 border border-white/[0.07] hover:text-white/70"
              }`}
            >
              {grouped[id]!.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-white/20" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          Could not load lock events. Check your Seam API key in Settings.
        </div>
      ) : events.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-sm text-white/30">
          No events recorded yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDeviceIds.map((id) => (
            <DeviceGroup
              key={id}
              deviceName={grouped[id]!.name}
              propertyName={grouped[id]!.propertyName}
              events={grouped[id]!.events}
            />
          ))}
        </div>
      )}
    </div>
  );
}
