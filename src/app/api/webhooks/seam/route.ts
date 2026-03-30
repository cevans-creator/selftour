import { NextRequest, NextResponse } from "next/server";
import { processSeamEvent } from "@/server/seam/webhooks";
import crypto from "crypto";

/**
 * Handle Seam webhook events.
 * Seam signs webhook payloads with HMAC-SHA256 using your webhook secret.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("seam-signature");
    const webhookSecret = process.env.SEAM_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const sigBuffer = Buffer.from(signature, "hex");
      const expectedBuffer = Buffer.from(expectedSig, "hex");

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        console.warn("[Seam Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody) as {
      event_id: string;
      event_type: string;
      device_id?: string;
      access_code_id?: string;
      created_at: string;
      [key: string]: unknown;
    };

    console.log("[Seam Webhook] Event:", payload.event_type, payload.event_id);

    await processSeamEvent(payload);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Seam Webhook] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
