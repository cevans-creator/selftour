import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../router";
import { visitors, tours, properties } from "@/server/db/schema";
import { eq, and, ilike, or, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const visitorsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(visitors.organizationId, ctx.organization.id)];

      if (input.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(
            ilike(visitors.firstName, term),
            ilike(visitors.lastName, term),
            ilike(visitors.email, term),
            ilike(visitors.phone, term)
          )!
        );
      }

      const rows = await ctx.db
        .select()
        .from(visitors)
        .where(and(...conditions))
        .orderBy(desc(visitors.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [visitor] = await ctx.db
        .select()
        .from(visitors)
        .where(
          and(
            eq(visitors.id, input.id),
            eq(visitors.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!visitor) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return visitor;
    }),

  tourHistory: protectedProcedure
    .input(z.object({ visitorId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          tour: tours,
          property: properties,
        })
        .from(tours)
        .innerJoin(properties, eq(tours.propertyId, properties.id))
        .where(
          and(
            eq(tours.visitorId, input.visitorId),
            eq(tours.organizationId, ctx.organization.id)
          )
        )
        .orderBy(desc(tours.scheduledAt));

      return rows;
    }),

  updateVerification: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        idVerificationMethod: z.enum(["stripe_identity", "manual", "none"]),
        idVerificationStatus: z.enum(["pending", "verified", "failed"]).optional(),
        stripeIdentitySessionId: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [visitor] = await ctx.db
        .select()
        .from(visitors)
        .where(
          and(
            eq(visitors.id, input.id),
            eq(visitors.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!visitor) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(visitors)
        .set({
          idVerificationMethod: input.idVerificationMethod,
          idVerificationStatus: input.idVerificationStatus ?? null,
          stripeIdentitySessionId: input.stripeIdentitySessionId ?? null,
          notes: input.notes ?? visitor.notes,
          updatedAt: new Date(),
        })
        .where(eq(visitors.id, input.id))
        .returning();

      return updated;
    }),
});
