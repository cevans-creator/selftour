"use client";

import { useState, useEffect } from "react";
import { addDays, format, startOfDay, isSameDay, addMinutes, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SLOT_LOOKAHEAD_DAYS } from "@/lib/constants";

interface TimeSlot {
  startsAt: Date;
  endsAt: Date;
  available: boolean;
}

interface TimeSlotPickerProps {
  propertyId: string;
  availableFrom: string; // "09:00"
  availableTo: string; // "17:00"
  availableDays: number[]; // 0-6, 0=Sun
  tourDurationMinutes: number;
  bufferMinutes: number;
  existingBookings: Array<{ scheduledAt: Date; endsAt: Date }>;
  onSelect: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null;
  primaryColor?: string;
}

export function TimeSlotPicker({
  availableFrom,
  availableTo,
  availableDays,
  tourDurationMinutes,
  bufferMinutes,
  existingBookings,
  onSelect,
  selectedSlot,
  primaryColor = "#2563eb",
}: TimeSlotPickerProps) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekOffset, setWeekOffset] = useState(0);

  // Build calendar days: 14 days starting from today + weekOffset * 7
  const calendarStart = addDays(today, weekOffset * 7);
  const calendarDays = Array.from({ length: 7 }, (_, i) => addDays(calendarStart, i));

  // Generate time slots for the selected date
  const slots = generateSlots({
    date: selectedDate,
    availableFrom,
    availableTo,
    availableDays,
    tourDurationMinutes,
    bufferMinutes,
    existingBookings,
  });

  const isDayAvailable = (day: Date) => {
    const dayOfWeek = day.getDay();
    return availableDays.includes(dayOfWeek) && day >= today;
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-1 overflow-hidden min-w-0">
          {calendarDays.map((day) => {
            const available = isDayAvailable(day);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => available && setSelectedDate(day)}
                disabled={!available}
                className={cn(
                  "flex flex-col items-center rounded-lg p-2 text-center transition-colors min-w-[44px]",
                  !available && "opacity-30 cursor-not-allowed text-gray-400",
                  available && !isSelected && "text-gray-700 hover:bg-gray-100",
                  isSelected && "text-white"
                )}
                style={isSelected ? { backgroundColor: primaryColor } : {}}
              >
                <span className="text-xs font-medium uppercase">{format(day, "EEE")}</span>
                <span className="text-lg font-bold leading-none">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setWeekOffset((w) => Math.min(Math.floor(SLOT_LOOKAHEAD_DAYS / 7), w + 1))}
          disabled={weekOffset >= Math.floor(SLOT_LOOKAHEAD_DAYS / 7)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Date header */}
      <h3 className="text-sm font-medium text-gray-500">
        {format(selectedDate, "EEEE, MMMM d")} — {tourDurationMinutes}-minute slots
      </h3>

      {/* Time slots */}
      {slots.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          No available slots for this day
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((slot) => {
            const isSelected =
              selectedSlot !== null &&
              slot.startsAt.getTime() === selectedSlot.startsAt.getTime();

            return (
              <button
                key={slot.startsAt.toISOString()}
                onClick={() => slot.available && onSelect(slot)}
                disabled={!slot.available}
                className={cn(
                  "rounded-md border py-2 text-sm font-semibold transition-colors",
                  !slot.available && "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400",
                  slot.available && !isSelected && "border-gray-300 text-gray-800 bg-white hover:bg-gray-50",
                  isSelected && "text-white border-transparent"
                )}
                style={isSelected ? { backgroundColor: primaryColor } : {}}
              >
                {format(slot.startsAt, "h:mm a")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Slot generation ──────────────────────────────────────────────────────────

function generateSlots(opts: {
  date: Date;
  availableFrom: string;
  availableTo: string;
  availableDays: number[];
  tourDurationMinutes: number;
  bufferMinutes: number;
  existingBookings: Array<{ scheduledAt: Date; endsAt: Date }>;
}): TimeSlot[] {
  const { date, availableFrom, availableTo, availableDays, tourDurationMinutes, bufferMinutes, existingBookings } = opts;

  const dayOfWeek = date.getDay();
  if (!availableDays.includes(dayOfWeek)) return [];

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

    // Check if in the past (with 30-min buffer)
    const isPast = current < addMinutes(now, 30);

    // Check for conflicts with existing bookings (+ buffer)
    const hasConflict = existingBookings.some((booking) => {
      const bufferEnd = addMinutes(booking.endsAt, bufferMinutes);
      const bufferStart = addMinutes(booking.scheduledAt, -bufferMinutes);
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
