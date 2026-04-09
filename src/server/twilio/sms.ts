import "server-only";
import { getTwilioClient, TWILIO_FROM } from "./client";
import { interpolateTemplate } from "@/lib/utils";

// ─── Core send function ────────────────────────────────────────────────────────

export async function sendSms(to: string, body: string): Promise<string> {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const message = await getTwilioClient().messages.create({
    ...(messagingServiceSid
      ? { messagingServiceSid }
      : { from: TWILIO_FROM }),
    to,
    body,
  });

  console.log(`[SMS] Sent to ${to}: ${message.sid}`);
  return message.sid;
}

// ─── Template send ─────────────────────────────────────────────────────────────

/**
 * Send an SMS using a template string with {{variable}} placeholders.
 * Returns the Twilio message SID.
 */
export async function sendTemplatedSms(
  to: string,
  template: string,
  vars: Record<string, string>
): Promise<string> {
  const body = interpolateTemplate(template, vars);
  return sendSms(to, body);
}

// ─── Convenience helpers ───────────────────────────────────────────────────────

export async function sendAccessCodeSms(
  to: string,
  opts: {
    visitorFirstName: string;
    propertyAddress: string;
    accessCode: string;
    tourTime: string;
    accessUrl: string;
  }
): Promise<string> {
  const body = `Hi ${opts.visitorFirstName}! Your tour of ${opts.propertyAddress} is at ${opts.tourTime}. Your door code is: ${opts.accessCode}. View instructions & ask questions: ${opts.accessUrl}`;
  return sendSms(to, body);
}

export async function sendTourReminderSms(
  to: string,
  opts: {
    visitorFirstName: string;
    propertyAddress: string;
    tourTime: string;
    cancelUrl?: string;
  }
): Promise<string> {
  const body = `Reminder: Your self-guided tour of ${opts.propertyAddress} is at ${opts.tourTime}. Reply STOP to opt out.`;
  return sendSms(to, body);
}

export async function sendThankYouSms(
  to: string,
  opts: {
    visitorFirstName: string;
    propertyAddress: string;
    agentName?: string;
    agentPhone?: string;
  }
): Promise<string> {
  const contact = opts.agentPhone
    ? ` Questions? Call ${opts.agentName ?? "your agent"} at ${opts.agentPhone}.`
    : "";
  const body = `Thanks for touring ${opts.propertyAddress}, ${opts.visitorFirstName}!${contact} Reply to this number with any questions.`;
  return sendSms(to, body);
}

export async function sendFollowUpSms(
  to: string,
  opts: {
    visitorFirstName: string;
    propertyAddress: string;
    surveyUrl?: string;
  }
): Promise<string> {
  const survey = opts.surveyUrl ? ` Share feedback: ${opts.surveyUrl}` : "";
  const body = `Hi ${opts.visitorFirstName}, still thinking about ${opts.propertyAddress}? We'd love to help.${survey}`;
  return sendSms(to, body);
}
