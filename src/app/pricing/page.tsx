import Link from "next/link";
import { KeyRound, Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing | KeySherpa",
  description: "Self-guided tour platform pricing for home builders and real estate teams.",
};

const PLANS = [
  {
    name: "Rookie",
    description: "For small teams getting started with self-guided tours.",
    features: [
      "Up to 10 properties",
      "Up to 200 tours/month",
      "5 team members",
      "Self-tour scheduling platform",
      "Smart lock integration (Z-Wave)",
      "Automated access code management",
      "Pre & post-visit email campaigns",
      "Visitor identity verification",
      "Tour action notifications",
      "Tour & visitor reporting",
      "Website embed widget",
    ],
    cta: "Get Pricing",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing companies scaling their self-tour program.",
    features: [
      "Up to 50 properties",
      "Up to 1,000 tours/month",
      "15 team members",
      "Everything in Rookie, plus:",
      "AI-powered visitor chat (SMS)",
      "Automated SMS campaigns",
      "Lead source tracking & attribution",
      "Advanced analytics dashboard",
      "CRM integration (webhook)",
      "Priority support",
    ],
    cta: "Get Pricing",
    highlighted: true,
  },
  {
    name: "Elite",
    description: "For enterprise builders with large-scale tour operations.",
    features: [
      "Unlimited properties",
      "Unlimited tours",
      "Unlimited team members",
      "Everything in Pro, plus:",
      "Custom branding / white-label",
      "Dedicated account manager",
      "Custom integrations & API access",
      "Multi-community management",
      "Credit card visitor verification",
      "SLA & uptime guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">KeySherpa</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link
              href="#contact"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-20 pb-16 text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Plans that scale with your business
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            From your first model home to hundreds of communities. Every plan includes our smart lock hub hardware and full-service onboarding.
          </p>
        </section>

        {/* Plan Cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border ${
                  plan.highlighted
                    ? "border-violet-600 shadow-lg shadow-violet-500/10 ring-1 ring-violet-600"
                    : "border-gray-200"
                } bg-white p-8 flex flex-col`}
              >
                {plan.highlighted && (
                  <div className="inline-flex self-start rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 mb-4">
                    Most Popular
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{plan.description}</p>

                <Link
                  href="#contact"
                  className={`mt-6 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="inline-block h-4 w-4 ml-1" />
                </Link>

                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                      {feature.endsWith(":") ? (
                        <span className="font-semibold text-gray-900 mt-2">{feature}</span>
                      ) : (
                        <>
                          <Check className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                          {feature}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="bg-gray-50 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Compare Plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 pr-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Rookie</th>
                    <th className="text-center py-4 px-4 font-semibold text-violet-700">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Elite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { feature: "Properties", rookie: "10", pro: "50", elite: "Unlimited" },
                    { feature: "Tours per month", rookie: "200", pro: "1,000", elite: "Unlimited" },
                    { feature: "Team members", rookie: "5", pro: "15", elite: "Unlimited" },
                    { feature: "Self-tour scheduling", rookie: true, pro: true, elite: true },
                    { feature: "Smart lock hub hardware", rookie: true, pro: true, elite: true },
                    { feature: "Automated access codes", rookie: true, pro: true, elite: true },
                    { feature: "Email campaigns", rookie: true, pro: true, elite: true },
                    { feature: "Photo ID verification", rookie: true, pro: true, elite: true },
                    { feature: "Website embed widget", rookie: true, pro: true, elite: true },
                    { feature: "Tour notifications", rookie: true, pro: true, elite: true },
                    { feature: "Tour reporting", rookie: true, pro: true, elite: true },
                    { feature: "SMS campaigns", rookie: false, pro: true, elite: true },
                    { feature: "AI visitor chat (SMS)", rookie: false, pro: true, elite: true },
                    { feature: "Lead source tracking", rookie: false, pro: true, elite: true },
                    { feature: "Advanced analytics", rookie: false, pro: true, elite: true },
                    { feature: "CRM integration", rookie: false, pro: true, elite: true },
                    { feature: "Credit card verification", rookie: false, pro: false, elite: true },
                    { feature: "White-label branding", rookie: false, pro: false, elite: true },
                    { feature: "Custom integrations / API", rookie: false, pro: false, elite: true },
                    { feature: "Dedicated account manager", rookie: false, pro: false, elite: true },
                  ].map((row) => (
                    <tr key={row.feature}>
                      <td className="py-3 pr-4 text-gray-700">{row.feature}</td>
                      {(["rookie", "pro", "elite"] as const).map((tier) => (
                        <td key={tier} className="py-3 px-4 text-center">
                          {typeof row[tier] === "boolean" ? (
                            row[tier] ? (
                              <Check className="h-4 w-4 text-violet-600 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )
                          ) : (
                            <span className="font-medium text-gray-900">{row[tier]}</span>
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
        <section id="contact" className="py-20 px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Get Custom Pricing</h2>
            <p className="mt-3 text-gray-500">
              Tell us about your operation and we&apos;ll put together a plan that fits. Most teams are up and running within a week.
            </p>
            <form
              className="mt-10 text-left space-y-4"
              action="https://formspree.io/f/placeholder"
              method="POST"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input name="firstName" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input name="lastName" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                <input name="email" type="email" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input name="company" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Properties</label>
                <select name="properties" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                  <option value="">Select range...</option>
                  <option value="1-5">1 - 5</option>
                  <option value="6-20">6 - 20</option>
                  <option value="21-50">21 - 50</option>
                  <option value="51-100">51 - 100</option>
                  <option value="100+">100+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anything else?</label>
                <textarea name="message" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="Tell us about your current tour setup, goals, or questions..." />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                Request Pricing
              </button>
              <p className="text-xs text-center text-gray-400">We typically respond within 1 business day.</p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} KeySherpa. All rights reserved.
      </footer>
    </div>
  );
}
