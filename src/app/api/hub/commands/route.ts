import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { hubs, hubCommands } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";

async function verifyHub(hubId: string, authToken: string) {
  const [hub] = await db.select().from(hubs).where(eq(hubs.id, hubId)).limit(1);
  if (!hub) return null;
  const tokenHash = createHash("sha256").update(authToken).digest("hex");
  if (tokenHash !== hub.authTokenHash) return null;
  return hub;
}

// GET /api/hub/commands?hubId=xxx&token=xxx
// Returns all pending commands for this hub
export async function GET(req: NextRequest) {
  const hubId = req.nextUrl.searchParams.get("hubId");
  const token = req.nextUrl.searchParams.get("token");
  if (!hubId || !token) return NextResponse.json({ error: "Missing hubId or token" }, { status: 400 });

  const hub = await verifyHub(hubId, token);
  if (!hub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Update lastSeenAt
  await db.update(hubs).set({ lastSeenAt: new Date() }).where(eq(hubs.id, hubId));

  // Fetch pending commands
  const commands = await db
    .select()
    .from(hubCommands)
    .where(and(eq(hubCommands.hubId, hubId), eq(hubCommands.status, "pending")));

  // Mark them as executing
  if (commands.length > 0) {
    for (const cmd of commands) {
      await db
        .update(hubCommands)
        .set({ status: "executing" })
        .where(eq(hubCommands.id, cmd.id));
    }
  }

  return NextResponse.json({ commands });
}

// POST /api/hub/commands — Pi posts result for a command
export async function POST(req: NextRequest) {
  const { hubId, token, commandId, success, result, error } = (await req.json()) as {
    hubId: string;
    token: string;
    commandId: string;
    success: boolean;
    result?: Record<string, unknown>;
    error?: string;
  };

  if (!hubId || !token || !commandId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const hub = await verifyHub(hubId, token);
  if (!hub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(hubCommands)
    .set({
      status: success ? "completed" : "failed",
      result: result ?? null,
      error: error ?? null,
      completedAt: new Date(),
    })
    .where(and(eq(hubCommands.id, commandId), eq(hubCommands.hubId, hubId)));

  return NextResponse.json({ ok: true });
}
