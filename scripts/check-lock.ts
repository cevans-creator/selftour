import { config } from "dotenv";
config({ path: ".env.local" });

import { Seam } from "seam";

const DEVICE_ID = "a5b06753-da6d-46e3-a91d-00d506f1c56b";

async function main() {
  const seam = new Seam({ apiKey: process.env.SEAM_API_KEY! });

  const device = await seam.devices.get({ device_id: DEVICE_ID });
  console.log("\n🔒 Lock status:");
  console.log("   Name:", device.display_name);
  console.log("   Online:", device.properties.online);
  console.log("   Battery:", (device.properties as Record<string, unknown>).battery_level ?? "unknown");
  console.log("   Locked:", (device.properties as Record<string, unknown>).locked ?? "unknown");
  console.log("   Errors:", device.errors?.length ? device.errors : "none");
  console.log("   Warnings:", device.warnings?.length ? device.warnings : "none");
  console.log("\n   Full properties:", JSON.stringify(device.properties, null, 2));
}

main().catch(console.error);
