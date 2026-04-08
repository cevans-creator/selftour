import "server-only";
import { seamProvider } from "./providers/seam";
import { piProvider } from "./providers/pi";
import type { LockProvider, LockStatus, LockDevice } from "./types";
export type { LockStatus, LockDevice } from "./types";

// Re-export generateAccessCode from seam (it's provider-agnostic)
export { generateAccessCode } from "@/server/seam/locks";

/**
 * Returns the correct provider based on deviceId format.
 * Pi deviceIds contain ":" (e.g. "hubId:nodeId").
 * Seam deviceIds are plain UUIDs.
 */
export function getProvider(deviceId: string): LockProvider {
  return deviceId.includes(":") ? piProvider : seamProvider;
}

export async function createTourAccessCode(
  deviceId: string,
  code: string,
  startsAt: Date,
  endsAt: Date
): Promise<string> {
  return getProvider(deviceId).createAccessCode(deviceId, code, startsAt, endsAt);
}

export async function deleteTourAccessCode(accessCodeId: string): Promise<void> {
  // Route by prefix; unprefixed = legacy Seam
  if (accessCodeId.startsWith("pi:")) {
    return piProvider.deleteAccessCode(accessCodeId);
  }
  return seamProvider.deleteAccessCode(accessCodeId);
}

export async function getLockStatus(deviceId: string): Promise<LockStatus> {
  return getProvider(deviceId).getLockStatus(deviceId);
}

export async function lockDoor(deviceId: string): Promise<void> {
  return getProvider(deviceId).lockDoor(deviceId);
}

export async function unlockDoor(deviceId: string): Promise<void> {
  return getProvider(deviceId).unlockDoor(deviceId);
}

export async function listDevices(): Promise<LockDevice[]> {
  const [seamDevices, piDevices] = await Promise.allSettled([
    seamProvider.listDevices(),
    piProvider.listDevices(),
  ]);
  return [
    ...(seamDevices.status === "fulfilled" ? seamDevices.value : []),
    ...(piDevices.status === "fulfilled" ? piDevices.value : []),
  ];
}
