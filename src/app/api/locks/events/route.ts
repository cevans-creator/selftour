import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { orgMembers, organizations, properties, hubs, hubCommands } from "@/server/db/schema";
import { eq, and, inArray, isNotNull, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
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

  const deviceId = req.nextUrl.searchParams.get("deviceId");

  try {
    const allEvents: Array<{
      eventId: string;
      eventType: string;
      deviceId: string;
      deviceName: string;
      propertyName: string | null;
      occurredAt: string;
      accessCodeId: string | null;
    }> = [];

    // ── Pi hub events from hub_commands table ──
    const orgHubs = await db
      .select({ hub: hubs, property: properties })
      .from(hubs)
      .leftJoin(properties, eq(hubs.propertyId, properties.id))
      .where(eq(hubs.organizationId, membership.org.id));

    for (const { hub, property } of orgHubs) {
      const hubDeviceId = property?.seamDeviceId ?? `${hub.id}:unknown`;

      // Skip if filtering by deviceId and this doesn't match
      if (deviceId && hubDeviceId !== deviceId) continue;

      const commands = await db
        .select()
        .from(hubCommands)
        .where(eq(hubCommands.hubId, hub.id))
        .orderBy(desc(hubCommands.createdAt))
        .limit(50);

      for (const cmd of commands) {
        // Map command types to event types
        let eventType = "";
        switch (cmd.commandType) {
          case "create_code": eventType = cmd.status === "completed" ? "access_code.created" : ""; break;
          case "delete_code": eventType = cmd.status === "completed" ? "access_code.deleted" : ""; break;
          case "lock": eventType = cmd.status === "completed" ? "lock.locked" : ""; break;
          case "unlock": eventType = cmd.status === "completed" ? "lock.unlocked" : ""; break;
          case "get_status": continue; // Skip status checks
          case "pair_lock": eventType = cmd.status === "completed" ? "access_code.set_on_device" : ""; break;
          default: continue;
        }

        if (!eventType) {
          // Show failed commands too
          if (cmd.status === "failed") {
            eventType = `${cmd.commandType}.failed`;
          } else {
            continue;
          }
        }

        allEvents.push({
          eventId: cmd.id,
          eventType,
          deviceId: hubDeviceId,
          deviceName: hub.name,
          propertyName: property?.name ?? null,
          occurredAt: (cmd.completedAt ?? cmd.createdAt).toISOString(),
          accessCodeId: cmd.commandType === "create_code" || cmd.commandType === "delete_code"
            ? (cmd.result as Record<string, unknown>)?.slot?.toString() ?? null
            : null,
        });
      }
    }

    // ── Seam events (if Seam is configured) ──
    try {
      const { getSeamClient } = await import("@/server/seam/client");
      const seam = getSeamClient();
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [events, devices] = await Promise.all([
        seam.events.list({
          ...(deviceId && !deviceId.includes(":") ? { device_id: deviceId } : {}),
          event_types: [
            "lock.locked",
            "lock.unlocked",
            "access_code.set_on_device",
            "access_code.created",
            "access_code.deleted",
          ],
          since,
          limit: 50,
        }),
        seam.devices.list({}),
      ]);

      const deviceNameMap = new Map(
        devices.map((d) => [d.device_id, d.display_name ?? d.device_id])
      );

      const deviceIds = devices.map((d) => d.device_id);
      const assignedProperties = deviceIds.length > 0
        ? await db
            .select({ seamDeviceId: properties.seamDeviceId, name: properties.name })
            .from(properties)
            .where(and(
              eq(properties.organizationId, membership.org.id),
              isNotNull(properties.seamDeviceId),
              inArray(properties.seamDeviceId, deviceIds),
            ))
        : [];

      const propertyNameMap = new Map(
        assignedProperties.map((p) => [p.seamDeviceId!, p.name])
      );

      for (const e of events) {
        const evt = e as Record<string, unknown>;
        const evtDeviceId = (evt.device_id as string) ?? "unknown";
        allEvents.push({
          eventId: e.event_id,
          eventType: e.event_type,
          deviceId: evtDeviceId,
          deviceName: deviceNameMap.get(evtDeviceId) ?? evtDeviceId ?? "Unknown device",
          propertyName: propertyNameMap.get(evtDeviceId) ?? null,
          occurredAt: e.occurred_at,
          accessCodeId: (evt.access_code_id as string) ?? null,
        });
      }
    } catch {
      // Seam not configured — that's fine, Pi events are enough
    }

    // Sort all events by date descending
    allEvents.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return NextResponse.json({ events: allEvents.slice(0, 50) });
  } catch (err) {
    console.error("[Lock Events] Error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
