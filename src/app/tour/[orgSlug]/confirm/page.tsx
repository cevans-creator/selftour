import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/server/db/client";
import { tours, properties, visitors, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { formatDate, formatTime } from "@/lib/utils";
import { CheckCircle, Calendar, MapPin, Smartphone, MessageSquare } from "lucide-react";

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ tourId?: string }>;
}) {
  const { orgSlug } = await params;
  const { tourId } = await searchParams;

  if (!tourId) notFound();

  const [row] = await db
    .select({
      tour: tours,
      property: properties,
      visitor: visitors,
    })
    .from(tours)
    .innerJoin(properties, eq(tours.propertyId, properties.id))
    .innerJoin(visitors, eq(tours.visitorId, visitors.id))
    .where(eq(tours.id, tourId))
    .limit(1);

  if (!row) notFound();

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, row.tour.organizationId))
    .limit(1);

  if (!org) notFound();

  const { tour, property, visitor } = row;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        {/* Success header */}
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: org.primaryColor + "20" }}
          >
            <CheckCircle className="h-9 w-9" style={{ color: org.primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">You're all set!</h1>
          <p className="mt-2 text-gray-500">
            Your self-guided tour has been confirmed.
          </p>
        </div>

        {/* Tour details */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Tour Details</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="font-medium">{property.address}</p>
                <p className="text-sm text-gray-500">
                  {property.city}, {property.state} {property.zip}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="font-medium">{formatDate(tour.scheduledAt)}</p>
                <p className="text-sm text-gray-500">
                  {formatTime(tour.scheduledAt)} – {formatTime(tour.endsAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Confirmation sent to</p>
                <p className="font-medium">{visitor.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: org.primaryColor }}
              >
                1
              </div>
              <p className="text-gray-600">
                You'll receive a confirmation email and SMS with your tour details.
              </p>
            </div>
            <div className="flex gap-3">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: org.primaryColor }}
              >
                2
              </div>
              <p className="text-gray-600">
                15 minutes before your tour, you'll receive a text message with your
                4-digit door access code.
              </p>
            </div>
            <div className="flex gap-3">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: org.primaryColor }}
              >
                3
              </div>
              <p className="text-gray-600">
                Enter the code at the front door to let yourself in. Explore at your own pace!
              </p>
            </div>
            <div className="flex gap-3">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: org.primaryColor }}
              >
                4
              </div>
              <div className="text-gray-600">
                <p>Have questions during your tour? Text us at</p>
                <p className="font-medium">{org.twilioPhoneNumber ?? "the number in your confirmation"}</p>
                <p>and our AI assistant will answer instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI assistant callout */}
        <div
          className="mt-6 rounded-xl p-5"
          style={{ backgroundColor: org.primaryColor + "10", borderColor: org.primaryColor + "30" }}
        >
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: org.primaryColor }} />
            <div>
              <p className="font-medium" style={{ color: org.primaryColor }}>AI-Powered Q&A</p>
              <p className="mt-0.5 text-sm text-gray-600">
                During your tour, text any question to {org.twilioPhoneNumber ?? "our SMS number"} — pricing,
                HOA fees, neighborhood info, anything. You'll get an instant answer.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/tour/${orgSlug}/access/${tourId}`}
            className="text-sm font-medium hover:underline"
            style={{ color: org.primaryColor }}
          >
            View your access page →
          </Link>
        </div>
      </div>
    </div>
  );
}
