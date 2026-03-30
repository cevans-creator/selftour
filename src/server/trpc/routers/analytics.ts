import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../router";
import { tours, visitors, properties } from "@/server/db/schema";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export const analyticsRouter = createTRPCRouter({
  kpis: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.organization.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Tours today
    const [toursTodayResult] = await ctx.db
      .select({ count: count() })
      .from(tours)
      .where(
        and(
          eq(tours.organizationId, orgId),
          gte(tours.scheduledAt, todayStart),
          lte(tours.scheduledAt, todayEnd)
        )
      );

    // Tours this week
    const [toursWeekResult] = await ctx.db
      .select({ count: count() })
      .from(tours)
      .where(
        and(
          eq(tours.organizationId, orgId),
          gte(tours.scheduledAt, weekStart),
          lte(tours.scheduledAt, weekEnd)
        )
      );

    // All-time completed tours
    const [completedResult] = await ctx.db
      .select({ count: count() })
      .from(tours)
      .where(
        and(
          eq(tours.organizationId, orgId),
          eq(tours.status, "completed")
        )
      );

    // All-time no-shows
    const [noShowResult] = await ctx.db
      .select({ count: count() })
      .from(tours)
      .where(
        and(
          eq(tours.organizationId, orgId),
          eq(tours.status, "no_show")
        )
      );

    // All-time tours (excluding cancelled)
    const [totalResult] = await ctx.db
      .select({ count: count() })
      .from(tours)
      .where(
        and(
          eq(tours.organizationId, orgId),
          sql`${tours.status} != 'cancelled'`
        )
      );

    // Total visitors
    const [visitorsResult] = await ctx.db
      .select({ count: count() })
      .from(visitors)
      .where(eq(visitors.organizationId, orgId));

    // Active properties
    const [activePropsResult] = await ctx.db
      .select({ count: count() })
      .from(properties)
      .where(
        and(
          eq(properties.organizationId, orgId),
          eq(properties.status, "active")
        )
      );

    const total = totalResult?.count ?? 0;
    const completed = completedResult?.count ?? 0;
    const noShows = noShowResult?.count ?? 0;

    return {
      toursToday: toursTodayResult?.count ?? 0,
      toursThisWeek: toursWeekResult?.count ?? 0,
      conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShows / total) * 100) : 0,
      totalVisitors: visitorsResult?.count ?? 0,
      activeProperties: activePropsResult?.count ?? 0,
    };
  }),

  toursOverTime: protectedProcedure
    .input(
      z.object({
        days: z.number().int().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      const rows = await ctx.db
        .select({
          date: sql<string>`DATE(${tours.scheduledAt})`,
          count: count(),
        })
        .from(tours)
        .where(
          and(
            eq(tours.organizationId, ctx.organization.id),
            gte(tours.scheduledAt, since)
          )
        )
        .groupBy(sql`DATE(${tours.scheduledAt})`)
        .orderBy(sql`DATE(${tours.scheduledAt})`);

      return rows;
    }),

  topProperties: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        propertyId: tours.propertyId,
        propertyName: properties.name,
        propertyAddress: properties.address,
        tourCount: count(),
      })
      .from(tours)
      .innerJoin(properties, eq(tours.propertyId, properties.id))
      .where(eq(tours.organizationId, ctx.organization.id))
      .groupBy(tours.propertyId, properties.name, properties.address)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    return rows;
  }),
});
