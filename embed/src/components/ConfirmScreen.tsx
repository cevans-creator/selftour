import type { OrgInfo, Property, TimeSlot } from "../types";
import { formatDate, formatTime } from "../lib/slots";

interface Props {
  org: OrgInfo;
  property: Property;
  slot: TimeSlot;
  tourId: string;
  accessUrl: string;
}

export function ConfirmScreen({ org, property, slot, accessUrl }: Props) {
  const primary = org.primaryColor;

  return (
    <div style={{ textAlign: "center" }}>
      {/* Check icon */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: `${primary}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
        You're all set!
      </h3>
      <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
        Your self-guided tour has been confirmed.
      </p>

      {/* Tour details */}
      <div style={{
        background: "#f9fafb",
        borderRadius: 12,
        padding: "16px",
        textAlign: "left",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ marginTop: 2, color: "#9ca3af", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{property.address}</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{property.city}, {property.state} {property.zip}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ marginTop: 2, color: "#9ca3af", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{formatDate(slot.startsAt)}</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}</div>
          </div>
        </div>
      </div>

      {/* What to expect */}
      <div style={{ textAlign: "left", marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          What happens next
        </p>
        {[
          "Check your email and phone for a booking confirmation.",
          "15 minutes before your tour, you'll receive a text with your door code.",
          "Enter the code at the front door and explore at your own pace.",
          org.twilioPhoneNumber
            ? `Have questions? Text ${org.twilioPhoneNumber} and our AI assistant answers instantly.`
            : "Have questions? Our AI assistant is standing by via text.",
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: primary,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}>
              {i + 1}
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{step}</p>
          </div>
        ))}
      </div>

      {/* View access page link */}
      <a
        href={accessUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "10px 24px",
          borderRadius: 10,
          background: primary,
          color: "#fff",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        View your access page →
      </a>
    </div>
  );
}
