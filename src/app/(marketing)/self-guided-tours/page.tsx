import Link from "next/link";
import { LogoFull } from "@/components/logo";

export const metadata = {
  title: "What Are Self-Guided Home Tours? — Complete Guide for Homebuilders",
  description: "Self-guided home tours let buyers tour model homes on their own schedule with automated smart lock access. Learn how builders use self-tour technology to increase sales and reduce staffing costs.",
  alternates: { canonical: "https://www.keysherpa.io/self-guided-tours" },
  openGraph: {
    title: "What Are Self-Guided Home Tours? — Complete Guide for Homebuilders",
    description: "Learn how builders use self-tour technology to increase sales and reduce staffing costs.",
    url: "https://www.keysherpa.io/self-guided-tours",
  },
};

export default function SelfGuidedToursPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1EA", color: "#3A3632", fontFamily: "var(--font-inter)" }}>
      <header className="py-6 px-6 border-b" style={{ borderColor: "#D4C9B8" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/"><LogoFull height={28} color="#2C2A26" accentColor="#A0522D" /></Link>
          <Link href="/pricing" className="text-sm font-medium" style={{ color: "#A0522D" }}>See Pricing</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "var(--font-mono)", color: "#A0522D" }}>Guide</p>

        <h1 className="text-3xl sm:text-4xl mb-6" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26", lineHeight: 1.15 }}>
          What Are Self-Guided Home Tours?<br />A Complete Guide for Homebuilders
        </h1>

        <p className="text-base leading-[1.8] mb-8" style={{ color: "#6B705C" }}>
          Self-guided home tours allow prospective buyers to tour model homes and new construction properties on their own schedule — without a sales agent present. Visitors book a time slot online, verify their identity, and receive a temporary smart lock access code via SMS. The door unlocks during their window and locks automatically when the tour ends.
        </p>

        <div className="space-y-12" style={{ color: "#6B705C", lineHeight: "1.8" }}>
          <section>
            <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>
              Why Homebuilders Are Adopting Self-Guided Tours
            </h2>
            <p>
              The homebuilding industry faces a staffing challenge: model homes need to be accessible to buyers, but staffing every community full-time is expensive. A single on-site sales agent costs $50,000-$80,000 per year in salary alone. For builders with 10, 20, or 50+ active communities, the math doesn't work.
            </p>
            <p className="mt-4">
              Meanwhile, buyer behavior has shifted. <strong style={{ color: "#2C2A26" }}>40% of self-guided home tours happen outside traditional business hours</strong> — evenings, weekends, and lunch breaks. These are qualified, motivated buyers who want to see a home on their schedule. If the model is locked when they arrive, they move on to a competitor.
            </p>
            <p className="mt-4">
              Self-guided tour technology solves both problems: it reduces staffing costs while expanding tour availability to 24/7.
            </p>
          </section>

          <section>
            <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>
              How Self-Guided Tour Technology Works
            </h2>
            <p>A modern self-guided tour platform handles the entire visitor experience automatically:</p>
            <ol className="mt-4 space-y-3 list-decimal list-inside">
              <li><strong style={{ color: "#2C2A26" }}>Booking:</strong> Visitors select a time slot on the builder's website or a property listing site (Zillow, Realtor.com).</li>
              <li><strong style={{ color: "#2C2A26" }}>Identity verification:</strong> The visitor provides their name, phone, email, and optionally verifies their identity via photo ID or credit card.</li>
              <li><strong style={{ color: "#2C2A26" }}>Automated communication:</strong> The platform sends a confirmation email, a 24-hour reminder, a 1-hour reminder, and the access code 15 minutes before the tour.</li>
              <li><strong style={{ color: "#2C2A26" }}>Smart lock access:</strong> A time-locked door code is programmed on the smart lock. It only works during the visitor's scheduled window.</li>
              <li><strong style={{ color: "#2C2A26" }}>During the tour:</strong> Some platforms offer an AI assistant that answers visitor questions via SMS — about the home, the community, HOA details, school districts, and more.</li>
              <li><strong style={{ color: "#2C2A26" }}>Post-tour:</strong> The access code is automatically deleted, a follow-up email and SMS are sent, and the visitor's data is logged for the sales team.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>
              Self-Guided Tour Hardware: Smart Lock Hubs
            </h2>
            <p>
              Self-guided tours require a physical device at each property to control the smart lock. The two main approaches are:
            </p>
            <ul className="mt-4 space-y-3">
              <li><strong style={{ color: "#2C2A26" }}>Cloud-connected locks (WiFi):</strong> Locks like the Schlage Encode connect directly to WiFi and are managed through cloud APIs (e.g., Seam). These work well but require reliable WiFi at the property.</li>
              <li><strong style={{ color: "#2C2A26" }}>Z-Wave hubs with cellular:</strong> A dedicated hub (like KeySherpa's Raspberry Pi-based unit) connects to Z-Wave locks over cellular data. This is more reliable in new construction where WiFi may not be available, and supports a wider range of lock brands including Kwikset, Schlage, and Yale.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>
              ROI of Self-Guided Tours for Homebuilders
            </h2>
            <p>The return on investment comes from three sources:</p>
            <ul className="mt-4 space-y-3">
              <li><strong style={{ color: "#2C2A26" }}>Staffing cost reduction:</strong> Builders typically reduce model home staffing by 40-60%. One roving agent can cover 3-5 communities instead of one.</li>
              <li><strong style={{ color: "#2C2A26" }}>Revenue capture:</strong> After-hours tours generate incremental sales that would otherwise be lost. Even at a conservative 5% conversion rate, the additional tour volume translates to significant revenue.</li>
              <li><strong style={{ color: "#2C2A26" }}>Data and follow-up:</strong> Every visitor is tracked — name, contact info, which property they toured, how long they stayed. This data feeds the sales pipeline automatically.</li>
            </ul>
            <p className="mt-4">
              For a builder with 20 communities, the typical annual benefit exceeds $200,000 in combined staffing savings and incremental revenue.
            </p>
          </section>

          <section>
            <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>
              Self-Guided Tour Platforms: What to Look For
            </h2>
            <p>When evaluating self-tour technology, homebuilders should consider:</p>
            <ul className="mt-4 space-y-2">
              <li>• <strong style={{ color: "#2C2A26" }}>Hardware reliability:</strong> Does the system work on cellular (not just WiFi)? Can it survive a power cycle?</li>
              <li>• <strong style={{ color: "#2C2A26" }}>Setup time:</strong> How long does it take to deploy at a new community? Hours or weeks?</li>
              <li>• <strong style={{ color: "#2C2A26" }}>Lock compatibility:</strong> Which smart lock brands are supported? Is additional hardware required?</li>
              <li>• <strong style={{ color: "#2C2A26" }}>Visitor experience:</strong> Is the booking flow mobile-friendly? Are access codes delivered via SMS automatically?</li>
              <li>• <strong style={{ color: "#2C2A26" }}>AI and automation:</strong> Does the platform handle follow-up automatically? Is there an AI assistant during the tour?</li>
              <li>• <strong style={{ color: "#2C2A26" }}>Security:</strong> Is identity verification included? Are access codes time-limited and auto-deleted?</li>
              <li>• <strong style={{ color: "#2C2A26" }}>Analytics:</strong> Can you see tour completion rates, lead sources, and visitor engagement?</li>
              <li>• <strong style={{ color: "#2C2A26" }}>Cost:</strong> What's the effective per-community cost? Are there setup fees or hardware costs?</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-fraunces)", color: "#2C2A26" }}>
              Getting Started with Self-Guided Tours
            </h2>
            <p>
              Most builders start with 3-5 communities to validate the concept, then expand across their portfolio. The key is choosing a platform that scales without multiplying complexity — one that handles the hardware, the visitor communication, and the analytics in a single dashboard.
            </p>
            <p className="mt-4">
              <Link href="/pricing" className="font-medium hover:underline" style={{ color: "#A0522D" }}>
                KeySherpa is purpose-built for homebuilders
              </Link> — our hub ships pre-configured, pairs with your lock in minutes, and includes AI visitor Q&A and full tour analytics on every plan. <Link href="/pricing#contact" className="font-medium hover:underline" style={{ color: "#A0522D" }}>Request a demo</Link> to see it in action.
            </p>
          </section>
        </div>

        {/* FAQ Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is a self-guided home tour?",
              acceptedAnswer: { "@type": "Answer", text: "A self-guided home tour allows prospective buyers to tour model homes on their own schedule using automated smart lock access. Visitors book online, verify their identity, receive a time-locked door code via SMS, and tour the property without a sales agent present." },
            },
            {
              "@type": "Question",
              name: "How much do self-guided tour systems cost for homebuilders?",
              acceptedAnswer: { "@type": "Answer", text: "Self-guided tour platforms typically charge per community per month. Costs vary by provider and scale — builders with more communities get volume pricing. Most platforms include hardware (smart lock hubs) in the subscription with no upfront costs." },
            },
            {
              "@type": "Question",
              name: "Are self-guided home tours safe?",
              acceptedAnswer: { "@type": "Answer", text: "Yes. Modern self-tour platforms require identity verification (photo ID or credit card) before issuing access codes. Codes are time-locked to the visitor's scheduled window and auto-delete when the tour ends. The builder has a full audit trail of every visitor." },
            },
            {
              "@type": "Question",
              name: "What smart locks work with self-guided tour systems?",
              acceptedAnswer: { "@type": "Answer", text: "Most self-tour platforms support Z-Wave locks (Kwikset, Schlage, Yale) and WiFi-connected locks (Schlage Encode, August). Z-Wave with a cellular hub is preferred for new construction where WiFi may not be available." },
            },
            {
              "@type": "Question",
              name: "How long does it take to set up self-guided tours at a property?",
              acceptedAnswer: { "@type": "Answer", text: "With modern platforms like KeySherpa, setup takes under an hour per community — plug in the hub, pair the lock from the dashboard, and start accepting tour bookings." },
            },
          ],
        })}} />
      </main>

      <footer className="py-10 px-6" style={{ borderTop: "1px solid #D4C9B8" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <LogoFull height={22} color="#6B705C" accentColor="#A0522D" />
          <p className="text-xs" style={{ color: "#D4C9B8" }}>&copy; {new Date().getFullYear()} KeySherpa</p>
        </div>
      </footer>
    </div>
  );
}
