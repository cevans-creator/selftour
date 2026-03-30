import "server-only";
import { db } from "@/server/db/client";
import { tours, tourEvents, properties } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

interface SeamWebhookEvent {
  event_id: string;
  event_type: string;
  device_id?: string;
  access_code_id?: string;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Process a validated Seam webhook event.
 * Updates tour status and logs tour_events.
 */
export async function processSeamEvent(event: SeamWebhookEvent): Promise<void> {
  const { event_type, device_id, access_code_id } = event;

  switch (event_type) {
    case "lock.unlocked":
      await handleDoorUnlocked(device_id!, event);
      break;

    case "lock.locked":
      await handleDoorLocked(device_id!, event);
      break;

    case "access_code.set":
      // Confirmation that code was successfully pushed to device
      await handleAccessCodeSet(access_code_id!, device_id!, event);
      break;

    case "device.low_battery":
      await handleLowBattery(device_id!, event);
      break;

    case "device.disconnected":
      await handleDeviceDisconnected(device_id!, event);
      break;

    default:
      console.log("[Seam] Unhandled event type:", event_type);
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function findActiveTourByDevice(deviceId: string) {
  // Find the property associated with this device
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.seamDeviceId, deviceId))
    .limit(1);

  if (!property) return null;

  // Find an in-progress or access_sent tour for this property
  const [tour] = await db
    .select()
    .from(tours)
    .where(
      and(
        eq(tours.propertyId, property.id),
        eq(tours.status, "access_sent")
      )
    )
    .orderBy(tours.scheduledAt)
    .limit(1);

  return tour ?? null;
}

async function handleDoorUnlocked(
  deviceId: string,
  event: SeamWebhookEvent
): Promise<void> {
  const tour = await findActiveTourByDevice(deviceId);
  if (!tour) return;

  // Update tour status to in_progress when door is first unlocked
  if (tour.status === "access_sent") {
    await db
      .update(tours)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(tours.id, tour.id));
  }

  await db.insert(tourEvents).values({
    tourId: tour.id,
    eventType: "door_unlocked",
    payload: { device_id: deviceId, seam_event_id: event.event_id },
  });
}

async function handleDoorLocked(
  deviceId: string,
  event: SeamWebhookEvent
): Promise<void> {
  const tour = await findActiveTourByDevice(deviceId);
  if (!tour) return;

  await db.insert(tourEvents).values({
    tourId: tour.id,
    eventType: "door_locked",
    payload: { device_id: deviceId, seam_event_id: event.event_id },
  });
}

async function handleAccessCodeSet(
  accessCodeId: string,
  deviceId: string,
  event: SeamWebhookEvent
): Promise<void> {
  // Find tour by access code ID
  const [tour] = await db
    .select()
    .from(tours)
    .where(eq(tours.seamAccessCodeId, accessCodeId))
    .limit(1);

  if (!tour) return;

  await db.insert(tourEvents).values({
    tourId: tour.id,
    eventType: "access_code_created",
    payload: {
      access_code_id: accessCodeId,
      device_id: deviceId,
      seam_event_id: event.event_id,
    },
  });
}

async function handleLowBattery(
  deviceId: string,
  event: SeamWebhookEvent
): Promise<void> {
  const tour = await findActiveTourByDevice(deviceId);
  if (!tour) {
    // Still log even if no active tour
    console.warn("[Seam] Low battery on device:", deviceId);
    return;
  }

  await db.insert(tourEvents).values({
    tourId: tour.id,
    eventType: "hub_low_battery",
    payload: {
      device_id: deviceId,
      battery_level: event.battery_level,
      seam_event_id: event.event_id,
    },
  });
}

async function handleDeviceDisconnected(
  deviceId: string,
  event: SeamWebhookEvent
): Promise<void> {
  const tour = await findActiveTourByDevice(deviceId);

  if (tour) {
    await db.insert(tourEvents).values({
      tourId: tour.id,
      eventType: "hub_offline",
      payload: {
        device_id: deviceId,
        seam_event_id: event.event_id,
      },
    });
  }

  console.warn("[Seam] Device disconnected:", deviceId);
}
