import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import {
  tours,
  properties,
  visitors,
  organizations,
  orgMembers,
} from "@/server/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { StatCard } from "@/components/dashboard/stat-card";
import { TourTable } from "@/components/dashboard/tour-table";
import { LiveTourFeed } from "@/components/dashboard/live-tour-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Home, TrendingUp } from "lucide-react";
import type { TourStatus } from "@/types";

export default async function DashboardPage() {
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
    .select({ org: organizations, role: orgMembers.role })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) redirect("/login");
  const org = membership.org;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // KPIs
  const [
    [toursTodayRow],
    [toursWeekRow],
    [completedRow],
    [noShowRow],
    [totalRow],
    [visitorsRow],
    [activePropsRow],
  ] = await Promise.all([
    db.select({ count: count() }).from(tours).where(
      and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, todayStart), lte(tours.scheduledAt, todayEnd))
    ),
    db.select({ count: count() }).from(tours).where(
      and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, weekStart), lte(tours.scheduledAt, weekEnd))
    ),
    db.select({ count: count() }).from(tours).where(and(eq(tours.organizationId, org.id), eq(tours.status, "completed"))),
    db.select({ count: count() }).from(tours).where(and(eq(tours.organizationId, org.id), eq(tours.status, "no_show"))),
    db.select({ count: count() }).from(tours).where(eq(tours.organizationId, org.id)),
    db.select({ count: count() }).from(visitors).where(eq(visitors.organizationId, org.id)),
    db.select({ count: count() }).from(properties).where(and(eq(properties.organizationId, org.id), eq(properties.status, "active"))),
  ]);

  const total = totalRow?.count ?? 0;
  const completed = completedRow?.count ?? 0;
  const noShows = noShowRow?.count ?? 0;
  const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const noShowRate = total > 0 ? Math.round((noShows / total) * 100) : 0;

  // Today's tours
  const todayTours = await db
    .select({ tour: tours, property: properties, visitor: visitors })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .innerJoin(visitors, eq(tours.visitorId, visitors.id))
    .where(
      and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, todayStart), lte(tours.scheduledAt, todayEnd))
    )
    .orderBy(tours.scheduledAt)
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to {org.name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tours Today"
          value={toursTodayRow?.count ?? 0}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Tours This Week"
          value={toursWeekRow?.count ?? 0}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          description="Completed tours"
          icon={<Home className="h-5 w-5" />}
        />
        <StatCard
          title="Total Visitors"
          value={visitorsRow?.count ?? 0}
          description={`${activePropsRow?.count ?? 0} active properties`}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Today's Schedule + Live Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tours</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TourTable
                tours={todayTours.map((r) => ({
                  tour: { ...r.tour, status: r.tour.status as TourStatus },
                  property: r.property,
                  visitor: r.visitor,
                }))}
                emptyMessage="No tours scheduled for today."
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <LiveTourFeed organizationId={org.id} />
        </div>
      </div>
    </div>
  );
}
