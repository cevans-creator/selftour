"use client";

import { useState } from "react";
import { KeyRound, MessageSquare, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./countdown-timer";
import { cn } from "@/lib/utils";

interface AccessCodeDisplayProps {
  accessCode: string;
  propertyAddress: string;
  startsAt: Date;
  endsAt: Date;
  visitorFirstName: string;
  supportPhone?: string;
  primaryColor?: string;
}

export function AccessCodeDisplay({
  accessCode,
  propertyAddress,
  startsAt,
  endsAt,
  visitorFirstName,
  supportPhone,
  primaryColor = "#2563eb",
}: AccessCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const now = new Date();
  const tourStarted = now >= startsAt;
  const tourEnded = now >= endsAt;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Code display */}
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
        <KeyRound
          className="mx-auto mb-3 h-8 w-8 text-primary"
          style={{ color: primaryColor }}
        />
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Your Door Code
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span
            className="text-6xl font-bold tracking-[0.25em]"
            style={{ color: primaryColor }}
          >
            {accessCode.split("").join(" ")}
          </span>
          <button
            onClick={handleCopy}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            title="Copy code"
          >
            {copied ? (
              <CheckCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Status + timer */}
        <div className="mt-4">
          {tourEnded ? (
            <p className="text-sm font-medium text-muted-foreground">Tour has ended</p>
          ) : tourStarted ? (
            <div>
              <p className="text-sm font-medium text-green-600">Tour in progress</p>
              <CountdownTimer
                targetDate={endsAt}
                label="Time remaining"
                className="mt-2"
              />
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tour starts in</p>
              <CountdownTimer
                targetDate={startsAt}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-muted/50 p-5">
        <h3 className="font-semibold">How to enter</h3>
        <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="flex-shrink-0 font-bold text-foreground">1.</span>
            Approach the front door at {propertyAddress}
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 font-bold text-foreground">2.</span>
            Enter your code{" "}
            <strong className="text-foreground">{accessCode.split("").join("-")}</strong>{" "}
            on the keypad
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 font-bold text-foreground">3.</span>
            Press the checkmark or enter key to unlock
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 font-bold text-foreground">4.</span>
            Please lock the door when you leave — your code will automatically deactivate
            at tour end
          </li>
        </ol>
      </div>

      {/* AI Text prompt */}
      {supportPhone && (
        <div
          className={cn(
            "rounded-lg border p-4 text-sm"
          )}
          style={{ borderColor: primaryColor + "40", backgroundColor: primaryColor + "08" }}
        >
          <div className="flex items-start gap-3">
            <MessageSquare
              className="mt-0.5 h-5 w-5 flex-shrink-0"
              style={{ color: primaryColor }}
            />
            <div>
              <p className="font-medium">Have questions during your tour?</p>
              <p className="mt-0.5 text-muted-foreground">
                Text{" "}
                <a
                  href={`sms:${supportPhone}`}
                  className="font-medium underline-offset-2 hover:underline"
                  style={{ color: primaryColor }}
                >
                  {supportPhone}
                </a>{" "}
                and our AI assistant will answer instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
