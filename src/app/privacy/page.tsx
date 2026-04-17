import Link from "next/link";
import { LogoFull } from "@/components/logo";

export const metadata = {
  title: "Privacy Policy",
  description: "KeySherpa privacy policy — how we collect, use, and protect visitor and customer data.",
  alternates: { canonical: "https://www.keysherpa.io/privacy" },
};

export default function PrivacyPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "KeySherpa";
  const email = "support@keysherpa.io";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1EA", color: "#3A3632", fontFamily: "var(--font-inter)" }}>
      <header className="py-6 px-6 border-b" style={{ borderColor: "#D4C9B8" }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/"><LogoFull height={28} color="#2C2A26" accentColor="#A0522D" /></Link>
        </div>
      </header>
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>{appName} Privacy Policy</h1>
      <p className="text-sm mb-10" style={{ color: "#6B705C" }}>Effective date: April 1, 2026</p>

      <section className="max-w-none space-y-8" style={{ color: "#6B705C", lineHeight: "1.8" }}>
        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>1. Information We Collect</h2>
          <p>When you schedule a self-guided home tour, we collect your name, email address, and phone number. We use this information solely to provide you access to the property you requested to tour.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To send you a temporary access code and tour link via SMS or email</li>
            <li>To verify your identity before granting property access</li>
            <li>To communicate with you about your scheduled tour</li>
          </ul>
          <p className="mt-2">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>3. SMS Messaging</h2>
          <p>By providing your phone number, you consent to receive SMS messages containing your tour access code and link. Message and data rates may apply. You can opt out at any time by replying STOP. For help, reply HELP.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>4. Data Retention</h2>
          <p>Tour records and visitor information are retained for up to 12 months for security and compliance purposes, then permanently deleted.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>5. Security</h2>
          <p>Access codes are temporary and expire automatically at the end of your scheduled tour window. We use industry-standard encryption to protect your data in transit and at rest.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>6. Contact</h2>
          <p>For privacy-related questions, contact us at <a href={`mailto:${email}`} className="underline" style={{ color: "#A0522D" }}>{email}</a>.</p>
        </div>
      </section>
    </main>
    </div>
  );
}
