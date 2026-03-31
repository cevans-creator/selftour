import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { properties, communities, orgMembers, organizations, tours } from "@/server/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { PropertyCard } from "@/components/dashboard/property-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getLockStatus } from "@/server/seam/locks";

export default async function PropertiesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) redirect("/login");
  const org = membership.org;

  // Get all properties with communities
  const rows = await db
    .select({ property: properties, community: communities })
    .from(properties)
    .leftJoin(communities, eq(properties.communityId, communities.id))
    .where(eq(properties.organizationId, org.id))
    .orderBy(properties.name);

  // Get upcoming tour counts
  const now = new Date();
  const tourCounts = await db
    .select({ propertyId: tours.propertyId, count: count() })
    .from(tours)
    .where(and(eq(tours.organizationId, org.id), gte(tours.scheduledAt, now)))
    .groupBy(tours.propertyId);

  const tourCountMap = new Map(tourCounts.map((t) => [t.propertyId, t.count]));

  // Fetch lock statuses in parallel (best effort)
  const lockStatuses = await Promise.all(
    rows.map(async ({ property }) => {
      if (!property.seamDeviceId) return null;
      try {
        return await getLockStatus(property.seamDeviceId);
      } catch {
        return null;
      }
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground">{rows.length} total properties</p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <h3 className="text-lg font-semibold">No properties yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first property to start offering self-guided tours.
          </p>
          <Button asChild className="mt-4">
            <Link href="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add your first property
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ property, community }, i) => (
            <PropertyCard
              key={property.id}
              property={property}
              lockStatus={lockStatuses[i]}
              upcomingTourCount={tourCountMap.get(property.id) ?? 0}
              communityName={community?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
