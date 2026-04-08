import { NextResponse } from "next/server";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY is not set" }, { status: 500 });
  }

  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({ error: "Resend client failed to initialize" }, { status: 500 });
  }

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: "cadenwevans@gmail.com",
    subject: "KeySherpa Email Test",
    html: "<p>If you see this, Resend is working correctly.</p>",
  });

  if (error) {
    return NextResponse.json({ error, from: EMAIL_FROM, keyPrefix: apiKey.slice(0, 8) }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id, from: EMAIL_FROM, keyPrefix: apiKey.slice(0, 8) });
}
