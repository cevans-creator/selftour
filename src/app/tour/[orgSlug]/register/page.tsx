"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IdVerification } from "@/components/tour/id-verification";
import { isValidEmail, isValidPhone, formatDate, formatTime } from "@/lib/utils";

interface SelectedSlot {
  propertyId: string;
  startsAt: string;
  endsAt: string;
}

export default function RegisterPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const router = useRouter();

  const [slot, setSlot] = useState<SelectedSlot | null>(null);
  const [step, setStep] = useState<"info" | "verification">("info");
  const [isLoading, setIsLoading] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedSlot");
    if (!stored) {
      router.push(`/tour/${orgSlug}`);
      return;
    }
    try {
      setSlot(JSON.parse(stored) as SelectedSlot);
    } catch {
      router.push(`/tour/${orgSlug}`);
    }
  }, [orgSlug, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!isValidPhone(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setStep("verification");
  };

  const handleBook = async (skipVerification = false) => {
    if (!slot) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/tour/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgSlug,
          propertyId: slot.propertyId,
          scheduledAt: slot.startsAt,
          visitorFirstName: form.firstName,
          visitorLastName: form.lastName,
          visitorEmail: form.email,
          visitorPhone: form.phone,
          stripeIdentitySessionId: stripeSessionId ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Booking failed. Please try again.");
        return;
      }

      const { tourId } = (await res.json()) as { tourId: string };
      sessionStorage.removeItem("selectedSlot");
      router.push(`/tour/${orgSlug}/confirm?tourId=${tourId}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!slot) return null;

  const startsAt = new Date(slot.startsAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <Link href={`/tour/${orgSlug}/${slot.propertyId}`} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Complete Your Booking</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tour scheduled for{" "}
              <strong>
                {formatDate(startsAt)} at {formatTime(startsAt)}
              </strong>
            </p>
          </div>

          {step === "info" ? (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold">Your Information</h2>
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Jane"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-400">Your booking confirmation will be sent here.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-400">Your door access code will be sent here by text.</p>
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <IdVerification
                onVerified={(sessionId) => {
                  setStripeSessionId(sessionId);
                  void handleBook(false);
                }}
                onSkip={() => void handleBook(true)}
                required={false}
              />

              {!isLoading && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    By booking, you agree to our tour policies.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
