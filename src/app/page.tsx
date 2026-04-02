import Link from "next/link";
import {
  KeyRound,
  Smartphone,
  Brain,
  BarChart3,
  Check,
  ArrowRight,
  Zap,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: KeyRound,
    title: "Smart Lock Integration",
    description:
      "Connects with SmartThings, Schlage, and 150+ lock brands via Seam. Time-locked codes generate automatically before each tour.",
  },
  {
    icon: Smartphone,
    title: "Automated SMS Journey",
    description:
      "From booking confirmation to 72-hour nurture follow-ups, every touchpoint is handled automatically so your team can focus on closing.",
  },
  {
    icon: Brain,
    title: "AI On-Tour Assistant",
    description:
      "Visitors ask questions during their tour and get instant, accurate answers from your custom knowledge base — powered by Claude.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description:
      "See who's touring right now, track conversion rates, manage your property portfolio, and monitor lock health — all in one place.",
  },
  {
    icon: Shield,
    title: "Identity Verification",
    description:
      "Optional Stripe Identity integration for ID verification before access codes are issued. Keep your properties secure.",
  },
  {
    icon: Zap,
    title: "White-Label Ready",
    description:
      "Custom branding, your domain, your colors. Visitor-facing tour pages look like your brand, not ours.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying it out",
    features: [
      "2 active properties",
      "20 tours per month",
      "1 team member",
      "Basic SMS automation",
      "AI assistant",
    ],
    cta: "Start Free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "For small teams",
    features: [
      "10 active properties",
      "100 tours per month",
      "3 team members",
      "Full SMS + email automation",
      "AI assistant with knowledge base",
      "Identity verification",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "$299",
    period: "per month",
    description: "For growing portfolios",
    features: [
      "50 active properties",
      "500 tours per month",
      "10 team members",
      "Everything in Starter",
      "White-label branding",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-500/30">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">KeySherpa</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/20">
              <Link href="/signup">Get started free</Link>
            </Button>
          </nav>
          <Button asChild size="sm" className="md:hidden bg-violet-600 hover:bg-violet-700">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-36">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-6 bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/10">
                Smart Lock · AI · Automation
              </Badge>
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl leading-[1.05]">
                Home tours that
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> run themselves</span>
              </h1>
              <p className="mt-6 text-xl text-slate-400 leading-relaxed">
                Let buyers and renters tour your properties 24/7 — with smart lock access
                codes, AI-powered Q&A, and automated follow-ups that convert.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all duration-200
                    bg-violet-600/90 backdrop-blur-sm
                    border border-violet-400/40
                    shadow-[0_0_24px_4px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]
                    hover:shadow-[0_0_36px_8px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]
                    hover:bg-violet-500/90 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white/90 transition-all duration-200
                    bg-white/5 backdrop-blur-sm
                    border border-white/15
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.3)]
                    hover:bg-white/10 hover:border-white/25 hover:text-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  See how it works
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                No credit card required · Free plan available
              </p>
            </div>
          </div>

          {/* Mock dashboard preview */}
          <div className="relative mx-auto mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
                <div className="ml-3 flex-1 rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-500">
                  app.keysherpa.io/dashboard
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 bg-slate-900/80 p-6">
                {[
                  { label: "Tours Today", value: "12", color: "text-violet-400" },
                  { label: "This Week", value: "47", color: "text-indigo-400" },
                  { label: "Conversion", value: "68%", color: "text-emerald-400" },
                  { label: "No-Show Rate", value: "8%", color: "text-orange-400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-slate-800/80 p-4 ring-1 ring-white/5"
                  >
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Everything you need
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                From smart lock provisioning to post-tour nurture sequences — KeySherpa
                handles the whole lifecycle so your team doesn't have to.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold text-gray-900">How it works</h2>
              <p className="mt-4 text-lg text-gray-500">Up and running in under an hour.</p>
            </div>
            <div className="mx-auto mt-16 max-w-3xl">
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Connect your smart lock",
                    description:
                      "Link your existing SmartThings or Schlage lock in minutes via our Seam integration. No hardware changes needed.",
                  },
                  {
                    step: "02",
                    title: "Add your properties",
                    description:
                      "Create property listings with photos, descriptions, and tour availability windows. Assign a lock to each property.",
                  },
                  {
                    step: "03",
                    title: "Share your tour link",
                    description:
                      "Copy your unique URL, add it to Zillow, your website, or a QR code sign. Visitors book themselves.",
                  },
                  {
                    step: "04",
                    title: "KeySherpa handles the rest",
                    description:
                      "Confirmations, reminders, access codes, AI Q&A, and follow-ups run automatically. You just close deals.",
                  },
                ].map((item, i) => (
                  <div key={item.step} className="flex gap-6 items-start">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                      <p className="mt-1 text-gray-500">{item.description}</p>
                    </div>
                    {i < 3 && (
                      <ChevronRight className="ml-auto mt-3 h-5 w-5 text-gray-300 flex-shrink-0 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold text-gray-900">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Start free. Upgrade when you need to.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
              {PRICING.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted
                      ? "border-violet-600 shadow-xl shadow-violet-500/10 ring-2 ring-violet-600 relative"
                      : "border-gray-100 shadow-sm"
                  }
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-violet-600 text-white shadow-sm px-3">
                        Most popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="ml-1 text-gray-500 text-sm">/{plan.period}</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm">
                          <Check className="h-4 w-4 flex-shrink-0 text-violet-600" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`mt-8 w-full ${plan.highlighted ? "bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/20" : ""}`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-950 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white">
              Ready to automate your tours?
            </h2>
            <p className="mt-4 text-xl text-slate-400">
              Join hundreds of builders and property managers using KeySherpa.
            </p>
            <a
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all duration-200
                bg-violet-600/90 backdrop-blur-sm
                border border-violet-400/40
                shadow-[0_0_24px_4px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]
                hover:shadow-[0_0_36px_8px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]
                hover:bg-violet-500/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 text-white">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold tracking-tight">KeySherpa</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} KeySherpa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
