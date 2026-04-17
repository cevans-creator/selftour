import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { LogoFull } from "@/components/logo";
import { PricingContactForm } from "@/components/pricing-contact-form";

export const metadata = {
  title: "Pricing — Plans for Every Builder",
  description: "KeySherpa pricing for homebuilders. Rookie, Pro, and Elite plans. Smart lock hub hardware included. No setup fees. Get custom pricing for your communities.",
  alternates: { canonical: "https://www.keysherpa.io/pricing" },
  openGraph: {
    title: "KeySherpa Pricing — Plans for Every Builder",
    description: "Smart lock hub hardware included. No setup fees. Rookie, Pro, and Elite plans that scale with your communities.",
    url: "https://www.keysherpa.io/pricing",
  },
};

const C = {
  bg: "#F5F1EA",
  bgDark: "#2C2A26",
  text: "#3A3632",
  textMuted: "#6B705C",
  textLight: "#EDE6D9",
  accent: "#A0522D",
  border: "#D4C9B8",
  borderDark: "rgba(237,230,217,0.1)",
};

const PLANS = [
  {
    name: "Rookie",
    description: "Small teams getting started.",
    features: ["Up to 10 properties", "200 tours/month", "5 team members", "Smart lock hub included", "Email + SMS automation", "AI visitor assistant", "Tour reporting", "Website embed widget", "Identity verification"],
    cta: "Get Pricing",
    popular: false,
  },
  {
    name: "Pro",
    description: "Growing companies at scale.",
    features: ["Up to 50 properties", "1,000 tours/month", "15 team members", "Everything in Rookie", "Advanced analytics", "Lead source tracking", "CRM integration", "Priority support"],
    cta: "Get Pricing",
    popular: true,
  },
  {
    name: "Elite",
    description: "Enterprise builders.",
    features: ["Unlimited everything", "Everything in Pro", "White-label branding", "Credit card verification", "Custom integrations & API", "Dedicated account manager", "SLA & uptime guarantee"],
    cta: "Contact Sales",
    popular: false,
  },
];

