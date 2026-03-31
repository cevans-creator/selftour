import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { messageTemplates } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const MESSAGE_TRIGGERS = [
  "tour_booked",
  "reminder_24h",
  "reminder_1h",
  "access_code_sent",
  "tour_started",
  "tour_ending",
  "tour_completed",
  "no_show",
  "follow_up_1h",
  "follow_up_24h",
  "nurture_72h",
] as const;

const MESSAGE_CHANNELS = ["sms", "email"] as const;

export const messagingRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.organizationId, ctx.organization.id))
      .orderBy(messageTemplates.trigger);

    return rows;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .select()
        .from(messageTemplates)
        .where(
          and(
            eq(messageTemplates.id, input.id),
            eq(messageTemplates.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return template;
    }),

  create: adminProcedure
    .input(
      z.object({
        trigger: z.enum(MESSAGE_TRIGGERS),
        channel: z.enum(MESSAGE_CHANNELS),
        subject: z.string().max(255).optional(),
        body: z.string().min(1),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .insert(messageTemplates)
        .values({
          organizationId: ctx.organization.id,
          ...input,
        })
        .returning();

      return template;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        subject: z.string().max(255).optional(),
        body: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(messageTemplates)
        .where(
          and(
            eq(messageTemplates.id, input.id),
            eq(messageTemplates.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const { id, ...data } = input;

      const [updated] = await ctx.db
        .update(messageTemplates)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(messageTemplates.id, id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(messageTemplates)
        .where(
          and(
            eq(messageTemplates.id, input.id),
            eq(messageTemplates.organizationId, ctx.organization.id)
          )
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .delete(messageTemplates)
        .where(eq(messageTemplates.id, input.id));

      return { success: true };
    }),

  // Get available template variables for preview
  getVariables: protectedProcedure.query(() => {
    return {
      visitor: [
        { key: "visitor_first_name", label: "Visitor First Name", example: "Sarah" },
        { key: "visitor_last_name", label: "Visitor Last Name", example: "Johnson" },
        { key: "visitor_email", label: "Visitor Email", example: "sarah@example.com" },
        { key: "visitor_phone", label: "Visitor Phone", example: "(555) 123-4567" },
      ],
      property: [
        { key: "property_address", label: "Property Address", example: "123 Oak St" },
        { key: "property_city", label: "City", example: "Austin" },
        { key: "property_state", label: "State", example: "TX" },
      ],
      tour: [
        { key: "tour_date", label: "Tour Date", example: "Monday, Jan 6" },
        { key: "tour_time", label: "Tour Time", example: "2:00 PM" },
        { key: "tour_duration", label: "Duration (min)", example: "30" },
        { key: "access_code", label: "Access Code", example: "7842" },
        { key: "access_url", label: "Access Page URL", example: "https://..." },
      ],
      org: [
        { key: "org_name", label: "Organization Name", example: "Sunrise Homes" },
      ],
    };
  }),
});
