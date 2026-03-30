import { notFound } from "next/navigation";
import { db } from "@/server/db/client";
import { organizations, properties, communities } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { PropertyBrowser } from "@/components/tour/property-browser";
import { Home } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, orgSlug))
    .limit(1);

  if (!org) return { title: "Tours" };

  return {
    title: `${org.name} — Browse Homes`,
    description: `Browse available homes and schedule a self-guided tour with ${org.name}.`,
  };
}

export default async function TourBrowsePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, orgSlug))
    .limit(1);

  if (!org) notFound();

  const activeProperties = await db
    .select()
    .from(properties)
    .where(and(eq(properties.organizationId, org.id), eq(properties.status, "active")))
    .orderBy(properties.name);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="py-6"
        style={{ backgroundColor: org.primaryColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {org.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt={org.name} className="h-10" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">{org.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Available Homes</h1>
          <p className="mt-2 text-gray-600">
            Schedule a self-guided tour at your convenience — no agent required.
          </p>
        </div>

        <PropertyBrowser
          properties={activeProperties}
          orgSlug={orgSlug}
          primaryColor={org.primaryColor}
        />
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} {org.name}. Powered by SelfTour.</p>
      </footer>
    </div>
  );
}
