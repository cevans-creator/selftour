export interface LockStatus {
  locked: boolean | null;
  battery: number | null;
  online: boolean;
}

export interface LockDevice {
  deviceId: string;
  name: string;
  type: string;
  connected: boolean;
  locked: boolean | null;
  batteryLevel: number | null;
}

export interface LockProvider {
  createAccessCode(deviceId: string, code: string, startsAt: Date, endsAt: Date): Promise<string>;
  deleteAccessCode(accessCodeId: string): Promise<void>;
  getLockStatus(deviceId: string): Promise<LockStatus>;
  lockDoor(deviceId: string): Promise<void>;
  unlockDoor(deviceId: string): Promise<void>;
  listDevices(): Promise<LockDevice[]>;
}
