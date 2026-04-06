"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarX2, CalendarCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";

interface TourDetails {
  tour: {
    id: string;
    status: string;
    scheduledAt: string;
    endsAt: string;
  };
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
  visitor: {
    firstName: string;
  };
  org: {
    name: string;
    slug: string;
    primaryColor: string;
    logoUrl: string | null;
  };
}

export default function ManageTourPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const tourId = params.tourId as string;

  const [details, setDetails] = useState<TourDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tour/manage/${tourId}`);
        if (!res.ok) {
          setError("Tour not found.");
          return;
        }
        const data = await res.json() as TourDetails;
        setDetails(data);
      } catch {
        setError("Failed to load tour details.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [tourId]);

  const handleCancel = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch("/api/tour/visitor-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to cancel tour.");
        setCancelling(false);
        setConfirming(false);
        return;
      }
      setCancelled(true);
    } catch {
      setError("Failed to cancel tour.");
      setCancelling(false);
      setConfirming(false);
    }
  };

  const handleReschedule = async () => {
    if (!details) return;
    // Cancel first if not already cancelled
    if (!cancelled) {
      setCancelling(true);
      const res = await fetch("/api/tour/visitor-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to cancel tour.");
        setCancelling(false);
        return;
      }
    }
    router.push(`/tour/${orgSlug}/${details.property.id}`);
  };

  const primaryColor = details?.org.primaryColor ?? "#7c3aed";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: primaryColor, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{error ?? "Tour not found"}</p>
          <p className="mt-2 text-sm text-gray-500">This link may have expired or the tour doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const { tour, property, visitor, org } = details;
  const scheduledAt = new Date(tour.scheduledAt);
  const endsAt = new Date(tour.endsAt);
  const isUpcoming = new Date(tour.scheduledAt) > new Date();
  const alreadyCancelled = tour.status === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="py-4 px-4" style={{ backgroundColor: primaryColor }}>
        <div className="mx-auto max-w-lg">
          {org.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logoUrl} alt={org.name} className="h-8 object-contain" />
          ) : (
            <p className="text-white font-bold text-lg">{org.name}</p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        {cancelled ? (
          /* Success state */
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Tour Cancelled</h1>
            <p className="mt-2 text-gray-500 text-sm">
              Your tour has been cancelled. You&apos;ll receive a confirmation email shortly.
            </p>
            <Button
              className="mt-6 w-full"
              style={{ backgroundColor: primaryColor }}
              onClick={() => router.push(`/tour/${orgSlug}/${property.id}`)}
            >
              Book a New Time
            </Button>
          </div>
        ) : alreadyCancelled ? (
          /* Already cancelled */
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <CalendarX2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Tour Already Cancelled</h1>
            <p className="mt-2 text-gray-500 text-sm">This tour has already been cancelled.</p>
            <Button
              className="mt-6 w-full"
              style={{ backgroundColor: primaryColor }}
              onClick={() => router.push(`/tour/${orgSlug}/${property.id}`)}
            >
              Book a New Time
            </Button>
          </div>
        ) : (
          /* Manage state */
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Your Tour</h1>
              <p className="mt-1 text-gray-500 text-sm">Hi {visitor.firstName}, here are your tour details.</p>
            </div>

            {/* Tour details card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Property</p>
                  <p className="mt-1 font-medium text-gray-900">{property.address}</p>
                  <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                </div>
                <hr className="border-gray-100" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Date & Time</p>
                  <p className="mt-1 font-medium text-gray-900">{formatDate(scheduledAt)}</p>
                  <p className="text-sm text-gray-500">{formatTime(scheduledAt)} – {formatTime(endsAt)}</p>
                </div>
                <hr className="border-gray-100" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status</p>
                  <p className="mt-1 font-medium" style={{ color: primaryColor }}>
                    {tour.status === "scheduled" ? "Confirmed" :
                     tour.status === "access_sent" ? "Access Code Sent" :
                     tour.status === "in_progress" ? "In Progress" : tour.status}
                  </p>
                </div>
              </div>
            </div>

            {isUpcoming && (
              <div className="rounded-2xl bg-white p-6 shadow-sm space-y-3">
                <h2 className="font-semibold text-gray-900">Need to make a change?</h2>

                {/* Reschedule */}
                <Button
                  className="w-full gap-2"
                  style={{ backgroundColor: primaryColor }}
                  onClick={handleReschedule}
                  disabled={cancelling}
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
                  Reschedule Tour
                </Button>

                {/* Cancel */}
                {!confirming ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    <CalendarX2 className="h-4 w-4" />
                    Cancel Tour
                  </Button>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                    <p className="text-sm text-red-700 font-medium">Are you sure you want to cancel?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 text-sm"
                        onClick={() => setConfirming(false)}
                        disabled={cancelling}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Go Back
                      </Button>
                      <Button
                        className="flex-1 text-sm bg-red-600 hover:bg-red-700"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                        Yes, Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isUpcoming && (
              <p className="text-center text-sm text-gray-400">
                This tour has already passed and cannot be modified.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
