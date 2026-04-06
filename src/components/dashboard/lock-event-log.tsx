"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, KeyRound, Plus, Minus, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockEvent {
  eventId: string;
  eventType: string;
  deviceId: string;
  occurredAt: string;
  accessCodeId: string | null;
}

interface LockEventLogProps {
  deviceId?: string;
}

const EVENT_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "lock.locked": { label: "Locked", icon: Lock, color: "text-blue-400 bg-blue-500/10" },
  "lock.unlocked": { label: "Unlocked", icon: Unlock, color: "text-orange-400 bg-orange-500/10" },
  "access_code.used": { label: "Code Used", icon: KeyRound, color: "text-[#316ee0] bg-[#316ee0]/10" },
  "access_code.created": { label: "Code Added", icon: Plus, color: "text-green-400 bg-green-500/10" },
  "access_code.deleted": { label: "Code Removed", icon: Minus, color: "text-white/40 bg-white/[0.05]" },
};

export function LockEventLog({ deviceId }: LockEventLogProps) {
  const [events, setEvents] = useState<LockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

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

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Lock Activity Log</h3>
          <p className="text-xs text-white/40 mt-0.5">Last 50 events across all devices</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={isLoading} className="gap-1.5">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          Could not load lock events. Check your Seam API key in Settings.
        </div>
      ) : events.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No events recorded yet.
        </div>
      ) : (
        <div className="space-y-1.5">
          {events.map((event) => {
            const meta = EVENT_META[event.eventType] ?? {
              label: event.eventType,
              icon: KeyRound,
              color: "text-gray-500 bg-gray-100",
            };
            const Icon = meta.icon;
            const time = new Date(event.occurredAt);

            return (
              <div
                key={event.eventId}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80">{meta.label}</p>
                  <p className="text-xs text-white/30 font-mono truncate">{event.deviceId}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-white/50">
                    {time.toLocaleDateString([], { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-xs text-white/30">
                    {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
