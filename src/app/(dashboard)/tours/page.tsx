import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { tours, properties, visitors, orgMembers, organizations } from "@/server/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { TourTable } from "@/components/dashboard/tour-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TourStatus } from "@/types";

export default async function ToursPage() {
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
  const org = membership.org;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Today's tours
  const todayTours = await db
    .select({ tour: tours, property: properties, visitor: visitors })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .innerJoin(visitors, eq(tours.visitorId, visitors.id))
    .where(and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, todayStart), lte(tours.scheduledAt, todayEnd)))
    .orderBy(tours.scheduledAt);

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

  // Count active tours
  const activeTours = todayTours.filter((t) =>
    ["in_progress", "access_sent"].includes(t.tour.status)
  );

  return (
    <div className="space-y-6">
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

      {/* Today */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TourTable
            tours={mapTours(todayTours)}
            emptyMessage="No tours scheduled for today."
          />
        </CardContent>
      </Card>

      {/* Recent history */}
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
    </div>
  );
}
