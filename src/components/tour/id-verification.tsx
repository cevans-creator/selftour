"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IdVerificationProps {
  onVerified: (sessionId: string) => void;
  onSkip?: () => void;
  required?: boolean;
  primaryColor?: string;
}

export function IdVerification({
  onVerified,
  onSkip,
  required = false,
  primaryColor = "#2563eb",
}: IdVerificationProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStart = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      // Create a Stripe Identity verification session
      const res = await fetch("/api/stripe/identity/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to start verification");
      }

      const { clientSecret, sessionId } = (await res.json()) as {
        clientSecret: string;
        sessionId: string;
      };

      // Load Stripe.js
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

      if (!stripe) throw new Error("Stripe failed to load");

      setStatus("verifying");

      const { error } = await stripe.verifyIdentity(clientSecret);

      if (error) {
        setErrorMessage(error.message ?? "Verification failed");
        setStatus("error");
      } else {
        setStatus("success");
        onVerified(sessionId);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center rounded-lg bg-green-50 p-6 text-center">
        <ShieldCheck className="mb-3 h-12 w-12 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">Identity Verified</h3>
        <p className="mt-1 text-sm text-green-700">
          Your identity has been verified. You're all set!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Identity Verification</h3>
          <p className="mt-1 text-sm text-gray-500">
            For your safety and security, we require a quick identity check
            before your tour. This takes about 2 minutes and uses Stripe
            Identity — a secure, government-ID verification service.
          </p>

          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={handleStart}
              disabled={status === "loading" || status === "verifying"}
              isLoading={status === "loading" || status === "verifying"}
              style={{ backgroundColor: primaryColor }}
              className="border-0 text-white"
            >
              {status === "verifying" ? "Verifying…" : "Verify My Identity"}
            </Button>

            {!required && onSkip && status !== "loading" && status !== "verifying" && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 underline-offset-4 hover:underline"
              >
                Skip for now
              </button>
            )}
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Your data is encrypted and never stored by us. Powered by Stripe Identity.
          </p>
        </div>
      </div>
    </div>
  );
}
