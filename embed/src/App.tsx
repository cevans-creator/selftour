import { useEffect, useReducer } from "react";
import type { Step, Property, TimeSlot } from "./types";
import { fetchOrgProperties, fetchPropertyDetail } from "./lib/api";
import { PropertyList } from "./components/PropertyList";
import { SlotPicker } from "./components/SlotPicker";
import { BookingForm } from "./components/BookingForm";
import { ConfirmScreen } from "./components/ConfirmScreen";

interface Props {
  orgSlug: string;
  propertyId?: string;
  colorOverride?: string;
  apiBase: string;
}

export function App({ orgSlug, propertyId, colorOverride, apiBase }: Props) {
  const [step, dispatch] = useReducer((_prev: Step, next: Step) => next, { type: "loading" });

  useEffect(() => {
    async function init() {
      try {
        if (propertyId) {
          // Single-property embed: skip the property list
          const { org, property, bookings } = await fetchPropertyDetail(apiBase, orgSlug, propertyId);
          dispatch({ type: "pick_slot", org: { ...org, primaryColor: colorOverride ?? org.primaryColor }, property, bookings });
        } else {
          // Org-level embed: show property list first
          const { org, properties } = await fetchOrgProperties(apiBase, orgSlug);
          dispatch({ type: "pick_property", org: { ...org, primaryColor: colorOverride ?? org.primaryColor }, properties });
        }
      } catch (err) {
        dispatch({ type: "error", message: err instanceof Error ? err.message : "Failed to load." });
      }
    }
    void init();
  }, [apiBase, orgSlug, propertyId, colorOverride]);

  const handlePropertySelect = async (property: Property) => {
    if (step.type !== "pick_property") return;
    const org = step.org;
    dispatch({ type: "loading" });
    try {
      const data = await fetchPropertyDetail(apiBase, orgSlug, property.id);
      dispatch({ type: "pick_slot", org, property: data.property, bookings: data.bookings });
    } catch (err) {
      dispatch({ type: "error", message: err instanceof Error ? err.message : "Failed to load property." });
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (step.type !== "pick_slot") return;
    dispatch({ type: "register", org: step.org, property: step.property, slot });
  };

  const handleConfirm = (tourId: string, accessUrl: string) => {
    if (step.type !== "register") return;
    dispatch({ type: "confirm", org: step.org, property: step.property, slot: step.slot, tourId, accessUrl });
  };

  const handleBackToSlots = () => {
    if (step.type !== "register") return;
    dispatch({ type: "pick_slot", org: step.org, property: step.property, bookings: [] });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const primary = step.type !== "loading" && step.type !== "error" ? step.org.primaryColor : "#2563eb";
  const orgName = step.type !== "loading" && step.type !== "error" ? step.org.name : "";
  const orgLogo = step.type !== "loading" && step.type !== "error" ? step.org.logoUrl : null;

  const wrapper: React.CSSProperties = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    fontSize: 16,
    lineHeight: 1.5,
    color: "#111827",
    WebkitFontSmoothing: "antialiased",
    maxWidth: 480,
    margin: "0 auto",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  };

  const header: React.CSSProperties = {
    padding: "16px 20px",
    background: primary,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const body: React.CSSProperties = {
    padding: 24,
  };

  // Step title shown in header
  const stepTitle =
    step.type === "pick_property" ? "Browse Homes" :
    step.type === "pick_slot" ? "Choose a Time" :
    step.type === "register" ? "Your Information" :
    step.type === "confirm" ? "Booking Confirmed" :
    "";

  return (
    <div style={wrapper}>
      {/* Header */}
      {orgName && (
        <div style={header}>
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} style={{ height: 28, objectFit: "contain" }} />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{orgName}</div>
            {stepTitle && (
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>{stepTitle}</div>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div style={body}>
        {step.type === "loading" && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af" }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `3px solid ${primary}`,
              borderTopColor: "transparent",
              margin: "0 auto 12px",
              animation: "ks-spin 0.8s linear infinite",
            }} />
            Loading…
          </div>
        )}

        {step.type === "error" && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 6 }}>Something went wrong</p>
            <p style={{ color: "#6b7280", fontSize: 14 }}>{step.message}</p>
          </div>
        )}

        {step.type === "pick_property" && (
          <PropertyList
            org={step.org}
            properties={step.properties}
            onSelect={(p) => void handlePropertySelect(p)}
          />
        )}

        {step.type === "pick_slot" && (
          <SlotPicker
            property={step.property}
            bookings={step.bookings}
            primaryColor={step.org.primaryColor}
            onSelect={handleSlotSelect}
          />
        )}

        {step.type === "register" && (
          <BookingForm
            apiBase={apiBase}
            org={step.org}
            property={step.property}
            slot={step.slot}
            onConfirm={handleConfirm}
            onBack={handleBackToSlots}
          />
        )}

        {step.type === "confirm" && (
          <ConfirmScreen
            org={step.org}
            property={step.property}
            slot={step.slot}
            tourId={step.tourId}
            accessUrl={step.accessUrl}
          />
        )}
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes ks-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
