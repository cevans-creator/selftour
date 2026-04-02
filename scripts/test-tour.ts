/**
 * Test script: Creates a tour end-to-end
 * Run with: npx tsx scripts/test-tour.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/server/db/schema";
import { eq } from "drizzle-orm";
import { Seam } from "seam";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const pgClient = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(pgClient, { schema });

function generatePin(): string {
  const banned = ["1234", "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1212", "6969"];
  let code: string;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (banned.includes(code));
  return code;
}

async function main() {
  console.log("\n🏠 SelfTour Test Script\n");

  // 1. Get org
  const [org] = await db.select().from(schema.organizations).limit(1);
  if (!org) { console.error("❌ No organization found. Sign up at the dashboard first."); process.exit(1); }
  console.log(`✅ Org: ${org.name} (slug: ${org.slug})`);

  // 2. Get property
  const [property] = await db.select().from(schema.properties).where(eq(schema.properties.organizationId, org.id)).limit(1);
  if (!property) { console.error("❌ No property found. Add one in the dashboard first."); process.exit(1); }
  console.log(`✅ Property: ${property.name} at ${property.address}`);
  console.log(`   Lock device ID: ${property.seamDeviceId ?? "NOT SET"}`);

  // 3. Create test visitor
  const testEmail = `test-${Date.now()}@example.com`;
  const [visitor] = await db.insert(schema.visitors).values({
    organizationId: org.id,
    firstName: "Test",
    lastName: "Visitor",
    email: testEmail,
    phone: "+15005550006",
    idVerificationMethod: "none",
  }).returning();
  console.log(`✅ Created visitor: ${visitor!.firstName} ${visitor!.lastName}`);

  // 4. Create tour starting now, lasting 30 min
  const scheduledAt = new Date();
  const endsAt = new Date(scheduledAt.getTime() + 30 * 60 * 1000);
  const accessCode = generatePin();

  const [tour] = await db.insert(schema.tours).values({
    organizationId: org.id,
    propertyId: property.id,
    visitorId: visitor!.id,
    scheduledAt,
    endsAt,
    accessCode,
    status: "scheduled",
  }).returning();
  console.log(`✅ Created tour: ${tour!.id}`);
  console.log(`   Duration: now → ${endsAt.toLocaleTimeString()}`);
  console.log(`   PIN: ${accessCode}`);

  // 5. Create access code on lock
  if (property.seamDeviceId) {
    try {
      console.log("\n🔐 Programming PIN on lock via Seam...");
      const seam = new Seam({ apiKey: process.env.SEAM_API_KEY! });
      const seamCode = await seam.accessCodes.create({
        device_id: property.seamDeviceId,
        name: `Test Tour ${tour!.id.slice(0, 8)}`,
        code: accessCode,
        starts_at: new Date(Date.now() - 10000).toISOString(),
        ends_at: endsAt.toISOString(),
      });

      await db.update(schema.tours).set({
        seamAccessCodeId: seamCode.access_code_id,
        status: "access_sent",
      }).where(eq(schema.tours.id, tour!.id));

      console.log(`✅ PIN ${accessCode} is now active on the lock!`);
      console.log(`   Seam code ID: ${seamCode.access_code_id}`);
    } catch (err) {
      console.error("❌ Seam error:", err instanceof Error ? err.message : err);
    }
  } else {
    console.log("⚠️  No lock linked to this property — skipping Seam");
  }

  // 6. Print access URL
  const accessUrl = `${APP_URL}/tour/${org.slug}/access/${tour!.id}`;
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔗 Visitor access URL:");
  console.log(`   ${accessUrl}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n   PIN ${accessCode} works on the keypad right now.`);
  console.log(`   Open the URL above to see the visitor experience.\n`);

  await pgClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
