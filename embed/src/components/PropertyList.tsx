import type { OrgInfo, Property } from "../types";
import { formatCurrency } from "../lib/slots";

interface Props {
  org: OrgInfo;
  properties: Property[];
  onSelect: (property: Property) => void;
}

export function PropertyList({ org, properties, onSelect }: Props) {
  const primary = org.primaryColor;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          Select a property to schedule your self-guided tour.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 16px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = primary;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px ${primary}20`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 72,
                height: 56,
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0,
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {p.imageUrls[0] ? (
                <img
                  src={p.imageUrls[0]}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 2 }}>
                {p.name}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {p.address}, {p.city}, {p.state}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 12, color: "#9ca3af" }}>
                {p.bedrooms !== null && <span>{p.bedrooms} bd</span>}
                {p.bathrooms && <span>{p.bathrooms} ba</span>}
                {p.squareFeet && <span>{p.squareFeet.toLocaleString()} sqft</span>}
              </div>
            </div>

            {/* Price + arrow */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              {p.price && (
                <span style={{ fontWeight: 700, fontSize: 14, color: primary }}>
                  {formatCurrency(p.price)}
                </span>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
