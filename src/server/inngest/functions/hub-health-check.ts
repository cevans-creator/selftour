import { inngest } from "../client";
import { db } from "@/server/db/client";
import { properties, organizations } from "@/server/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { getLockStatus } from "@/server/seam/locks";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";

/**
 * Periodic health check that polls all connected Seam devices
 * and sends alerts if any are offline or have low battery.
 *
 * Scheduled: every 4 hours via Inngest cron.
 */
export const hubHealthCheck = inngest.createFunction(
  {
    id: "hub-health-check",
    name: "Hub Health Check",
    concurrency: {
      limit: 1,
    },
  },
  { cron: "0 */4 * * *" }, // every 4 hours
  async ({ step, logger }) => {
    // Fetch all properties with a Seam device ID
    const connectedProperties = await step.run(
      "fetch-connected-properties",
      async () => {
        return db
          .select({
            id: properties.id,
            name: properties.name,
            address: properties.address,
            seamDeviceId: properties.seamDeviceId,
            organizationId: properties.organizationId,
          })
          .from(properties)
          .where(isNotNull(properties.seamDeviceId));
      }
    );

    if (connectedProperties.length === 0) {
      logger.info("No connected properties found");
      return { checked: 0 };
    }

    const issues: Array<{
      propertyId: string;
      propertyName: string;
      propertyAddress: string;
      organizationId: string;
      issue: string;
      batteryLevel?: number | null;
    }> = [];

    // Check each device
    for (const property of connectedProperties) {
      if (!property.seamDeviceId) continue;

      await step.run(`check-device-${property.id}`, async () => {
        try {
          const status = await getLockStatus(property.seamDeviceId!);

          if (!status.online) {
            issues.push({
              propertyId: property.id,
              propertyName: property.name,
              propertyAddress: property.address,
              organizationId: property.organizationId,
              issue: "offline",
            });
            logger.warn(`Device offline for property: ${property.address}`);
          } else if (status.battery !== null && status.battery < 0.2) {
            // Below 20% battery
            issues.push({
              propertyId: property.id,
              propertyName: property.name,
              propertyAddress: property.address,
              organizationId: property.organizationId,
              issue: "low_battery",
              batteryLevel: Math.round(status.battery * 100),
            });
            logger.warn(
              `Low battery on device for property: ${property.address} — ${Math.round(status.battery * 100)}%`
            );
          }
        } catch (err) {
          logger.error(`Failed to check device for ${property.address}:`, err);
          issues.push({
            propertyId: property.id,
            propertyName: property.name,
            propertyAddress: property.address,
            organizationId: property.organizationId,
            issue: "check_failed",
          });
        }
      });
    }

    // Send alert emails if any issues found
    if (issues.length > 0) {
      await step.run("send-alert-emails", async () => {
        // Group issues by organization
        const byOrg = new Map<string, typeof issues>();
        for (const issue of issues) {
          const orgIssues = byOrg.get(issue.organizationId) ?? [];
          orgIssues.push(issue);
          byOrg.set(issue.organizationId, orgIssues);
        }

        for (const [orgId, orgIssues] of byOrg) {
          // Fetch org contact info
          const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, orgId))
            .limit(1);

          if (!org) continue;

          const issueLines = orgIssues
            .map((i) => {
              if (i.issue === "offline") {
                return `• ${i.propertyAddress} — OFFLINE`;
              } else if (i.issue === "low_battery") {
                return `• ${i.propertyAddress} — Low Battery (${i.batteryLevel}%)`;
              } else {
                return `• ${i.propertyAddress} — Check Failed`;
              }
            })
            .join("\n");

          await getResendClient().emails.send({
            from: EMAIL_FROM,
            to: EMAIL_FROM, // In production this would be the org's admin email
            subject: `[SelfTour Alert] ${orgIssues.length} lock issue${orgIssues.length !== 1 ? "s" : ""} detected`,
            text: `Hub Health Check Alert\n\nThe following issues were detected for ${org.name}:\n\n${issueLines}\n\nPlease review your Integrations dashboard and resolve these issues to avoid disruption to self-guided tours.\n\n— SelfTour`,
          });
        }
      });
    }

    return {
      checked: connectedProperties.length,
      issues: issues.length,
      issueDetails: issues,
    };
  }
);
