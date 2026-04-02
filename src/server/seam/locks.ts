import "server-only";
import { getSeamClient } from "./client";
import { BANNED_ACCESS_CODES } from "@/lib/constants";
import type { SeamDevice } from "@/types";

// ─── Access code management ───────────────────────────────────────────────────

/**
 * Create a time-limited access code on a Seam-connected lock.
 * Returns the Seam access_code ID for later deletion.
 */
export async function createTourAccessCode(
  deviceId: string,
  code: string,
  startsAt: Date,
  endsAt: Date
): Promise<string> {
  const result = await getSeamClient().accessCodes.create({
    device_id: deviceId,
    name: `Tour ${startsAt.toISOString()}`,
    code,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  });

  return result.access_code_id;
}

/**
 * Remove an access code from a lock. Safe to call even if already deleted.
 */
export async function deleteTourAccessCode(accessCodeId: string): Promise<void> {
  try {
    await getSeamClient().accessCodes.delete({ access_code_id: accessCodeId });
  } catch (err) {
    // If already deleted or not found, treat as success
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("not_found") && !message.includes("already")) {
      throw err;
    }
  }
}

// ─── Lock status ──────────────────────────────────────────────────────────────

export async function getLockStatus(
  deviceId: string
): Promise<{ locked: boolean; battery: number | null; online: boolean }> {
  const device = await getSeamClient().devices.get({ device_id: deviceId });

  const locked =
    (device.properties as Record<string, unknown>).locked === true;
  const battery =
    typeof (device.properties as Record<string, unknown>).battery_level === "number"
      ? ((device.properties as Record<string, unknown>).battery_level as number)
      : null;
  const online = device.properties.online ?? false;

  return { locked, battery, online };
}

export async function lockDoor(deviceId: string): Promise<void> {
  await getSeamClient().locks.lockDoor({ device_id: deviceId });
}

export async function unlockDoor(deviceId: string): Promise<void> {
  await getSeamClient().locks.unlockDoor({ device_id: deviceId });
}

// ─── Device listing ───────────────────────────────────────────────────────────

export async function listDevices(): Promise<SeamDevice[]> {
  const devices = await getSeamClient().devices.list({});

  return devices.map((d) => ({
    deviceId: d.device_id,
    name: d.display_name ?? d.device_id,
    type: d.device_type ?? "unknown",
    connected: d.properties.online ?? false,
    locked:
      typeof (d.properties as Record<string, unknown>).locked === "boolean"
        ? ((d.properties as Record<string, unknown>).locked as boolean)
        : null,
    batteryLevel:
      typeof (d.properties as Record<string, unknown>).battery_level === "number"
        ? ((d.properties as Record<string, unknown>).battery_level as number)
        : null,
  }));
}

// ─── Access code generation ───────────────────────────────────────────────────

/**
 * Generate a random 4-digit PIN that avoids trivially guessable codes.
 */
export function generateAccessCode(): string {
  let code: string;
  let attempts = 0;

  do {
    const num = Math.floor(Math.random() * 10000);
    code = num.toString().padStart(4, "0");
    attempts++;

    // Avoid codes where all digits are the same (1111, 2222…)
    const allSame = /^(\d)\1{3}$/.test(code);
    // Avoid sequential codes (1234, 2345, etc.)
    const isSequential = isSequentialCode(code);

    if (!BANNED_ACCESS_CODES.includes(code) && !allSame && !isSequential) {
      break;
    }
  } while (attempts < 100);

  return code;
}

function isSequentialCode(code: string): boolean {
  const digits = code.split("").map(Number);
  let ascending = true;
  let descending = true;

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== (digits[i - 1]! + 1) % 10) ascending = false;
    if (digits[i] !== (digits[i - 1]! - 1 + 10) % 10) descending = false;
  }

  return ascending || descending;
}
