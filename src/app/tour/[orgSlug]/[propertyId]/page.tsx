"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { BedDouble, Bath, Square, MapPin, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TimeSlotPicker } from "@/components/tour/time-slot-picker";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { TimeSlot } from "@/types";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number | null;
  bathrooms: string | null;
  squareFeet: number | null;
  price: number | null;
  description: string | null;
  imageUrls: string[];
  tourDurationMinutes: number;
  bufferMinutes: number;
  availableFrom: string | null;
  availableTo: string | null;
  availableDays: number[];
}

interface OrgInfo {
  name: string;
  primaryColor: string;
  logoUrl: string | null;
  slug: string;
}

export default function PropertyDetailTourPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const propertyId = params.propertyId as string;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [existingBookings, setExistingBookings] = useState<
    Array<{ scheduledAt: Date; endsAt: Date }>
  >([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tour/${orgSlug}/${propertyId}`);
        if (!res.ok) { router.push("/not-found"); return; }
        const data = await res.json() as {
          property: Property;
          org: OrgInfo;
          bookings: Array<{ scheduledAt: string; endsAt: string }>;
        };
        setProperty(data.property);
        setOrg(data.org);
        setExistingBookings(
          data.bookings.map((b) => ({
            scheduledAt: new Date(b.scheduledAt),
            endsAt: new Date(b.endsAt),
          }))
        );
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [orgSlug, propertyId, router]);

  const handleBooking = () => {
    if (!selectedSlot) return;
    // Save selected slot to session storage
    sessionStorage.setItem(
      "selectedSlot",
      JSON.stringify({
        propertyId,
        startsAt: selectedSlot.startsAt.toISOString(),
        endsAt: selectedSlot.endsAt.toISOString(),
      })
    );
    router.push(`/tour/${orgSlug}/register`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!property || !org) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-4" style={{ backgroundColor: org.primaryColor }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link href={`/tour/${orgSlug}`} className="flex items-center gap-2 text-white/90 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to all homes
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Images */}
        {property.imageUrls.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.imageUrls[0]}
              alt={property.name}
              className="h-80 w-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Property info */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>

            <div className="mt-2 flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {property.address}, {property.city}, {property.state} {property.zip}
              </span>
            </div>

            {property.price && (
              <p className="mt-3 text-2xl font-bold" style={{ color: org.primaryColor }}>
                {formatCurrency(property.price)}
              </p>
            )}

            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
              {property.bedrooms !== null && (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  {property.bedrooms} bedrooms
                </span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  {property.bathrooms} bathrooms
                </span>
              )}
              {property.squareFeet && (
                <span className="flex items-center gap-1.5">
                  <Square className="h-4 w-4" />
                  {property.squareFeet.toLocaleString()} sq ft
                </span>
              )}
            </div>

            {property.description && (
              <p className="mt-6 text-gray-600 leading-relaxed">{property.description}</p>
            )}

            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: org.primaryColor }} />
                <span className="font-medium">Self-Guided Tours</span>
              </div>
              <p className="mt-1 text-gray-500">
                Tours are {property.tourDurationMinutes} minutes. You&apos;ll receive a door code via text
                15 minutes before your scheduled time.
              </p>
            </div>
          </div>

          {/* Booking panel */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">
                Choose a Time
              </h2>

              <TimeSlotPicker
                propertyId={property.id}
                availableFrom={property.availableFrom ?? "09:00"}
                availableTo={property.availableTo ?? "17:00"}
                availableDays={property.availableDays}
                tourDurationMinutes={property.tourDurationMinutes}
                bufferMinutes={property.bufferMinutes}
                existingBookings={existingBookings}
                onSelect={setSelectedSlot}
                selectedSlot={selectedSlot}
                primaryColor={org.primaryColor}
              />

              {selectedSlot && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-900">Selected Time</p>
                  <p className="text-gray-600 mt-0.5">
                    {formatDate(selectedSlot.startsAt)} at {formatTime(selectedSlot.startsAt)}
                    {" "}– {formatTime(selectedSlot.endsAt)}
                  </p>
                </div>
              )}

              <Button
                className="mt-4 w-full text-white"
                disabled={!selectedSlot}
                onClick={handleBooking}
                style={
                  selectedSlot
                    ? { backgroundColor: org.primaryColor, borderColor: org.primaryColor }
                    : {}
                }
              >
                Continue to Registration
              </Button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Free cancellation up to 1 hour before
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
