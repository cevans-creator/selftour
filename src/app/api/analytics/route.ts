import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, tours, visitors, properties } from "@/server/db/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = membership.org.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Total tours (all time)
  const [totalToursResult] = await db
    .select({ count: count() })
    .from(tours)
    .where(eq(tours.organizationId, orgId));

  // Tours this month
  const [monthlyToursResult] = await db
    .select({ count: count() })
    .from(tours)
    .where(and(eq(tours.organizationId, orgId), gte(tours.createdAt, thirtyDaysAgo)));

  // Tours by status (last 30 days)
  const statusBreakdown = await db
    .select({
      status: tours.status,
      count: count(),
    })
    .from(tours)
    .where(and(eq(tours.organizationId, orgId), gte(tours.createdAt, thirtyDaysAgo)))
    .groupBy(tours.status);

  // Total visitors
  const [totalVisitorsResult] = await db
    .select({ count: count() })
    .from(visitors)
    .where(eq(visitors.organizationId, orgId));

  // New visitors this month
  const [monthlyVisitorsResult] = await db
    .select({ count: count() })
    .from(visitors)
    .where(and(eq(visitors.organizationId, orgId), gte(visitors.createdAt, thirtyDaysAgo)));

  // Total properties
  const [totalPropertiesResult] = await db
    .select({ count: count() })
    .from(properties)
    .where(eq(properties.organizationId, orgId));

  // Tours by source (last 30 days)
  const sourceBreakdown = await db
    .select({
      source: tours.source,
      count: count(),
    })
    .from(tours)
    .where(and(eq(tours.organizationId, orgId), gte(tours.createdAt, thirtyDaysAgo)))
    .groupBy(tours.source);

  // Tours per day (last 30 days)
  const dailyTours = await db.execute(
    sql`SELECT DATE(scheduled_at AT TIME ZONE 'UTC') as day, COUNT(*)::int as count
        FROM tours
        WHERE organization_id = ${orgId}
        AND created_at >= ${thirtyDaysAgo.toISOString()}
        GROUP BY day ORDER BY day`
  ) as unknown as Array<{ day: string; count: number }>;

  // Top properties by tour count (last 30 days)
  const topProperties = await db
    .select({
      propertyName: properties.name,
      propertyAddress: properties.address,
      count: count(),
    })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .where(and(eq(tours.organizationId, orgId), gte(tours.createdAt, thirtyDaysAgo)))
    .groupBy(properties.name, properties.address)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  // Conversion rate: completed / total (excluding cancelled)
  const completedCount = statusBreakdown.find((s) => s.status === "completed")?.count ?? 0;
  const noShowCount = statusBreakdown.find((s) => s.status === "no_show")?.count ?? 0;
  const totalNonCancelled = statusBreakdown
    .filter((s) => s.status !== "cancelled")
    .reduce((sum, s) => sum + s.count, 0);
  const completionRate = totalNonCancelled > 0 ? Math.round((completedCount / totalNonCancelled) * 100) : 0;
  const noShowRate = totalNonCancelled > 0 ? Math.round((noShowCount / totalNonCancelled) * 100) : 0;

  return NextResponse.json({
    totalTours: totalToursResult?.count ?? 0,
    monthlyTours: monthlyToursResult?.count ?? 0,
    totalVisitors: totalVisitorsResult?.count ?? 0,
    monthlyVisitors: monthlyVisitorsResult?.count ?? 0,
    totalProperties: totalPropertiesResult?.count ?? 0,
    completionRate,
    noShowRate,
    statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s.count })),
    sourceBreakdown: sourceBreakdown.map((s) => ({ source: s.source ?? "direct", count: s.count })),
    dailyTours,
    topProperties: topProperties.map((p) => ({
      name: p.propertyName,
      address: p.propertyAddress,
      tours: p.count,
    })),
  });
}
