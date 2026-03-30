import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TourFollowupEmailProps {
  visitorFirstName: string;
  propertyAddress: string;
  tourDate: string;
  orgName: string;
  orgLogoUrl?: string;
  orgPrimaryColor?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  ctaUrl?: string;
  isNurture?: boolean; // true = 72h nurture email, false = same-day follow-up
}

export function TourFollowupEmail({
  visitorFirstName,
  propertyAddress,
  tourDate,
  orgName,
  orgLogoUrl,
  orgPrimaryColor = "#2563eb",
  agentName,
  agentEmail,
  agentPhone,
  ctaUrl,
  isNurture = false,
}: TourFollowupEmailProps) {
  const subject = isNurture
    ? `Still thinking about ${propertyAddress}?`
    : `Thank you for touring ${propertyAddress}`;

  const headline = isNurture
    ? "Still Thinking About It?"
    : `Thanks for Visiting, ${visitorFirstName}!`;

  const intro = isNurture
    ? `Hi ${visitorFirstName}, it's been a few days since your tour of ${propertyAddress}. We'd love to answer any remaining questions and help you make a decision.`
    : `Hi ${visitorFirstName}, thank you so much for taking the time to tour ${propertyAddress} on ${tourDate}. We hope you loved it!`;

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: orgPrimaryColor }}>
            {orgLogoUrl ? (
              <Img src={orgLogoUrl} alt={orgName} width={140} height={40} />
            ) : (
              <Text style={headerTitle}>{orgName}</Text>
            )}
          </Section>

          <Section style={content}>
            <Heading style={h1}>{headline}</Heading>
            <Text style={paragraph}>{intro}</Text>

            {!isNurture && (
              <>
                <Text style={paragraph}>
                  Have questions about the home, neighborhood, pricing, or
                  anything else? Our team is here to help.
                </Text>
              </>
            )}

            {isNurture && (
              <Section style={valueProps}>
                <Text style={valuePropItem}>✓ Lock in today's pricing</Text>
                <Text style={valuePropItem}>✓ Ask any lingering questions</Text>
                <Text style={valuePropItem}>✓ Schedule a second visit</Text>
              </Section>
            )}

            {ctaUrl && (
              <Button
                href={ctaUrl}
                style={{ ...button, backgroundColor: orgPrimaryColor }}
              >
                {isNurture ? "Schedule Another Tour" : "View Property Details"}
              </Button>
            )}

            {(agentName || agentEmail || agentPhone) && (
              <Section style={agentCard}>
                <Text style={agentLabel}>Your Leasing Specialist</Text>
                {agentName && <Text style={agentName2}>{agentName}</Text>}
                {agentEmail && (
                  <Text style={agentContact}>
                    <a href={`mailto:${agentEmail}`}>{agentEmail}</a>
                  </Text>
                )}
                {agentPhone && (
                  <Text style={agentContact}>
                    <a href={`tel:${agentPhone}`}>{agentPhone}</a>
                  </Text>
                )}
              </Section>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {orgName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default TourFollowupEmail;

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

const valueProps: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "20px 0",
};

const valuePropItem: React.CSSProperties = {
  color: "#166534",
  fontSize: "16px",
  margin: "0 0 8px",
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

const agentCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  padding: "20px",
  marginTop: "24px",
};

const agentLabel: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px",
};

const agentName2: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const agentContact: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "14px",
  margin: "0 0 4px",
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
  margin: "0",
};
