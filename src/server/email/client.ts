import "server-only";
import { Resend } from "resend";

declare global {
  // eslint-disable-next-line no-var
  var __resendClient: Resend | undefined;
}

export function getResendClient(): Resend {
  if (globalThis.__resendClient) return globalThis.__resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  const client = new Resend(apiKey);
  if (process.env.NODE_ENV !== "production") {
    globalThis.__resendClient = client;
  }
  return client;
}

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "noreply@selftour.app";
