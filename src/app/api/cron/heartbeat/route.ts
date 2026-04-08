import { NextRequest, NextResponse } from "next/server";
import { listDevices } from "@/server/locks";
import { db } from "@/server/db/client";
import { properties, organizations } from "@/server/db/schema";
import { isNotNull, eq } from "drizzle-orm";

/**
 * Heartbeat / health check endpoint.
 * Called by Vercel Cron on a schedule (e.g., every 15 minutes).
 * Checks all connected lock devices and logs any issues.
 *
 * Protected by a shared secret in the Authorization header.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.NODE_ENV === "production" && authHeader !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    timestamp: new Date().toISOString(),
    devicesChecked: 0,
    offline: [] as string[],
    lowBattery: [] as string[],
    errors: [] as string[],
  };

  try {
    // Fetch all properties with Seam device IDs
    const connectedProps = await db
      .select({
        id: properties.id,
        address: properties.address,
        seamDeviceId: properties.seamDeviceId,
        orgId: properties.organizationId,
      })
      .from(properties)
      .where(isNotNull(properties.seamDeviceId));

    for (const prop of connectedProps) {
      if (!prop.seamDeviceId) continue;

      try {
        const { getLockStatus } = await import("@/server/locks");
        const status = await getLockStatus(prop.seamDeviceId);
        results.devicesChecked++;

        if (!status.online) {
          results.offline.push(`${prop.address} (${prop.seamDeviceId})`);
        } else if (status.battery !== null && status.battery < 0.2) {
          results.lowBattery.push(
            `${prop.address} (${Math.round(status.battery * 100)}%)`
          );
        }
      } catch (err) {
        results.errors.push(
          `${prop.address}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    const isHealthy = results.offline.length === 0 && results.errors.length === 0;

    return NextResponse.json({
      status: isHealthy ? "healthy" : "degraded",
      ...results,
    });
  } catch (err) {
    console.error("[Heartbeat] Fatal error:", err);
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        ...results,
      },
      { status: 500 }
    );
  }
}
