export { createTRPCRouter, createCallerFactory, publicProcedure, protectedProcedure, adminProcedure } from "./trpc";

import { createTRPCRouter } from "./trpc";
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
