import {
  Body,
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

interface TourCancellationEmailProps {
  visitorFirstName: string;
  propertyAddress: string;
  tourDate: string;
  tourTime: string;
  cancelReason?: string;
  orgName: string;
  orgLogoUrl?: string;
  orgPrimaryColor?: string;
}

export function TourCancellationEmail({
  visitorFirstName,
  propertyAddress,
  tourDate,
  tourTime,
  cancelReason,
  orgName,
  orgLogoUrl,
  orgPrimaryColor = "#2563eb",
}: TourCancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your tour of {propertyAddress} on {tourDate} has been cancelled
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
            <Heading style={h1}>Tour Cancelled</Heading>
            <Text style={paragraph}>
              Hi {visitorFirstName}, we wanted to let you know that your upcoming
              self-guided tour has been cancelled.
            </Text>

            {/* Tour Details */}
            <Section style={detailBox}>
              <Row>
                <Column>
                  <Text style={detailLabel}>Property</Text>
                  <Text style={detailValue}>{propertyAddress}</Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row>
                <Column>
                  <Text style={detailLabel}>Cancelled Tour Date</Text>
                  <Text style={detailValue}>
                    {tourDate} at {tourTime}
                  </Text>
                </Column>
              </Row>
              {cancelReason && cancelReason !== "Cancelled by admin" && (
                <>
                  <Hr style={detailDivider} />
                  <Row>
                    <Column>
                      <Text style={detailLabel}>Reason</Text>
                      <Text style={detailValue}>{cancelReason}</Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            <Text style={paragraph}>
              If you&apos;d like to reschedule, please visit the property page
              to book a new time. We apologize for any inconvenience.
            </Text>

            <Text style={paragraph}>
              If you have any questions, please don&apos;t hesitate to reach out
              to us directly.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {orgName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              You received this email because you had a tour scheduled with us.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default TourCancellationEmail;

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
  backgroundColor: "#fff5f5",
  borderRadius: "8px",
  border: "1px solid #fecaca",
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
  borderColor: "#fecaca",
  margin: "16px 0",
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
