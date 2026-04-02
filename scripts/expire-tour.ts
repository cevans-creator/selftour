/**
 * Expire a tour: delete the Seam PIN and mark tour complete
 * Run with: npx tsx scripts/expire-tour.ts <tourId>
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/server/db/schema";
import { eq } from "drizzle-orm";
import { Seam } from "seam";

const pgClient = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(pgClient, { schema });

async function main() {
  const tourId = process.argv[2];
  if (!tourId) {
    console.error("Usage: npx tsx scripts/expire-tour.ts <tourId>");
    process.exit(1);
  }

  const [tour] = await db.select().from(schema.tours).where(eq(schema.tours.id, tourId));
  if (!tour) { console.error("❌ Tour not found:", tourId); process.exit(1); }

  console.log(`\n🔒 Expiring tour: ${tour.id}`);
  console.log(`   Status: ${tour.status}`);
  console.log(`   PIN: ${tour.accessCode}`);

  // Delete access code from lock
  if (tour.seamAccessCodeId) {
    try {
      const seam = new Seam({ apiKey: process.env.SEAM_API_KEY! });
      await seam.accessCodes.delete({ access_code_id: tour.seamAccessCodeId });
      console.log(`✅ PIN deleted from lock (Seam code: ${tour.seamAccessCodeId})`);
    } catch (err) {
      console.error("❌ Seam error:", err instanceof Error ? err.message : err);
    }
  } else {
    console.log("⚠️  No Seam code ID on tour — skipping lock deletion");
  }

  // Mark tour complete
  await db.update(schema.tours).set({
    status: "completed",
    endsAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(schema.tours.id, tourId));

  console.log(`✅ Tour marked complete\n`);

  await pgClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
