import "server-only";
import { Seam } from "seam";

declare global {
  // eslint-disable-next-line no-var
  var __seamClient: Seam | undefined;
}

export function getSeamClient(): Seam {
  if (globalThis.__seamClient) return globalThis.__seamClient;
  const apiKey = process.env.SEAM_API_KEY;
  if (!apiKey) {
    throw new Error("SEAM_API_KEY environment variable is not set");
  }
  const client = new Seam({ apiKey });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__seamClient = client;
  }
  return client;
}
