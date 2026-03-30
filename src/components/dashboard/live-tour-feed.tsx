"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { formatTime, formatRelative } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { TourStatus } from "@/types";

interface LiveTourEvent {
  id: string;
  tourId: string;
  eventType: string;
  createdAt: string;
  tour?: {
    visitor?: { firstName: string; lastName: string };
    property?: { address: string };
    status: TourStatus;
  };
}

interface LiveTourFeedProps {
  organizationId: string;
  initialEvents?: LiveTourEvent[];
}

const EVENT_LABELS: Record<string, string> = {
  door_unlocked: "Door unlocked",
  door_locked: "Door locked",
  access_code_created: "Access code sent",
  status_changed: "Status updated",
  no_show_detected: "No-show detected",
  sms_sent: "SMS sent",
  email_sent: "Email sent",
  ai_response: "AI replied to question",
  hub_offline: "Lock went offline",
  hub_low_battery: "Lock battery low",
};

const EVENT_COLORS: Record<string, string> = {
  door_unlocked: "success",
  door_locked: "info",
  access_code_created: "purple",
  no_show_detected: "orange",
  hub_offline: "destructive",
  hub_low_battery: "warning",
  ai_response: "secondary",
};

export function LiveTourFeed({ organizationId, initialEvents = [] }: LiveTourFeedProps) {
  const [events, setEvents] = useState<LiveTourEvent[]>(initialEvents);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`tour-events-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tour_events",
          // Filter by organization via join — we'll handle client-side
        },
        (payload) => {
          const newEvent = payload.new as LiveTourEvent;
          setEvents((prev) => [newEvent, ...prev].slice(0, 20));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [organizationId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Live Tour Feed</CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-gray-300"
              }`}
            />
            <span className="text-muted-foreground">
              {isConnected ? "Live" : "Connecting…"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-8 w-8 opacity-30" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        (EVENT_COLORS[event.eventType] as Parameters<typeof Badge>[0]["variant"]) ??
                        "secondary"
                      }
                      className="text-xs"
                    >
                      {EVENT_LABELS[event.eventType] ?? event.eventType}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelative(event.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
