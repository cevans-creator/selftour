import Link from "next/link";
import { LogoFull } from "@/components/logo";

export default function TermsPage() {
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
      <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>{appName} Terms &amp; Conditions</h1>
      <p className="text-sm mb-10" style={{ color: "#6B705C" }}>Effective date: April 1, 2026</p>

      <section className="max-w-none space-y-8" style={{ color: "#6B705C", lineHeight: "1.8" }}>
        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>1. Self-Guided Tours</h2>
          <p>{appName} provides technology that enables self-guided tours of residential properties. By scheduling a tour, you agree to enter and exit the property only during your scheduled time window.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>2. Access Codes</h2>
          <p>The temporary PIN code provided to you is for your personal use only. Do not share your access code with others. Your code is valid only during your scheduled tour window and will be automatically deactivated when your tour ends.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>3. Property Conduct</h2>
          <p>You agree to treat the property and its contents with respect. You will not damage, remove, or disturb any items within the property. The property owner reserves the right to pursue legal action for any damage caused during your tour.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>4. SMS Communications</h2>
          <p>By providing your phone number, you consent to receive SMS messages related to your tour, including your access code and tour link. Message frequency: 1–3 messages per scheduled tour. Message and data rates may apply.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>To opt out, reply <strong>STOP</strong> to any message</li>
            <li>For help, reply <strong>HELP</strong> or contact us at <a href={`mailto:${email}`} className="text-blue-600 underline">{email}</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>5. Identity Verification</h2>
          <p>We may require identity verification before granting property access. You agree to provide accurate identification information. Providing false information will result in immediate cancellation of your tour access.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>6. Limitation of Liability</h2>
          <p>{appName} is a technology platform only. We are not responsible for the condition of any property, injuries sustained during a tour, or any disputes between visitors and property owners.</p>
        </div>

        <div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>7. Contact</h2>
          <p>For questions about these terms, contact us at <a href={`mailto:${email}`} className="underline" style={{ color: "#A0522D" }}>{email}</a>.</p>
        </div>
      </section>
    </main>
    </div>
  );
}
