import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
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
        Your self-guided tour of {propertyAddress} is confirmed for {tourDate}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={{ ...header, backgroundColor: orgPrimaryColor }}>
            {orgLogoUrl ? (
              <Img src={orgLogoUrl} alt={orgName} width={140} height={40} />
            ) : (
              <Text style={headerTitle}>{orgName}</Text>
            )}
          </Section>

          {/* Body */}
          <Section style={content}>
            <Heading style={h1}>Tour Confirmed!</Heading>
            <Text style={paragraph}>
              Hi {visitorFirstName}, your self-guided tour has been confirmed.
            </Text>

            {/* Tour Details */}
            <Section style={detailBox}>
              <Row>
                <Column>
                  <Text style={detailLabel}>Property</Text>
                  <Text style={detailValue}>
                    {propertyAddress}
                    <br />
                    {propertyCity}, {propertyState}
                  </Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row>
                <Column>
                  <Text style={detailLabel}>Date & Time</Text>
                  <Text style={detailValue}>
                    {tourDate} at {tourTime}
                    <br />
                    Duration: {tourDurationMinutes} minutes
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={paragraph}>
              Your access code will be sent by text message{" "}
              <strong>15 minutes before your tour</strong>. You can also view
              your tour details and ask questions from the link below.
            </Text>

            <Button
              href={accessUrl}
              style={{ ...button, backgroundColor: orgPrimaryColor }}
            >
              View Tour Details
            </Button>

            {manageUrl && (
              <Text style={manageText}>
                Need to cancel or reschedule?{" "}
                <a href={manageUrl} style={manageLink}>
                  Manage your tour here
                </a>
              </Text>
            )}

            <Text style={paragraph}>
              During your tour, you can text questions to the number you
              received this confirmation from — our AI assistant will answer
              instantly.
            </Text>

            {agentName && agentEmail && (
              <Section style={agentSection}>
                <Text style={detailLabel}>Your Leasing Agent</Text>
                <Text style={paragraph}>
                  {agentName} — <a href={`mailto:${agentEmail}`}>{agentEmail}</a>
                </Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {orgName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              You received this email because you booked a tour.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default TourConfirmationEmail;

// ─── Styles ───────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const header: React.CSSProperties = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const headerTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "32px",
};

const h1: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#444444",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const detailBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  padding: "20px",
  margin: "24px 0",
};

const detailLabel: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const detailValue: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "16px",
  margin: "0",
};

const detailDivider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "16px 0",
};

const button: React.CSSProperties = {
  display: "inline-block",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  borderRadius: "6px",
  padding: "12px 24px",
  margin: "16px 0",
};

const manageText: React.CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0 0 16px",
};

const manageLink: React.CSSProperties = {
  color: "#7c3aed",
  textDecoration: "underline",
};

const agentSection: React.CSSProperties = {
  marginTop: "24px",
  paddingTop: "24px",
  borderTop: "1px solid #e2e8f0",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "0 0 4px",
};
