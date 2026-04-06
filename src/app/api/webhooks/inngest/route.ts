import { serve } from "inngest/next";
import { inngest } from "@/server/inngest/client";
import { tourLifecycle } from "@/server/inngest/functions/tour-lifecycle";
import { hubHealthCheck } from "@/server/inngest/functions/hub-health-check";
import { tourCancelled } from "@/server/inngest/functions/tour-cancelled";

/**
 * Inngest webhook handler.
 * Registers all background job functions with the Inngest platform.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [tourLifecycle, hubHealthCheck, tourCancelled],
});
