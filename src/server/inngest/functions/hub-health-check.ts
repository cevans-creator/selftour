import { inngest } from "../client";
import { db } from "@/server/db/client";
import { properties, organizations } from "@/server/db/schema";
import { isNotNull } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { getLockStatus } from "@/server/locks";
import { getResendClient, EMAIL_FROM } from "@/server/email/client";

export const hubHealthCheck = inngest.createFunction(
  {
    id: "hub-health-check",
    name: "Hub Health Check",
    concurrency: { limit: 1 },
  },
  { cron: "0 */4 * * *" },
  async ({ step, logger }) => {
    const connectedProperties = await step.run("fetch-connected-properties", async () => {
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
    });

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
          } else if (status.battery !== null && status.battery < 0.2) {
            issues.push({
              propertyId: property.id,
              propertyName: property.name,
              propertyAddress: property.address,
              organizationId: property.organizationId,
              issue: "low_battery",
              batteryLevel: Math.round(status.battery * 100),
            });
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

    if (issues.length > 0) {
      await step.run("send-alert-emails", async () => {
        const byOrg = new Map<string, typeof issues>();
        for (const issue of issues) {
          const orgIssues = byOrg.get(issue.organizationId) ?? [];
          orgIssues.push(issue);
          byOrg.set(issue.organizationId, orgIssues);
        }

        for (const [orgId, orgIssues] of byOrg) {
          const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, orgId))
            .limit(1);
          if (!org) continue;

          const issueLines = orgIssues
            .map((i) => {
              if (i.issue === "offline") return `• ${i.propertyAddress} — OFFLINE`;
              if (i.issue === "low_battery") return `• ${i.propertyAddress} — Low Battery (${i.batteryLevel}%)`;
              return `• ${i.propertyAddress} — Check Failed`;
            })
            .join("\n");

          try {
            await getResendClient()?.emails.send({
              from: EMAIL_FROM,
              to: EMAIL_FROM,
              subject: `[KeySherpa Alert] ${orgIssues.length} lock issue${orgIssues.length !== 1 ? "s" : ""} detected`,
              text: `Hub Health Check Alert\n\nThe following issues were detected for ${org.name}:\n\n${issueLines}\n\nPlease review your Integrations dashboard.\n\n— KeySherpa`,
            });
          } catch (emailErr) {
            logger.error("Failed to send health check alert email:", emailErr);
          }
        }
      });
    }

    return { checked: connectedProperties.length, issues: issues.length };
  }
);
