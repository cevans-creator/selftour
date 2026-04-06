import { useState } from "react";
import { addDays, isSameDay, startOfDay } from "date-fns";
import { generateSlots, formatTime } from "../lib/slots";
import type { Property, Booking, TimeSlot } from "../types";

const LOOKAHEAD_DAYS = 60;

interface Props {
  property: Property;
  bookings: Booking[];
  primaryColor: string;
  onSelect: (slot: TimeSlot) => void;
}

export function SlotPicker({ property, bookings, primaryColor, onSelect }: Props) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const calendarStart = addDays(today, weekOffset * 7);
  const calendarDays = Array.from({ length: 7 }, (_, i) => addDays(calendarStart, i));

  const isDayAvailable = (day: Date) =>
    property.availableDays.includes(day.getDay()) && day >= today;

  const slots = generateSlots({
    date: selectedDate,
    availableFrom: property.availableFrom ?? "09:00",
    availableTo: property.availableTo ?? "17:00",
    availableDays: property.availableDays,
    tourDurationMinutes: property.tourDurationMinutes,
    bufferMinutes: property.bufferMinutes,
    existingBookings: bookings,
  });

  const maxWeekOffset = Math.floor(LOOKAHEAD_DAYS / 7);

  const btnBase: React.CSSProperties = {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div>
      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          style={{
            ...btnBase,
            width: 32,
            height: 32,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#6b7280",
            opacity: weekOffset === 0 ? 0.3 : 1,
            cursor: weekOffset === 0 ? "not-allowed" : "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ display: "flex", gap: 4, flex: 1, overflow: "hidden", minWidth: 0 }}>
          {calendarDays.map((day) => {
            const avail = isDayAvailable(day);
            const selected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => avail && setSelectedDate(day)}
                disabled={!avail}
                style={{
                  ...btnBase,
                  flex: 1,
                  minWidth: 36,
                  padding: "6px 4px",
                  borderRadius: 8,
                  textAlign: "center",
                  background: selected ? primaryColor : "transparent",
                  color: selected ? "#fff" : avail ? "#374151" : "#d1d5db",
                  cursor: avail ? "pointer" : "not-allowed",
                  border: "none",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>
                  {day.getDate()}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setWeekOffset((w) => Math.min(maxWeekOffset, w + 1))}
          disabled={weekOffset >= maxWeekOffset}
          style={{
            ...btnBase,
            width: 32,
            height: 32,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#6b7280",
            opacity: weekOffset >= maxWeekOffset ? 0.3 : 1,
            cursor: weekOffset >= maxWeekOffset ? "not-allowed" : "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Date label */}
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        {" — "}{property.tourDurationMinutes}-min slots
      </div>

      {/* Slots */}
      {slots.length === 0 ? (
        <div style={{
          border: "1px dashed #e5e7eb",
          borderRadius: 10,
          padding: "24px 16px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 14,
        }}>
          No available time slots for this day
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {slots.map((slot) => {
            const isSelected = selectedSlot?.startsAt.getTime() === slot.startsAt.getTime();
            return (
              <button
                key={slot.startsAt.toISOString()}
                onClick={() => {
                  if (!slot.available) return;
                  setSelectedSlot(slot);
                }}
                disabled={!slot.available}
                style={{
                  ...btnBase,
                  padding: "8px 4px",
                  borderRadius: 8,
                  border: isSelected ? "none" : "1px solid #d1d5db",
                  background: isSelected ? primaryColor : slot.available ? "#fff" : "#f9fafb",
                  color: isSelected ? "#fff" : slot.available ? "#111827" : "#9ca3af",
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: slot.available ? 1 : 0.5,
                  cursor: slot.available ? "pointer" : "not-allowed",
                }}
              >
                {formatTime(slot.startsAt)}
              </button>
            );
          })}
        </div>
      )}

      {/* CTA */}
      {selectedSlot && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            background: "#f9fafb",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 12,
            fontSize: 13,
          }}>
            <div style={{ fontWeight: 600, color: "#111827" }}>Selected time</div>
            <div style={{ color: "#6b7280", marginTop: 2 }}>
              {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              {" at "}
              {formatTime(selectedSlot.startsAt)} – {formatTime(selectedSlot.endsAt)}
            </div>
          </div>
          <button
            onClick={() => onSelect(selectedSlot)}
            style={{
              ...btnBase,
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              background: primaryColor,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Continue to Registration →
          </button>
        </div>
      )}
    </div>
  );
}
