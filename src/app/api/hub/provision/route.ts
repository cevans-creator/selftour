import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { hubs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

function generateClaimCode(): string {
  const hex = randomBytes(2).toString("hex").toUpperCase();
  return `KS-${hex}`;
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey || apiKey !== process.env.PROVISION_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hostname } = (await req.json()) as { hostname: string };
  if (!hostname) {
    return NextResponse.json({ error: "Missing hostname" }, { status: 400 });
  }

  const authToken = randomBytes(32).toString("hex");
  const authTokenHash = createHash("sha256").update(authToken).digest("hex");

  // Generate unique claim code (retry on collision)
  let claimCode: string;
  for (let i = 0; i < 10; i++) {
    claimCode = generateClaimCode();
    const [existing] = await db
      .select({ id: hubs.id })
      .from(hubs)
      .where(eq(hubs.claimCode, claimCode))
      .limit(1);
    if (!existing) break;
  }

  const [hub] = await db
    .insert(hubs)
    .values({
      organizationId: null, // unclaimed
      name: hostname,
      hostname,
      authTokenHash,
      claimCode: claimCode!,
    })
    .returning();

  return NextResponse.json({
    hubId: hub!.id,
    authToken,
    claimCode: claimCode!,
  });
}
