import Link from "next/link";
import {
  KeyRound,
  Smartphone,
  Brain,
  BarChart3,
  Check,
  ArrowRight,
  Home,
  Zap,
  Shield,
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
      "Visitors text questions during their tour and get instant, accurate answers from your custom knowledge base — powered by Claude.",
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
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">SelfTour</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get started free</Link>
            </Button>
          </nav>
          <Button asChild size="sm" className="md:hidden">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="info" className="mb-6">
                Smart Lock + AI + Automation
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
                Self-guided home tours
                <span className="text-blue-600"> on autopilot</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Let buyers and renters tour your properties 24/7 — with smart lock access
                codes, AI-powered Q&A, and automated follow-ups that convert.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <a href="#features">See how it works</a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required · Free plan available
              </p>
            </div>
          </div>

          {/* Mock dashboard preview */}
          <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-2 flex-1 rounded bg-white px-3 py-1 text-xs text-gray-400">
                  app.selftour.com/dashboard
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 bg-gray-50/50 p-6">
                {[
                  { label: "Tours Today", value: "12", color: "text-blue-600" },
                  { label: "This Week", value: "47", color: "text-purple-600" },
                  { label: "Conversion", value: "68%", color: "text-green-600" },
                  { label: "No-Show Rate", value: "8%", color: "text-orange-600" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100"
                  >
                    <p className="text-xs text-gray-500">{stat.label}</p>
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
        <section id="features" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to run self-guided tours
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                From smart lock provisioning to post-tour nurture sequences — SelfTour
                handles the whole lifecycle so your team doesn't have to.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-sm ring-1 ring-gray-100">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            </div>
            <div className="mx-auto mt-16 max-w-3xl">
              <div className="space-y-8">
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
                    title: "SelfTour handles the rest",
                    description:
                      "Confirmations, reminders, access codes, AI Q&A, and follow-ups run automatically. You just close deals.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Start free. Upgrade when you need to.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
              {PRICING.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted
                      ? "border-blue-600 shadow-lg ring-2 ring-blue-600"
                      : ""
                  }
                >
                  {plan.highlighted && (
                    <div className="-mt-px flex justify-center">
                      <Badge className="rounded-t-none bg-blue-600 text-white">
                        Most popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="ml-1 text-gray-500">/{plan.period}</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="mt-8 w-full"
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
        <section className="bg-blue-600 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white">
              Ready to automate your tours?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join hundreds of builders and property managers using SelfTour.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-blue-600 hover:bg-blue-50"
            >
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white">
                <Home className="h-3 w-3" />
              </div>
              <span className="font-semibold">SelfTour</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SelfTour. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