const COMPARISON = [
  { feature: "Properties", rookie: "10", pro: "50", elite: "Unlimited" },
  { feature: "Tours per month", rookie: "200", pro: "1,000", elite: "Unlimited" },
  { feature: "Team members", rookie: "5", pro: "15", elite: "Unlimited" },
  { feature: "Smart lock hub hardware", rookie: true, pro: true, elite: true },
  { feature: "Automated access codes", rookie: true, pro: true, elite: true },
  { feature: "Email campaigns", rookie: true, pro: true, elite: true },
  { feature: "Photo ID verification", rookie: true, pro: true, elite: true },
  { feature: "Website embed widget", rookie: true, pro: true, elite: true },
  { feature: "Tour notifications", rookie: true, pro: true, elite: true },
  { feature: "SMS campaigns", rookie: false, pro: true, elite: true },
  { feature: "AI visitor chat (SMS)", rookie: false, pro: true, elite: true },
  { feature: "Lead source tracking", rookie: false, pro: true, elite: true },
  { feature: "Advanced analytics", rookie: false, pro: true, elite: true },
  { feature: "CRM integration", rookie: false, pro: true, elite: true },
  { feature: "Credit card verification", rookie: false, pro: false, elite: true },
  { feature: "White-label branding", rookie: false, pro: false, elite: true },
  { feature: "Custom integrations / API", rookie: false, pro: false, elite: true },
  { feature: "Dedicated account manager", rookie: false, pro: false, elite: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.text, fontFamily: "var(--font-inter)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: `${C.bg}e6`, borderBottom: `1px solid ${C.border}` }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/"><LogoFull height={28} color={C.text} accentColor={C.accent} /></Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm hover:opacity-70 transition-opacity" style={{ color: C.textMuted }}>Sign In</Link>
            <Link href="#contact" className="rounded-lg px-5 py-2 text-sm font-medium text-white" style={{ backgroundColor: C.accent }}>
              Schedule Demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "var(--font-mono)", color: C.accent }}>Plans</p>
            <h1 className="text-4xl sm:text-5xl leading-[1.1] mb-4 max-w-lg" style={{ fontFamily: "var(--font-fraunces)" }}>
              Plans that scale with your business
            </h1>
            <p className="text-base leading-[1.7] max-w-lg" style={{ color: C.textMuted }}>
              Every plan includes hub hardware and full-service onboarding. No setup fees.
            </p>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="px-6 pb-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan) => (
              <div key={plan.name}
                className="rounded-xl p-7 flex flex-col h-full"
                style={{
                  backgroundColor: plan.popular ? C.bgDark : "rgba(255,255,255,0.55)",
                  boxShadow: plan.popular ? "0 16px 64px rgba(44,42,38,0.2)" : "0 8px 40px rgba(139,115,85,0.08)",
                  border: plan.popular ? `1px solid rgba(160,82,45,0.3)` : `1px solid ${C.border}`,
                }}>
                {plan.popular && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white self-start mb-4"
                    style={{ backgroundColor: C.accent, fontFamily: "var(--font-mono)" }}>Most popular</span>
                )}
                <h2 className="text-2xl font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)", color: plan.popular ? C.textLight : C.text }}>
                  {plan.name}
                </h2>
                <p className="text-sm mb-2" style={{ color: plan.popular ? "rgba(237,230,217,0.45)" : C.textMuted }}>{plan.description}</p>
                <p className="text-sm font-medium mb-6" style={{ fontFamily: "var(--font-mono)", color: C.accent }}>Custom pricing</p>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm leading-snug" style={{ color: plan.popular ? "rgba(237,230,217,0.6)" : C.textMuted }}>
                      <span className="mt-2 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: C.accent }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="#contact"
                  className="mt-8 block w-full rounded-lg py-3 text-center text-sm font-medium transition-all duration-300"
                  style={plan.popular ? { backgroundColor: C.accent, color: "white" } : { border: `1px solid ${C.border}`, color: C.text }}>
                  {plan.cta} <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 px-6" style={{ backgroundColor: C.bgDark }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl mb-12" style={{ fontFamily: "var(--font-fraunces)", color: C.textLight }}>Compare plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.borderDark}` }}>
                    <th className="text-left py-4 pr-4 font-medium" style={{ color: "rgba(237,230,217,0.4)" }}>Feature</th>
                    <th className="text-center py-4 px-4 font-medium" style={{ color: "rgba(237,230,217,0.6)" }}>Rookie</th>
                    <th className="text-center py-4 px-4 font-medium" style={{ color: C.accent }}>Pro</th>
                    <th className="text-center py-4 px-4 font-medium" style={{ color: "rgba(237,230,217,0.6)" }}>Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} style={{ borderBottom: "1px solid rgba(237,230,217,0.06)" }}>
                      <td className="py-3 pr-4" style={{ color: "rgba(237,230,217,0.5)" }}>{row.feature}</td>
                      {(["rookie", "pro", "elite"] as const).map((tier) => (
                        <td key={tier} className="py-3 px-4 text-center">
                          {typeof row[tier] === "boolean" ? (
                            row[tier] ? <Check className="h-4 w-4 mx-auto" style={{ color: C.accent }} /> : <span style={{ color: "rgba(237,230,217,0.15)" }}>—</span>
                          ) : (
                            <span className="font-medium" style={{ color: C.textLight }}>{row[tier]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="py-24 px-6">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Get custom pricing</h2>
            <p className="leading-[1.7] mb-2" style={{ color: C.textMuted }}>
              Tell us about your operation and we&apos;ll put together a plan that fits.
            </p>
            <PricingContactForm />
          </div>
        </section>
      </main>

      <footer className="py-10" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <LogoFull height={22} color={C.textMuted} accentColor={C.accent} />
          <p className="text-xs" style={{ color: C.border }}>&copy; {new Date().getFullYear()} KeySherpa</p>
        </div>
      </footer>
    </div>
  );
}
