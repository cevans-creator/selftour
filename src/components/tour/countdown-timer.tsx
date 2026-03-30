"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({
  targetDate,
  label,
  onExpire,
  className,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, differenceInSeconds(targetDate, new Date()))
  );
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const secs = Math.max(0, differenceInSeconds(targetDate, new Date()));
      setSecondsLeft(secs);

      if (secs === 0 && !expired) {
        setExpired(true);
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, expired, onExpire]);

  if (expired) {
    return (
      <div className={className}>
        <span className="text-muted-foreground text-sm">Tour ended</span>
      </div>
    );
  }

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className={className}>
      {label && (
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <div className="font-mono text-2xl font-bold tabular-nums">
        {hours > 0 ? (
          <>
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </>
        ) : (
          <>
            {pad(minutes)}:{pad(seconds)}
          </>
        )}
      </div>
    </div>
  );
}
