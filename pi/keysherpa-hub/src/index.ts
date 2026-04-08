import "dotenv/config";
import { ZWaveClient } from "./zwave";

const HUB_ID = process.env.HUB_ID!;
const AUTH_TOKEN = process.env.AUTH_TOKEN!;
const API_BASE = process.env.API_BASE ?? "https://www.keysherpa.io";
const ZWAVE_DEVICE = process.env.ZWAVE_DEVICE ?? "/dev/ttyUSB0";
const POLL_INTERVAL_MS = 2000;

interface HubCommand {
  id: string;
  commandType: string;
  payload: Record<string, unknown>;
}

async function fetchCommands(): Promise<HubCommand[]> {
  const url = `${API_BASE}/api/hub/commands?hubId=${HUB_ID}&token=${AUTH_TOKEN}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
  const data = (await res.json()) as { commands: HubCommand[] };
  return data.commands;
}

async function postResult(
  commandId: string,
  success: boolean,
  result?: Record<string, unknown>,
  error?: string
) {
  await fetch(`${API_BASE}/api/hub/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hubId: HUB_ID, token: AUTH_TOKEN, commandId, success, result, error }),
  });
}

async function main() {
  if (!HUB_ID || !AUTH_TOKEN) {
    throw new Error("Missing HUB_ID or AUTH_TOKEN environment variables");
  }

  console.log("[KeySherpa Hub] Starting Z-Wave driver...");
  const zwave = new ZWaveClient(ZWAVE_DEVICE);
  await zwave.start();
  console.log("[KeySherpa Hub] Z-Wave ready. Polling for commands...");

  // Main poll loop
  while (true) {
    try {
      const commands = await fetchCommands();

      for (const cmd of commands) {
        console.log(`[KeySherpa Hub] Executing: ${cmd.commandType}`, cmd.payload);
        try {
          const result = await zwave.execute(cmd.commandType, cmd.payload);
          await postResult(cmd.id, true, result);
          console.log(`[KeySherpa Hub] ✓ ${cmd.commandType} complete`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[KeySherpa Hub] ✗ ${cmd.commandType} failed: ${message}`);
          await postResult(cmd.id, false, undefined, message);
        }
      }
    } catch (err) {
      console.error("[KeySherpa Hub] Poll error:", err instanceof Error ? err.message : err);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error("[KeySherpa Hub] Fatal error:", err);
  process.exit(1);
});
