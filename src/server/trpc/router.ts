import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// ─── Procedures ────────────────────────────────────────────────────────────────

/** Public procedure — no auth required */
export const publicProcedure = t.procedure;

/** Protected procedure — requires authenticated user + org membership */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.organization) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      organization: ctx.organization,
      memberRole: ctx.memberRole,
    },
  });
});

/** Admin-only procedure */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.memberRole !== "owner" && ctx.memberRole !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

// ─── Root router ──────────────────────────────────────────────────────────────

import { propertiesRouter } from "./routers/properties";
import { toursRouter } from "./routers/tours";
import { visitorsRouter } from "./routers/visitors";
import { messagingRouter } from "./routers/messaging";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = createTRPCRouter({
  properties: propertiesRouter,
  tours: toursRouter,
  visitors: visitorsRouter,
  messaging: messagingRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
