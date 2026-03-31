import "server-only";
import twilio from "twilio";

declare global {
  // eslint-disable-next-line no-var
  var __twilioClient: twilio.Twilio | undefined;
}

export function getTwilioClient(): twilio.Twilio {
  if (globalThis.__twilioClient) return globalThis.__twilioClient;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
  }
  const client = twilio(accountSid, authToken);
  if (process.env.NODE_ENV !== "production") {
    globalThis.__twilioClient = client;
  }
  return client;
}

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER ?? "";
