import {
  LogoMarkA, LogoMarkB, LogoMarkC,
  LogoFullA, LogoFullB, LogoFullC,
} from "@/components/logo";

export default function LogoPreview() {
  const concepts = [
    {
      name: "A — The Keyhole Peak",
      story: "A keyhole silhouette with a mountain peak in the negative space. Access meets guidance.",
      Mark: LogoMarkA,
      Full: LogoFullA,
    },
    {
      name: "B — The Key Path",
      story: "A key whose teeth form ascending steps — unlocking as a guided ascent.",
      Mark: LogoMarkB,
      Full: LogoFullB,
    },
    {
      name: "C — The Summit Door",
      story: "A doorway crowned by a peak — the threshold where home meets journey.",
      Mark: LogoMarkC,
      Full: LogoFullC,
    },
  ];

  return (
    <div style={{ fontFamily: "var(--font-inter)", padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 36, color: "#2C2A26", marginBottom: 8 }}>
        Logo Concepts
      </h1>
      <p style={{ color: "#6B705C", marginBottom: 60, fontSize: 15 }}>
        3 directions. Pick the one with the best story. The active one on the landing page is marked.
      </p>

      {concepts.map((c) => (
        <div key={c.name} style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, color: "#2C2A26", marginBottom: 4 }}>
            {c.name}
          </h2>
          <p style={{ color: "#8B7355", fontSize: 13, marginBottom: 32, fontStyle: "italic" }}>
            &ldquo;{c.story}&rdquo;
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Light background */}
            <div style={{ backgroundColor: "#F5F1EA", borderRadius: 16, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 32, border: "1px solid #D4C9B8" }}>
              <c.Mark size={64} color="#2C2A26" />
              <c.Mark size={32} color="#2C2A26" />
              <c.Mark size={16} color="#2C2A26" />
              <div style={{ borderTop: "1px solid #D4C9B8", width: "100%", paddingTop: 24, display: "flex", justifyContent: "center" }}>
                <c.Full height={36} color="#2C2A26" accentColor="#A0522D" />
              </div>
            </div>

            {/* Dark background */}
            <div style={{ backgroundColor: "#2C2A26", borderRadius: 16, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              <c.Mark size={64} color="#EDE6D9" />
              <c.Mark size={32} color="#EDE6D9" />
              <c.Mark size={16} color="#EDE6D9" />
              <div style={{ borderTop: "1px solid rgba(237,230,217,0.15)", width: "100%", paddingTop: 24, display: "flex", justifyContent: "center" }}>
                <c.Full height={36} color="#EDE6D9" accentColor="#A0522D" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <p style={{ color: "#A68A64", fontSize: 12, textAlign: "center", marginTop: 40 }}>
        To change the active logo, edit the exports at the bottom of src/components/logo.tsx
      </p>
    </div>
  );
}
