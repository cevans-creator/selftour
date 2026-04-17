import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KeySherpa — Self-Guided Tour Software for Homebuilders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          backgroundColor: "#F5F1EA",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            backgroundColor: "#A0522D", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontSize: "24px", fontWeight: 700,
          }}>
            K
          </div>
          <span style={{ fontSize: "28px", fontWeight: 600, color: "#2C2A26", letterSpacing: "0.02em" }}>
            KeySherpa
          </span>
        </div>
        <div style={{ fontSize: "56px", fontWeight: 700, color: "#2C2A26", lineHeight: 1.15, marginBottom: "20px" }}>
          Home tours that run themselves.
        </div>
        <div style={{ fontSize: "22px", color: "#6B705C", lineHeight: 1.6 }}>
          Smart lock hubs, AI visitor Q&A, and automated access codes for homebuilders.
        </div>
        <div style={{
          position: "absolute", bottom: "60px", right: "80px",
          fontSize: "16px", color: "#A0522D", fontWeight: 500,
        }}>
          keysherpa.io
        </div>
      </div>
    ),
    { ...size }
  );
}
