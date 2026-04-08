import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { properties, communities, tours } from "@/server/db/schema";
import { eq, and, count, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getLockStatus } from "@/server/locks";

const propertyInputSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zip: z.string().min(1).max(20),
  type: z.enum(["single_family", "condo", "townhome", "apartment", "land"]),
  status: z.enum(["active", "inactive", "sold", "pending"]),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.string().optional(),
  squareFeet: z.number().int().min(0).optional(),
  price: z.number().int().min(0).optional(),
  description: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  seamDeviceId: z.string().optional(),
  tourDurationMinutes: z.number().int().min(15).max(120).default(30),
  bufferMinutes: z.number().int().min(0).max(60).default(10),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  availableDays: z.array(z.number().int().min(0).max(6)).optional(),
  communityId: z.string().uuid().optional(),
});

export const propertiesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(properties)
      .where(eq(properties.organizationId, ctx.organization.id))
      .orderBy(properties.createdAt);

    return rows;
  }),

  listWithCommunities: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        property: properties,
        community: communities,
      })
      .from(properties)
      .leftJoin(communities, eq(properties.communityId, communities.id))
      .where(eq(properties.organizationId, ctx.organization.id))
      .orderBy(properties.name);

    return rows;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [property] = await ctx.db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.id, input.id),
            eq(properties.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!property) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      return property;
    }),

  getWithLockStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [property] = await ctx.db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.id, input.id),
            eq(properties.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!property) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      let lockStatus = null;
      if (property.seamDeviceId) {
        try {
          lockStatus = await getLockStatus(property.seamDeviceId);
        } catch {
          lockStatus = { locked: null, battery: null, online: false };
        }
      }

      return { property, lockStatus };
    }),

  create: adminProcedure
    .input(propertyInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [property] = await ctx.db
        .insert(properties)
        .values({
          organizationId: ctx.organization.id,
          ...input,
          imageUrls: input.imageUrls ?? [],
          availableDays: input.availableDays ?? [1, 2, 3, 4, 5],
        })
        .returning();

      return property;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: propertyInputSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.id, input.id),
            eq(properties.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(properties)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(properties.id, input.id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.id, input.id),
            eq(properties.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.delete(properties).where(eq(properties.id, input.id));

      return { success: true };
    }),

  // Public: list active properties for visitor-facing tour page
  listPublic: protectedProcedure
    .input(z.object({ orgSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.organizationId, ctx.organization.id),
            eq(properties.status, "active")
          )
        )
        .orderBy(properties.name);

      return rows;
    }),
});
