import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { tours, properties, visitors, organizations } from "@/server/db/schema";
import { eq, and, gte, lte, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/server/inngest/client";
import { buildAccessUrl, normalizePhone } from "@/lib/utils";
import { addMinutes } from "date-fns";

export const toursRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["scheduled", "access_sent", "in_progress", "completed", "cancelled", "no_show"])
          .optional(),
        propertyId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(tours.organizationId, ctx.organization.id)];

      if (input.status) {
        conditions.push(eq(tours.status, input.status));
      }

      if (input.propertyId) {
        conditions.push(eq(tours.propertyId, input.propertyId));
      }

      const rows = await ctx.db
        .select({
          tour: tours,
          property: properties,
          visitor: visitors,
        })
        .from(tours)
        .innerJoin(properties, eq(tours.propertyId, properties.id))
        .innerJoin(visitors, eq(tours.visitorId, visitors.id))
        .where(and(...conditions))
        .orderBy(desc(tours.scheduledAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  today: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const rows = await ctx.db
      .select({
        tour: tours,
        property: properties,
        visitor: visitors,
      })
      .from(tours)
      .innerJoin(properties, eq(tours.propertyId, properties.id))
      .innerJoin(visitors, eq(tours.visitorId, visitors.id))
      .where(
        and(
          eq(tours.organizationId, ctx.organization.id),
          gte(tours.scheduledAt, startOfDay),
          lte(tours.scheduledAt, endOfDay)
        )
      )
      .orderBy(tours.scheduledAt);

    return rows;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({
          tour: tours,
          property: properties,
          visitor: visitors,
        })
        .from(tours)
        .innerJoin(properties, eq(tours.propertyId, properties.id))
        .innerJoin(visitors, eq(tours.visitorId, visitors.id))
        .where(
          and(
            eq(tours.id, input.id),
            eq(tours.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return row;
    }),

  create: publicProcedure
    .input(
      z.object({
        propertyId: z.string().uuid(),
        orgSlug: z.string(),
        visitorFirstName: z.string().min(1).max(100),
        visitorLastName: z.string().min(1).max(100),
        visitorEmail: z.string().email(),
        visitorPhone: z.string().min(10),
        scheduledAt: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Look up org by slug
      const [org] = await ctx.db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, input.orgSlug))
        .limit(1);

      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      // Look up property
      const [property] = await ctx.db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.id, input.propertyId),
            eq(properties.organizationId, org.id),
            eq(properties.status, "active")
          )
        )
        .limit(1);

      if (!property) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      const scheduledAt = new Date(input.scheduledAt);
      const endsAt = addMinutes(scheduledAt, property.tourDurationMinutes);

      // Conflict detection: check for overlapping tours on same property
      const conflicts = await ctx.db
        .select()
        .from(tours)
        .where(
          and(
            eq(tours.propertyId, property.id),
            sql`${tours.scheduledAt} < ${endsAt.toISOString()} AND ${tours.endsAt} > ${scheduledAt.toISOString()}`
          )
        )
        .limit(1);

      if (conflicts.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This time slot is no longer available",
        });
      }

      // Upsert visitor
      const phone = normalizePhone(input.visitorPhone);
      let visitor = (
        await ctx.db
          .select()
          .from(visitors)
          .where(
            and(
              eq(visitors.organizationId, org.id),
              eq(visitors.email, input.visitorEmail)
            )
          )
          .limit(1)
      )[0];

      if (!visitor) {
        [visitor] = await ctx.db
          .insert(visitors)
          .values({
            organizationId: org.id,
            firstName: input.visitorFirstName,
            lastName: input.visitorLastName,
            email: input.visitorEmail,
            phone,
          })
          .returning();
      }

      // Create tour
      const [tour] = await ctx.db
        .insert(tours)
        .values({
          organizationId: org.id,
          propertyId: property.id,
          visitorId: visitor!.id,
          scheduledAt,
          endsAt,
          status: "scheduled",
        })
        .returning();

      const accessUrl = buildAccessUrl(org.slug, tour!.id);

      // Fire Inngest tour lifecycle event
      await inngest.send({
        name: "tour/booked",
        data: {
          tourId: tour!.id,
          propertyId: property.id,
          visitorId: visitor!.id,
          organizationId: org.id,
          scheduledAt: scheduledAt.toISOString(),
          endsAt: endsAt.toISOString(),
          visitorPhone: phone,
          visitorEmail: input.visitorEmail,
          visitorFirstName: input.visitorFirstName,
          propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
          seamDeviceId: property.seamDeviceId,
          accessUrl,
          orgName: org.name,
          orgLogoUrl: org.logoUrl,
          orgPrimaryColor: org.primaryColor,
        },
      });

      return { tour: tour!, visitor: visitor!, accessUrl };
    }),

  cancel: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [tour] = await ctx.db
        .select()
        .from(tours)
        .where(
          and(
            eq(tours.id, input.id),
            eq(tours.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!tour) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (tour.status === "cancelled") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tour already cancelled" });
      }

      await ctx.db
        .update(tours)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: input.reason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(tours.id, input.id));

      // Notify Inngest to cancel the lifecycle
      await inngest.send({
        name: "tour/cancelled",
        data: { tourId: input.id, reason: input.reason },
      });

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["scheduled", "access_sent", "in_progress", "completed", "cancelled", "no_show"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [tour] = await ctx.db
        .select()
        .from(tours)
        .where(
          and(
            eq(tours.id, input.id),
            eq(tours.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!tour) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(tours)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(tours.id, input.id))
        .returning();

      return updated;
    }),

  // Public: get tour for access code display page
  getPublic: publicProcedure
    .input(z.object({ tourId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({
          tour: tours,
          property: properties,
          visitor: visitors,
        })
        .from(tours)
        .innerJoin(properties, eq(tours.propertyId, properties.id))
        .innerJoin(visitors, eq(tours.visitorId, visitors.id))
        .where(eq(tours.id, input.tourId))
        .limit(1);

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Return limited data for public access
      return {
        id: row.tour.id,
        status: row.tour.status,
        scheduledAt: row.tour.scheduledAt,
        endsAt: row.tour.endsAt,
        accessCode: row.tour.accessCode,
        propertyAddress: `${row.property.address}`,
        propertyCity: row.property.city,
        visitorFirstName: row.visitor.firstName,
      };
    }),
});
