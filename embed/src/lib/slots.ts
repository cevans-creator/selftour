import { addMinutes } from "date-fns";
import type { TimeSlot, Booking } from "../types";

export function generateSlots(opts: {
  date: Date;
  availableFrom: string;
  availableTo: string;
  availableDays: number[];
  tourDurationMinutes: number;
  bufferMinutes: number;
  existingBookings: Booking[];
}): TimeSlot[] {
  const {
    date,
    availableFrom,
    availableTo,
    availableDays,
    tourDurationMinutes,
    bufferMinutes,
    existingBookings,
  } = opts;

  if (!availableDays.includes(date.getDay())) return [];

  const [fromH, fromM] = availableFrom.split(":").map(Number);
  const [toH, toM] = availableTo.split(":").map(Number);

  const startTime = new Date(date);
  startTime.setHours(fromH!, fromM!, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(toH!, toM!, 0, 0);

  const slots: TimeSlot[] = [];
  const now = new Date();
  let current = startTime;

  while (current < endTime) {
    const slotEnd = addMinutes(current, tourDurationMinutes);
    if (slotEnd > endTime) break;

    const isPast = current < addMinutes(now, 30);

    const hasConflict = existingBookings.some((b) => {
      const bs = new Date(b.scheduledAt);
      const be = new Date(b.endsAt);
      const bufferEnd = addMinutes(be, bufferMinutes);
      const bufferStart = addMinutes(bs, -bufferMinutes);
      return current < bufferEnd && slotEnd > bufferStart;
    });

    slots.push({
      startsAt: new Date(current),
      endsAt: slotEnd,
      available: !isPast && !hasConflict,
    });

    current = addMinutes(current, tourDurationMinutes + bufferMinutes);
  }

  return slots;
}

export function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
