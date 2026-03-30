import "server-only";
import { Resend } from "resend";

declare global {
  // eslint-disable-next-line no-var
  var __resendClient: Resend | undefined;
}

function createResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

export const resend = globalThis.__resendClient ?? createResendClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__resendClient = resend;
}

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "noreply@selftour.app";
