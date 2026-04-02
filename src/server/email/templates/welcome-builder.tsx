import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeBuilderEmailProps {
  firstName: string;
  orgName: string;
  dashboardUrl: string;
  docsUrl?: string;
}

export function WelcomeBuilderEmail({
  firstName,
  orgName,
  dashboardUrl,
  docsUrl = "https://docs.keysherpa.io",
}: WelcomeBuilderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to KeySherpa, {firstName} — let's get your first property live</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>KeySherpa</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Welcome, {firstName}!</Heading>
            <Text style={paragraph}>
              You're all set up with your <strong>{orgName}</strong> account.
              KeySherpa makes it easy to offer 24/7 self-guided tours with smart
              locks, AI assistance, and automated follow-ups — all in one place.
            </Text>

            <Button href={dashboardUrl} style={button}>
              Go to Your Dashboard
            </Button>

            <Hr style={divider} />

            <Heading style={h2}>Get started in 3 steps</Heading>

            <Section style={step}>
              <Text style={stepNumber}>1</Text>
              <Text style={stepContent}>
                <strong>Connect your smart lock</strong>
                <br />
                Go to Integrations and connect your SmartThings or Schlage
                lock via the Seam dashboard.
              </Text>
            </Section>

            <Section style={step}>
              <Text style={stepNumber}>2</Text>
              <Text style={stepContent}>
                <strong>Add your first property</strong>
                <br />
                Set up your property details, photos, tour schedule, and
                assign the smart lock.
              </Text>
            </Section>

            <Section style={step}>
              <Text style={stepNumber}>3</Text>
              <Text style={stepContent}>
                <strong>Share your tour link</strong>
                <br />
                Copy your unique tour link and add it to your listings,
                website, or QR code signs.
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              Questions? Check out our{" "}
              <a href={docsUrl} style={link}>
                documentation
              </a>{" "}
              or reply to this email.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} KeySherpa. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeBuilderEmail;

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
  backgroundColor: "#7c3aed",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
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

const h2: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#444444",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  borderRadius: "6px",
  padding: "12px 24px",
  margin: "8px 0 24px",
};

const divider: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const step: React.CSSProperties = {
  display: "flex" as const,
  alignItems: "flex-start" as const,
  marginBottom: "16px",
};

const stepNumber: React.CSSProperties = {
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "28px",
  fontSize: "14px",
  fontWeight: "700",
  flexShrink: 0,
  margin: "0 12px 0 0",
  display: "inline-block",
};

const stepContent: React.CSSProperties = {
  color: "#444444",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0",
};

const link: React.CSSProperties = {
  color: "#7c3aed",
  textDecoration: "underline",
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
