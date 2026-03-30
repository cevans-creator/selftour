import { NextRequest, NextResponse } from "next/server";
import { handleInboundSms } from "@/server/twilio/ai-assistant";

/**
 * Handle inbound SMS from Twilio.
 * Twilio sends a POST with form-encoded body: From, Body, etc.
 *
 * Respond with empty TwiML to avoid Twilio error — actual reply is sent via Twilio API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const from = body.get("From") as string | null;
    const text = body.get("Body") as string | null;

    if (!from || !text) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Process asynchronously so Twilio doesn't time out
    void handleInboundSms(from, text);

    // Respond with empty TwiML immediately
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  } catch (err) {
    console.error("[Twilio Webhook] Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
