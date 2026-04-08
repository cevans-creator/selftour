import "server-only";
import {
  createTourAccessCode as seamCreate,
  deleteTourAccessCode as seamDelete,
  getLockStatus as seamStatus,
  lockDoor as seamLock,
  unlockDoor as seamUnlock,
  listDevices as seamList,
} from "@/server/seam/locks";
import type { LockProvider, LockStatus, LockDevice } from "../types";

export const seamProvider: LockProvider = {
  async createAccessCode(deviceId, code, startsAt, endsAt) {
    const id = await seamCreate(deviceId, code, startsAt, endsAt);
    return `seam:${id}`;
  },
  async deleteAccessCode(accessCodeId) {
    // Strip "seam:" prefix if present
    const id = accessCodeId.startsWith("seam:") ? accessCodeId.slice(5) : accessCodeId;
    await seamDelete(id);
  },
  async getLockStatus(deviceId): Promise<LockStatus> {
    return seamStatus(deviceId);
  },
  async lockDoor(deviceId) {
    await seamLock(deviceId);
  },
  async unlockDoor(deviceId) {
    await seamUnlock(deviceId);
  },
  async listDevices(): Promise<LockDevice[]> {
    return seamList();
  },
};
