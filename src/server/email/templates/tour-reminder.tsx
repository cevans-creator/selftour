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

interface TourReminderEmailProps {
  visitorFirstName: string;
  propertyAddress: string;
  tourDate: string;
  tourTime: string;
  hoursUntilTour: number;
  accessUrl: string;
  orgName: string;
  orgLogoUrl?: string;
  orgPrimaryColor?: string;
}

export function TourReminderEmail({
  visitorFirstName,
  propertyAddress,
  tourDate,
  tourTime,
  hoursUntilTour,
  accessUrl,
  orgName,
  orgLogoUrl,
  orgPrimaryColor = "#2563eb",
}: TourReminderEmailProps) {
  const reminderLabel =
    hoursUntilTour >= 20 ? "Tomorrow" : `In ${hoursUntilTour} hour${hoursUntilTour !== 1 ? "s" : ""}`;

  return (
    <Html>
      <Head />
      <Preview>
        {reminderLabel}: Your tour of {propertyAddress} at {tourTime}
      </Preview>
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
            <Heading style={h1}>
              {reminderLabel}: Your Tour
            </Heading>

            <Text style={paragraph}>
              Hi {visitorFirstName}! Just a reminder that your self-guided tour
              is coming up.
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightAddress}>{propertyAddress}</Text>
              <Text style={highlightTime}>
                {tourDate} at {tourTime}
              </Text>
            </Section>

            <Text style={paragraph}>
              Your door access code will be texted to you{" "}
              <strong>15 minutes before</strong> your tour starts.
              You can also ask questions via text during your tour.
            </Text>

            <Button
              href={accessUrl}
              style={{ ...button, backgroundColor: orgPrimaryColor }}
            >
              View Tour Details
            </Button>

            <Text style={paragraph}>
              Need to reschedule? Reply to this email or call the leasing
              office.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {orgName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default TourReminderEmail;

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

const highlightBox: React.CSSProperties = {
  backgroundColor: "#f0f7ff",
  borderLeft: "4px solid #2563eb",
  borderRadius: "4px",
  padding: "16px 20px",
  margin: "24px 0",
};

const highlightAddress: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const highlightTime: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0",
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
