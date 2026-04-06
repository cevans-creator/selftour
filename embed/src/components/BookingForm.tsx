import { useState } from "react";
import type { OrgInfo, Property, TimeSlot } from "../types";
import { bookTour } from "../lib/api";
import { formatDate, formatTime } from "../lib/slots";

interface Props {
  apiBase: string;
  org: OrgInfo;
  property: Property;
  slot: TimeSlot;
  onConfirm: (tourId: string, accessUrl: string) => void;
  onBack: () => void;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isValidPhone(v: string) {
  return /^\+?[\d\s\-().]{10,}$/.test(v);
}

export function BookingForm({ apiBase, org, property, slot, onConfirm, onBack }: Props) {
  const primary = org.primaryColor;
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const input: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 15,
    color: "#111827",
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const label: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 4,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const { tourId, accessUrl } = await bookTour(apiBase, {
        orgSlug: org.slug,
        propertyId: property.id,
        scheduledAt: slot.startsAt.toISOString(),
        visitorFirstName: form.firstName.trim(),
        visitorLastName: form.lastName.trim(),
        visitorEmail: form.email.trim().toLowerCase(),
        visitorPhone: form.phone.trim(),
      });
      onConfirm(tourId, accessUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Selected slot summary */}
      <div style={{
        background: "#f9fafb",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 20,
        fontSize: 13,
        borderLeft: `3px solid ${primary}`,
      }}>
        <div style={{ fontWeight: 600, color: "#111827" }}>{property.name}</div>
        <div style={{ color: "#6b7280", marginTop: 2 }}>
          {formatDate(slot.startsAt)} at {formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={label}>First Name</label>
            <input
              style={input}
              placeholder="Jane"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              required
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = primary; (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${primary}20`; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#d1d5db"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={label}>Last Name</label>
            <input
              style={input}
              placeholder="Smith"
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              required
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = primary; (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${primary}20`; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#d1d5db"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={label}>Email Address</label>
          <input
            style={input}
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = primary; (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${primary}20`; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#d1d5db"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
          />
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            Confirmation will be sent here.
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={label}>Phone Number</label>
          <input
            style={input}
            type="tel"
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            required
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = primary; (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${primary}20`; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#d1d5db"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
          />
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            Your door access code arrives here by text, 15 min before your tour.
          </div>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            color: "#dc2626",
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: loading ? "#9ca3af" : primary,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Booking…" : "Confirm Booking"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            display: "block",
            width: "100%",
            marginTop: 10,
            padding: "10px",
            borderRadius: 10,
            background: "transparent",
            border: "1px solid #e5e7eb",
            color: "#6b7280",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Change time
        </button>
      </form>
    </div>
  );
}
