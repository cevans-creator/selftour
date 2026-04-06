import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TourConfirmationEmailProps {
  visitorFirstName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  tourDate: string;
  tourTime: string;
  tourDurationMinutes: number;
  accessUrl: string;
  manageUrl?: string;
  orgName: string;
  orgLogoUrl?: string;
  orgPrimaryColor?: string;
  agentName?: string;
  agentEmail?: string;
}

export function TourConfirmationEmail({
  visitorFirstName,
  propertyAddress,
  propertyCity,
  propertyState,
  tourDate,
  tourTime,
  tourDurationMinutes,
  accessUrl,
  manageUrl,
  orgName,
  orgLogoUrl,
  orgPrimaryColor = "#2563eb",
  agentName,
  agentEmail,
}: TourConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You're confirmed! Your tour of {propertyAddress} is on {tourDate} at {tourTime}.
      </Preview>
      <Body style={body}>
        <Container style={wrapper}>

          {/* ── Color stripe ── */}
          <Section style={{ ...stripe, backgroundColor: orgPrimaryColor }} />

          {/* ── Logo / org name ── */}
          <Section style={logoSection}>
            {orgLogoUrl ? (
              <Img
                src={orgLogoUrl}
                alt={orgName}
                height={48}
                style={{ maxWidth: 180, display: "block", margin: "0 auto" }}
              />
            ) : (
              <Text style={{ ...orgNameText, color: orgPrimaryColor }}>{orgName}</Text>
            )}
          </Section>

          {/* ── Hero ── */}
          <Section style={{ ...hero, backgroundColor: orgPrimaryColor }}>
            <Text style={heroBadge}>✓ Booking Confirmed</Text>
            <Text style={heroHeading}>You're all set, {visitorFirstName}!</Text>
            <Text style={heroSub}>Your self-guided tour has been confirmed.</Text>
          </Section>

          {/* ── Tour details card ── */}
          <Section style={card}>
            <Section style={detailRow}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td width="36" valign="top">
                      <div style={{ ...iconBox, backgroundColor: orgPrimaryColor + "18" }}>
                        <Text style={{ ...iconText, color: orgPrimaryColor }}>📍</Text>
                      </div>
                    </td>
                    <td style={{ paddingLeft: 12 }}>
                      <Text style={detailLabel}>Property</Text>
                      <Text style={detailValue}>{propertyAddress}</Text>
                      <Text style={detailSub}>{propertyCity}, {propertyState}</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <div style={divider} />

            <Section style={detailRow}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td width="36" valign="top">
                      <div style={{ ...iconBox, backgroundColor: orgPrimaryColor + "18" }}>
                        <Text style={{ ...iconText, color: orgPrimaryColor }}>🗓</Text>
                      </div>
                    </td>
                    <td style={{ paddingLeft: 12 }}>
                      <Text style={detailLabel}>Date &amp; Time</Text>
                      <Text style={detailValue}>{tourDate}</Text>
                      <Text style={detailSub}>{tourTime} · {tourDurationMinutes} minutes</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          </Section>

          {/* ── What happens next ── */}
          <Section style={content}>
            <Text style={sectionHeading}>What happens next</Text>

            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                {[
                  ["Confirmation sent", "Check your email and phone for booking details."],
                  ["15 min before your tour", "You'll receive a text with your 4-digit door access code."],
                  ["At the door", "Enter your code on the keypad — no agent needed."],
                  ["Questions during the tour?", "Text our AI assistant for instant answers on pricing, HOA fees, and more."],
                ].map(([label, desc], i) => (
                  <tr key={i}>
                    <td width="28" valign="top" style={{ paddingBottom: 16 }}>
                      <div style={{ ...stepBadge, backgroundColor: orgPrimaryColor }}>
                        <span style={stepNum}>{i + 1}</span>
                      </div>
                    </td>
                    <td style={{ paddingLeft: 12, paddingBottom: 16 }}>
                      <Text style={stepLabel}>{label}</Text>
                      <Text style={stepDesc}>{desc}</Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Section style={{ textAlign: "center" as const, margin: "28px 0 8px" }}>
              <Button
                href={accessUrl}
                style={{ ...ctaButton, backgroundColor: orgPrimaryColor }}
              >
                View Your Tour Page →
              </Button>
            </Section>

            {manageUrl && (
              <Text style={manageText}>
                Need to cancel or reschedule?{" "}
                <a href={manageUrl} style={{ color: orgPrimaryColor }}>
                  Manage your tour
                </a>
              </Text>
            )}

            {agentName && agentEmail && (
              <Section style={agentBox}>
                <Text style={detailLabel}>Your Leasing Contact</Text>
                <Text style={agentName2}>{agentName}</Text>
                <Text style={agentEmailStyle}>
                  <a href={`mailto:${agentEmail}`} style={{ color: orgPrimaryColor }}>{agentEmail}</a>
                </Text>
              </Section>
            )}
          </Section>

          {/* ── Footer ── */}
          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} {orgName}</Text>
            <Text style={footerText}>You received this because you booked a self-guided tour.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default TourConfirmationEmail;

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f0f2f5",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif',
  margin: 0,
  padding: "32px 0",
};

const wrapper: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "580px",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const stripe: React.CSSProperties = {
  height: "5px",
  lineHeight: "5px",
  fontSize: "1px",
};

const logoSection: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "28px 32px 24px",
  textAlign: "center" as const,
};

const orgNameText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "800",
  margin: 0,
  letterSpacing: "-0.3px",
};

