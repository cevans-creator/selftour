import { NextResponse } from "next/server";
import { sendSms } from "@/server/twilio/sms";

export async function GET() {
  const from = process.env.TWILIO_PHONE_NUMBER;
  const sid = process.env.TWILIO_ACCOUNT_SID;

  if (!from || !sid) {
    return NextResponse.json({ error: "Twilio env vars not set", from, sid: sid?.slice(0, 8) }, { status: 500 });
  }

  try {
    const msgSid = await sendSms("+12816781530", "KeySherpa SMS test — if you see this, Twilio is working!");
    return NextResponse.json({ success: true, messageSid: msgSid, from });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      from,
      sidPrefix: sid.slice(0, 8),
    }, { status: 500 });
  }
}
