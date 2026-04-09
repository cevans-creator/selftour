import "server-only";
import { db } from "@/server/db/client";
import { hubCommands, hubs, properties } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { LockProvider, LockStatus, LockDevice } from "../types";

const COMMAND_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

async function waitForResult(commandId: string): Promise<Record<string, unknown>> {
  const deadline = Date.now() + COMMAND_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const [cmd] = await db
      .select()
      .from(hubCommands)
      .where(eq(hubCommands.id, commandId))
      .limit(1);

    if (!cmd) throw new Error("Command not found");
    if (cmd.status === "completed") return (cmd.result as Record<string, unknown>) ?? {};
    if (cmd.status === "failed") throw new Error(cmd.error ?? "Command failed on hub");

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  // Mark timed out
  await db
    .update(hubCommands)
    .set({ status: "failed", error: "Timed out waiting for hub response", completedAt: new Date() })
    .where(eq(hubCommands.id, commandId));
  throw new Error("Hub command timed out — is the hub online?");
}

async function issueCommand(
  hubId: string,
  commandType: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const [cmd] = await db
    .insert(hubCommands)
    .values({ hubId, commandType, payload, status: "pending" })
    .returning();
  if (!cmd) throw new Error("Failed to insert hub command");
  return waitForResult(cmd.id);
}

function parseDeviceId(deviceId: string): { hubId: string; nodeId: number } {
  const [hubId, nodeStr] = deviceId.split(":");
  if (!hubId || !nodeStr) throw new Error(`Invalid Pi deviceId format: ${deviceId}`);
  return { hubId, nodeId: parseInt(nodeStr, 10) };
}

export const piProvider: LockProvider = {
  async createAccessCode(deviceId, code, startsAt, endsAt) {
    const { hubId, nodeId } = parseDeviceId(deviceId);
    const result = await issueCommand(hubId, "create_code", {
      nodeId,
      code,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
    const slot = result.slot as number;
    return `pi:${hubId}:${nodeId}:${slot}`;
  },

  async deleteAccessCode(accessCodeId) {
    // Format: pi:hubId:nodeId:slot
    const parts = accessCodeId.split(":");
    if (parts.length !== 4 || parts[0] !== "pi") {
      throw new Error(`Invalid Pi accessCodeId: ${accessCodeId}`);
    }
    const [, hubId, nodeStr, slotStr] = parts;
    await issueCommand(hubId!, "delete_code", {
      nodeId: parseInt(nodeStr!, 10),
      slot: parseInt(slotStr!, 10),
    });
  },

  async getLockStatus(deviceId): Promise<LockStatus> {
    const { hubId } = parseDeviceId(deviceId);

    // Check hub online status from last_seen_at (no round-trip to Pi)
    const [hub] = await db.select().from(hubs).where(eq(hubs.id, hubId)).limit(1);
    const online = hub?.lastSeenAt
      ? Date.now() - hub.lastSeenAt.getTime() < 60_000
      : false;

    // Get last completed get_status result from hub_commands (cached)
    const [lastStatus] = await db
      .select()
      .from(hubCommands)
      .where(
        and(
          eq(hubCommands.hubId, hubId),
          eq(hubCommands.commandType, "get_status"),
          eq(hubCommands.status, "completed"),
        )
      )
      .orderBy(desc(hubCommands.completedAt))
      .limit(1);

    const result = (lastStatus?.result as Record<string, unknown>) ?? {};

    return {
      locked: (result.locked as boolean | null) ?? null,
      battery: (result.battery as number | null) ?? null,
      online,
    };
  },

  async lockDoor(deviceId) {
    const { hubId, nodeId } = parseDeviceId(deviceId);
    await issueCommand(hubId, "lock", { nodeId });
  },

  async unlockDoor(deviceId) {
    const { hubId, nodeId } = parseDeviceId(deviceId);
    await issueCommand(hubId, "unlock", { nodeId });
  },

  async listDevices(): Promise<LockDevice[]> {
    // Return Pi-connected properties as devices
    const rows = await db
      .select({
        hub: hubs,
        property: properties,
      })
      .from(hubs)
      .leftJoin(properties, eq(hubs.propertyId, properties.id));

    return rows.map((r) => ({
      deviceId: r.property?.seamDeviceId ?? `${r.hub.id}:unknown`,
      name: r.hub.name,
      type: "pi_zwave",
      connected: r.hub.lastSeenAt
        ? Date.now() - r.hub.lastSeenAt.getTime() < 5 * 60 * 1000
        : false,
      locked: null,
      batteryLevel: null,
    }));
  },
};
