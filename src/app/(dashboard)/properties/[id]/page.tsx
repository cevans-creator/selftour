import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/server/db/client";
import { properties, tours, visitors, orgMembers, organizations } from "@/server/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { getLockStatus } from "@/server/locks";
import { buildTourUrl } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourTable } from "@/components/dashboard/tour-table";
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  Battery,
  Lock,
  Unlock,
  ExternalLink,
  QrCode,
  Edit,
} from "lucide-react";
import type { TourStatus } from "@/types";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) redirect("/login?no_org=1");

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.organizationId, membership.org.id)))
    .limit(1);

  if (!property) notFound();

  // Lock status
  let lockStatus = null;
  if (property.seamDeviceId) {
    try {
      lockStatus = await getLockStatus(property.seamDeviceId);
    } catch {
      lockStatus = null;
    }
  }

  // Upcoming tours
  const upcomingTours = await db
    .select({ tour: tours, property: properties, visitor: visitors })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .innerJoin(visitors, eq(tours.visitorId, visitors.id))
    .where(and(eq(tours.propertyId, id), gte(tours.scheduledAt, new Date())))
    .orderBy(tours.scheduledAt)
    .limit(20);

  const tourUrl = buildTourUrl(membership.org.slug, property.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/properties"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <p className="text-muted-foreground">
              {property.address}, {property.city}, {property.state} {property.zip}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={tourUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Tour Page
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/properties/${id}/edit`}>
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Lock Status */}
          {property.seamDeviceId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Smart Lock Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    {lockStatus?.online ? (
                      <Wifi className="h-5 w-5 text-green-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {lockStatus?.online ? "Online" : "Offline"}
                    </span>
                  </div>

                  {lockStatus?.locked !== null && (
                    <div className="flex items-center gap-2">
                      {lockStatus?.locked ? (
                        <Lock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Unlock className="h-5 w-5 text-orange-500" />
                      )}
                      <span className="text-sm font-medium">
                        {lockStatus?.locked ? "Locked" : "Unlocked"}
                      </span>
                    </div>
                  )}

                  {lockStatus?.battery !== null && lockStatus?.battery !== undefined && (
                    <div className="flex items-center gap-2">
                      <Battery
                        className={`h-5 w-5 ${lockStatus.battery < 0.2 ? "text-yellow-500" : "text-green-600"}`}
                      />
                      <span className="text-sm font-medium">
                        {Math.round(lockStatus.battery * 100)}% battery
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Device ID: <code className="font-mono">{property.seamDeviceId}</code>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Property details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: "Type", value: property.type.replace("_", " ") },
                  { label: "Status", value: <Badge variant={property.status === "active" ? "success" : "gray"}>{property.status}</Badge> },
                  { label: "Bedrooms", value: property.bedrooms ?? "—" },
                  { label: "Bathrooms", value: property.bathrooms ?? "—" },
                  { label: "Square Feet", value: property.squareFeet?.toLocaleString() ?? "—" },
                  { label: "Tour Duration", value: `${property.tourDurationMinutes} min` },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">{item.label}</dt>
                    <dd className="mt-1 text-sm font-medium capitalize">{item.value}</dd>
                  </div>
                ))}
              </dl>
              {property.description && (
                <p className="mt-4 text-sm text-muted-foreground">{property.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tours */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tours</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TourTable
                tours={upcomingTours.map((r) => ({
                  tour: { ...r.tour, status: r.tour.status as TourStatus },
                  property: r.property,
                  visitor: r.visitor,
                }))}
                emptyMessage="No upcoming tours for this property."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Tour QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Print or display this QR code at the property to let visitors book instantly.
              </p>
              {/* QR code rendered client-side */}
              <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground text-xs">
                QR code for:<br />
                <span className="font-mono text-xs break-all text-foreground">{tourUrl}</span>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <a href={`/api/qr?url=${encodeURIComponent(tourUrl)}`} download="tour-qr.png">
                  Download QR Code
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Tour availability */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Availability</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours</span>
                <span>{property.availableFrom} – {property.availableTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days</span>
                <span>
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
                    .filter((_, i) => (property.availableDays as number[]).includes(i))
                    .join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{property.tourDurationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buffer</span>
                <span>{property.bufferMinutes} min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
