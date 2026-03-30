"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Home, RefreshCw } from "lucide-react";
import { AccessCodeDisplay } from "@/components/tour/access-code-display";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TourPublic {
  id: string;
  status: string;
  scheduledAt: string;
  endsAt: string;
  accessCode: string | null;
  propertyAddress: string;
  propertyCity: string;
  visitorFirstName: string;
}

interface OrgInfo {
  name: string;
  primaryColor: string;
  twilioPhoneNumber: string | null;
  logoUrl: string | null;
}

export default function AccessPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<TourPublic | null>(null);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/tour/access/${tourId}`);
      if (!res.ok) {
        setError("Tour not found.");
        return;
      }
      const data = await res.json() as { tour: TourPublic; org: OrgInfo };
      setTour(data.tour);
      setOrg(data.org);
    } catch {
      setError("Failed to load tour details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();

    // Refresh every 30 seconds to pick up status changes
    const interval = setInterval(() => void load(), 30000);
    return () => clearInterval(interval);
  }, [tourId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-lg px-4 py-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-32 mt-4 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !tour || !org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <Home className="h-12 w-12 text-gray-300" />
        <h1 className="text-xl font-semibold">Tour not found</h1>
        <p className="text-sm text-gray-500">
          {error ?? "We couldn't find this tour. Please check the link and try again."}
        </p>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const hasTourCode = tour.status === "access_sent" || tour.status === "in_progress" || tour.status === "completed";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="py-4" style={{ backgroundColor: org.primaryColor }}>
        <div className="mx-auto max-w-lg px-4">
          <p className="font-bold text-white">{org.name}</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Tour Access</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hi {tour.visitorFirstName}! Here are your tour details.
          </p>
        </div>

        {tour.status === "scheduled" && !tour.accessCode ? (
          <div className="rounded-xl bg-white p-6 shadow-sm text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: org.primaryColor + "15" }}
            >
              <Home className="h-8 w-8" style={{ color: org.primaryColor }} />
            </div>
            <h2 className="text-lg font-semibold">Tour Confirmed!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your door access code will be sent via text message{" "}
              <strong>15 minutes before your tour</strong>. This page will update
              automatically when your code is ready.
            </p>
            <p className="mt-4 text-sm font-medium" style={{ color: org.primaryColor }}>
              Check back 15 min before your tour starts.
            </p>
            <button
              onClick={() => void load()}
              className="mt-4 flex items-center gap-1.5 mx-auto text-xs text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        ) : hasTourCode && tour.accessCode ? (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <AccessCodeDisplay
              accessCode={tour.accessCode}
              propertyAddress={`${tour.propertyAddress}, ${tour.propertyCity}`}
              startsAt={new Date(tour.scheduledAt)}
              endsAt={new Date(tour.endsAt)}
              visitorFirstName={tour.visitorFirstName}
              supportPhone={org.twilioPhoneNumber ?? undefined}
              primaryColor={org.primaryColor}
            />
          </div>
        ) : tour.status === "cancelled" ? (
          <div className="rounded-xl bg-red-50 p-6 text-center">
            <h2 className="font-semibold text-red-800">Tour Cancelled</h2>
            <p className="mt-1 text-sm text-red-600">
              This tour has been cancelled. Please contact us to reschedule.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-100 p-6 text-center">
            <h2 className="font-semibold">Tour Completed</h2>
            <p className="mt-1 text-sm text-gray-500">
              Thank you for visiting! We hope you loved the home.
            </p>
          </div>
        )}

        {/* Property info */}
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm text-sm">
          <p className="font-medium text-gray-900">{tour.propertyAddress}</p>
          <p className="text-gray-500">{tour.propertyCity}</p>
        </div>
      </main>
    </div>
  );
}
