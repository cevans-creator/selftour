import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { hubs, properties, orgMembers, organizations } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { HubList } from "@/components/dashboard/hub-list";

export default async function HubsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membership] = await db
    .select({ org: organizations, role: orgMembers.role })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);
  if (!membership) redirect("/login");

  const org = membership.org;

  // Fetch all hubs with their assigned properties
  const hubRows = await db
    .select({
      hub: hubs,
      property: properties,
    })
    .from(hubs)
    .leftJoin(properties, eq(hubs.propertyId, properties.id))
    .where(eq(hubs.organizationId, org.id))
    .orderBy(hubs.createdAt);

  // Fetch all properties for the assignment dropdown
  const allProperties = await db
    .select({
      id: properties.id,
      name: properties.name,
      address: properties.address,
      seamDeviceId: properties.seamDeviceId,
    })
    .from(properties)
    .where(eq(properties.organizationId, org.id))
    .orderBy(properties.name);

  const hubData = hubRows.map((row) => ({
    id: row.hub.id,
    name: row.hub.name,
    lastSeenAt: row.hub.lastSeenAt?.toISOString() ?? null,
    createdAt: row.hub.createdAt.toISOString(),
    propertyId: row.hub.propertyId,
    propertyName: row.property?.name ?? null,
    propertyAddress: row.property?.address ?? null,
    online: row.hub.lastSeenAt
      ? Date.now() - row.hub.lastSeenAt.getTime() < 60_000
      : false,
  }));

  return (
    <HubList
      hubs={hubData}
      properties={allProperties}
      orgId={org.id}
    />
  );
}
