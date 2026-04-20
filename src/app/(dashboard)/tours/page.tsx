import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { tours, properties, visitors, orgMembers, organizations } from "@/server/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { TourTable } from "@/components/dashboard/tour-table";
import { AddTourDialog } from "@/components/dashboard/add-tour-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TourStatus } from "@/types";
import { PageEnter, FadeUp } from "@/components/ui/motion";

export default async function ToursPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) redirect("/login?no_org=1");
  const org = membership.org;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Fetch active properties for "Add Tour" modal
  const orgProperties = await db
    .select({ id: properties.id, name: properties.name, address: properties.address, city: properties.city, state: properties.state })
    .from(properties)
    .where(and(eq(properties.organizationId, org.id), eq(properties.status, "active")));

  // Today's tours
  const todayTours = await db
    .select({ tour: tours, property: properties, visitor: visitors })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .innerJoin(visitors, eq(tours.visitorId, visitors.id))
    .where(and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, todayStart), lte(tours.scheduledAt, todayEnd)))
    .orderBy(tours.scheduledAt);

  // Upcoming tours (next 30 days, excluding today)
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingTours = await db
    .select({ tour: tours, property: properties, visitor: visitors })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .innerJoin(visitors, eq(tours.visitorId, visitors.id))
    .where(and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, todayEnd), lte(tours.scheduledAt, thirtyDaysAhead)))
    .orderBy(tours.scheduledAt)
    .limit(50);

  // Recent history (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentTours = await db
    .select({ tour: tours, property: properties, visitor: visitors })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .innerJoin(visitors, eq(tours.visitorId, visitors.id))
    .where(and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, thirtyDaysAgo), lte(tours.scheduledAt, todayStart)))
    .orderBy(desc(tours.scheduledAt))
    .limit(50);

  const mapTours = (rows: typeof todayTours) =>
    rows.map((r) => ({
      tour: { ...r.tour, status: r.tour.status as TourStatus },
      property: r.property,
      visitor: r.visitor,
    }));

  const activeTours = todayTours.filter((t) =>
    ["in_progress", "access_sent"].includes(t.tour.status)
  );

  return (
    <PageEnter className="space-y-6">
      <FadeUp className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tours</h1>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-muted-foreground">{todayTours.length} today</p>
            {activeTours.length > 0 && (
              <Badge variant="success" className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                {activeTours.length} active now
              </Badge>
            )}
          </div>
        </div>
        <AddTourDialog properties={orgProperties} />
      </FadeUp>

      {/* Today */}
      <FadeUp delay={0.08}>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TourTable
              tours={mapTours(todayTours)}
              emptyMessage="No tours scheduled for today."
              allowCancel
            />
          </CardContent>
        </Card>
      </FadeUp>

      {/* Upcoming */}
      {upcomingTours.length > 0 && (
        <FadeUp delay={0.14}>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming (Next 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TourTable
                tours={mapTours(upcomingTours)}
                emptyMessage="No upcoming tours."
                allowCancel
              />
            </CardContent>
          </Card>
        </FadeUp>
      )}

      {/* Recent history */}
      <FadeUp delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Recent History (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TourTable
              tours={mapTours(recentTours)}
              emptyMessage="No recent tour history."
            />
          </CardContent>
        </Card>
      </FadeUp>
    </PageEnter>
  );
}
