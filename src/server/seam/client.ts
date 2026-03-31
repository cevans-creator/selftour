import "server-only";
import { Seam } from "seam";

declare global {
  // eslint-disable-next-line no-var
  var __seamClient: Seam | undefined;
}

function createSeamClient() {
  const apiKey = process.env.SEAM_API_KEY;
  if (!apiKey) {
    throw new Error("SEAM_API_KEY environment variable is not set");
  }
  return new Seam({ apiKey });
}

export const seam = globalThis.__seamClient ?? createSeamClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__seamClient = seam;
}