const hero: React.CSSProperties = {
  padding: "32px 36px 28px",
  textAlign: "center" as const,
};

const heroBadge: React.CSSProperties = {
  display: "inline-block",
  color: "rgba(255,255,255,0.9)",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.05em",
  backgroundColor: "rgba(255,255,255,0.18)",
  borderRadius: "20px",
  padding: "4px 14px",
  margin: "0 0 14px",
};

const heroHeading: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "30px",
  fontWeight: "800",
  margin: "0 0 8px",
  lineHeight: "1.2",
  letterSpacing: "-0.4px",
};

const heroSub: React.CSSProperties = {
  color: "rgba(255,255,255,0.85)",
  fontSize: "15px",
  margin: 0,
};

const card: React.CSSProperties = {
  margin: "24px 28px",
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  border: "1px solid #e8ecf0",
  padding: "4px 0",
};

const detailRow: React.CSSProperties = {
  padding: "16px 20px",
};

const divider: React.CSSProperties = {
  borderTop: "1px solid #e8ecf0",
  margin: "0 20px",
};

const iconBox: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
};

const iconText: React.CSSProperties = {
  fontSize: "18px",
  margin: 0,
  lineHeight: "36px",
  textAlign: "center" as const,
  width: 36,
};

const detailLabel: React.CSSProperties = {
  color: "#8896a7",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
  margin: "0 0 3px",
};

const detailValue: React.CSSProperties = {
  color: "#0f1724",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
  lineHeight: "1.4",
};

const detailSub: React.CSSProperties = {
  color: "#5a6880",
  fontSize: "14px",
  margin: "2px 0 0",
};

const content: React.CSSProperties = {
  padding: "8px 32px 32px",
};

const sectionHeading: React.CSSProperties = {
  color: "#0f1724",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 18px",
};

const stepBadge: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "24px",
  display: "inline-block",
};

const stepNum: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
};

const stepLabel: React.CSSProperties = {
  color: "#0f1724",
  fontSize: "13px",
  fontWeight: "700",
  margin: "0 0 1px",
};

const stepDesc: React.CSSProperties = {
  color: "#5a6880",
  fontSize: "13px",
  margin: 0,
  lineHeight: "1.5",
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  borderRadius: "8px",
  padding: "14px 32px",
};

const manageText: React.CSSProperties = {
  color: "#8896a7",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "14px 0 0",
};

const agentBox: React.CSSProperties = {
  marginTop: "28px",
  paddingTop: "24px",
  borderTop: "1px solid #e8ecf0",
};

const agentName2: React.CSSProperties = {
  color: "#0f1724",
  fontSize: "15px",
  fontWeight: "600",
  margin: "2px 0 2px",
};

const agentEmailStyle: React.CSSProperties = {
  color: "#5a6880",
  fontSize: "14px",
  margin: 0,
};

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e8ecf0",
  padding: "20px 32px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#aab4c0",
  fontSize: "12px",
  margin: "0 0 3px",
};
