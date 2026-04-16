"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Calendar, Home, BarChart3 } from "lucide-react";

interface Analytics {
  totalTours: number;
  monthlyTours: number;
  totalVisitors: number;
  monthlyVisitors: number;
  totalProperties: number;
  completionRate: number;
  noShowRate: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  dailyTours: Array<{ day: string; count: number }>;
  topProperties: Array<{ name: string; address: string; tours: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  access_sent: "Access Sent",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500",
  access_sent: "bg-purple-500",
  in_progress: "bg-emerald-500",
  completed: "bg-white/30",
  cancelled: "bg-red-500",
  no_show: "bg-amber-500",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/analytics");
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!data) return <p className="text-white/50">Failed to load analytics.</p>;

  const maxDaily = Math.max(...data.dailyTours.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-white/40 mt-1">Last 30 days performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.monthlyTours}</p>
                <p className="text-xs text-white/40">Tours this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.monthlyVisitors}</p>
                <p className="text-xs text-white/40">New visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.completionRate}%</p>
                <p className="text-xs text-white/40">Completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">{data.totalProperties}</p>
                <p className="text-xs text-white/40">Active properties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Tours Chart */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white/60 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tours Per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[2px] h-32">
              {data.dailyTours.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 bg-violet-500/60 rounded-t hover:bg-violet-400/80 transition-colors"
                  style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
                  title={`${d.day}: ${d.count} tours`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>{data.dailyTours[0]?.day ? new Date(data.dailyTours[0].day).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
              <span>{data.dailyTours[data.dailyTours.length - 1]?.day ? new Date(data.dailyTours[data.dailyTours.length - 1]!.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tour Status Breakdown */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white/60">Tour Status (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.statusBreakdown
              .sort((a, b) => b.count - a.count)
              .map((s) => {
                const total = data.statusBreakdown.reduce((sum, x) => sum + x.count, 0);
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">{STATUS_LABELS[s.status] ?? s.status}</span>
                      <span className="text-white/40">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[s.status] ?? "bg-white/20"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white/60">Lead Sources (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.sourceBreakdown.length === 0 ? (
              <p className="text-xs text-white/25">No source data yet. Tours will start tracking sources automatically.</p>
            ) : (
              data.sourceBreakdown
                .sort((a, b) => b.count - a.count)
                .map((s) => (
                  <div key={s.source} className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-white/60 capitalize">{s.source}</span>
                    <span className="text-sm font-medium text-white">{s.count}</span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Top Properties */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white/60">Top Properties (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topProperties.length === 0 ? (
              <p className="text-xs text-white/25">No tour data yet.</p>
            ) : (
              data.topProperties.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-white/25 w-4 text-right">{i + 1}.</span>
                    <span className="text-sm text-white/60 truncate">{p.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white flex-shrink-0">{p.tours} tours</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* All-time stats */}
      <div className="text-xs text-white/25 text-center pt-4">
        All time: {data.totalTours} tours · {data.totalVisitors} visitors · {data.noShowRate}% no-show rate
      </div>
    </div>
  );
}
