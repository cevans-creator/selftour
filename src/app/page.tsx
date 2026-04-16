"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ─── Animation helper ─────────────────────────────────────────────────────

function Fade({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Smart Lock Integration",
    body: "Connects with 150+ lock brands. Time-locked codes generate automatically before each tour and delete when it ends.",
  },
  {
    title: "Automated Communication",
    body: "From booking confirmation to post-tour follow-ups, every touchpoint is handled. SMS, email, and AI chat included.",
  },
  {
    title: "AI Tour Assistant",
    body: "Visitors text questions during their tour and get instant answers from your custom knowledge base.",
  },
  {
    title: "Live Dashboard",
    body: "See who's touring, track conversion rates, manage properties, and monitor lock health in real time.",
  },
  {
    title: "Identity Verification",
    body: "Verify visitors with photo ID or credit card before access codes are issued. Your properties stay secure.",
  },
  {
    title: "Your Brand, Not Ours",
    body: "Custom colors, logo, and domain. Tour pages look like your company. Embed on your website seamlessly.",
  },
];

const STEPS = [
  { title: "Connect your lock", body: "Plug in a KeySherpa hub and pair your Z-Wave lock from the dashboard. Takes five minutes." },
  { title: "Add your properties", body: "Create listings with photos, descriptions, and tour availability windows." },
  { title: "Share your tour link", body: "Drop your URL on Zillow, your website, or a QR code sign at the property." },
  { title: "We handle the rest", body: "Confirmations, reminders, door codes, AI Q&A, follow-ups, and reporting run on autopilot." },
];

const PLANS = [
  {
    name: "Rookie",
    description: "Small teams getting started with self-guided tours.",
    features: ["Up to 10 properties", "200 tours / month", "5 team members", "Smart lock hub included", "Email + SMS automation", "AI visitor assistant", "Tour reporting"],
  },
  {
    name: "Pro",
    description: "Growing companies scaling their tour program.",
    features: ["Up to 50 properties", "1,000 tours / month", "15 team members", "Advanced analytics", "Lead source tracking", "CRM integration", "Priority support"],
  },
  {
    name: "Elite",
    description: "Enterprise builders with large-scale operations.",
    features: ["Unlimited everything", "White-label branding", "Credit card verification", "Custom integrations & API", "Dedicated account manager"],
  },
];

// ─── Organic divider SVG ──────────────────────────────────────────────────

function OrganicLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 8" className={`w-full ${className ?? ""}`} preserveAspectRatio="none">
      <path
        d="M0 4 C150 2, 250 6, 400 4 S650 2, 800 4"
        stroke="#C4B9A8"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        backgroundColor: "#F5F1EA",
        color: "#3A3632",
      }}
    >
      {/* Subtle paper texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <motion.header
        className="fixed top-0 z-40 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: "#8B7355" }}>
              <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-garamond)" }}>K</span>
            </div>
            <span className="text-base tracking-wide" style={{ fontFamily: "var(--font-garamond)", color: "#2C2A26", letterSpacing: "0.08em" }}>
              KeySherpa
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            <a href="#features" className="text-sm hover:opacity-70 transition-opacity duration-500" style={{ color: "#8B7355" }}>Features</a>
            <Link href="/pricing" className="text-sm hover:opacity-70 transition-opacity duration-500" style={{ color: "#8B7355" }}>Pricing</Link>
            <Link href="/login" className="text-sm hover:opacity-70 transition-opacity duration-500" style={{ color: "#8B7355" }}>Sign in</Link>
            <Link href="/pricing#contact"
              className="text-sm border-b transition-opacity duration-500 hover:opacity-70 pb-0.5"
              style={{ color: "#2C2A26", borderColor: "#2C2A26" }}>
              Get started
            </Link>
          </nav>

          <Link href="/pricing#contact" className="md:hidden text-sm border-b pb-0.5" style={{ color: "#2C2A26", borderColor: "#2C2A26" }}>
            Get started
          </Link>
        </div>
      </motion.header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-end pb-32 pt-40 sm:items-center sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-6xl px-8 lg:px-12 w-full">
          <div className="max-w-3xl" style={{ marginLeft: "5%" }}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="text-xs tracking-[0.25em] uppercase mb-8"
              style={{ color: "#8B7355" }}
            >
              Self-guided tour automation
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] mb-8"
              style={{ fontFamily: "var(--font-garamond)", color: "#2C2A26", letterSpacing: "0.01em" }}
            >
              Home tours that<br />
              run themselves.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg leading-[1.8] max-w-md mb-12"
              style={{ color: "#6B705C" }}
            >
              Smart locks, AI Q&A, and automated follow-ups &mdash;
              so buyers can tour any time while your team focuses on closing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.6 }}
              className="flex flex-col sm:flex-row gap-6 items-start"
            >
              <Link href="/pricing#contact"
                className="text-sm border-b-2 pb-1 transition-opacity duration-500 hover:opacity-60"
                style={{ color: "#2C2A26", borderColor: "#9C6B4F" }}>
                Request a demo
              </Link>
              <a href="#features"
                className="text-sm transition-opacity duration-500 hover:opacity-60"
                style={{ color: "#8B7355" }}>
                See how it works &darr;
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Organic divider ──────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-8">
        <OrganicLine />
      </div>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-32 sm:py-44">
        <div className="mx-auto max-w-6xl px-8 lg:px-12">
          <Fade>
            <p className="text-xs tracking-[0.25em] uppercase mb-6" style={{ color: "#8B7355" }}>
              Capabilities
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl leading-[1.15] max-w-xl mb-24"
              style={{ fontFamily: "var(--font-garamond)", color: "#2C2A26" }}
            >
              Everything the tour needs.{" "}
              <span style={{ color: "#A68A64" }}>Nothing it doesn&apos;t.</span>
            </h2>
          </Fade>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-20 lg:gap-x-24">
            {FEATURES.map((f, i) => (
              <Fade key={f.title} delay={i * 0.08}>
                <div className={i % 2 === 1 ? "sm:mt-12" : ""}>
                  <h3 className="text-lg font-medium mb-3" style={{ color: "#2C2A26", fontFamily: "var(--font-garamond)", letterSpacing: "0.02em" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-[1.8]" style={{ color: "#6B705C" }}>{f.body}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Organic divider ──────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-8" style={{ marginLeft: "15%" }}>
        <OrganicLine />
      </div>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-32 sm:py-44">
        <div className="mx-auto max-w-6xl px-8 lg:px-12">
          <Fade>
            <div style={{ marginLeft: "10%" }}>
              <p className="text-xs tracking-[0.25em] uppercase mb-6" style={{ color: "#8B7355" }}>
                Process
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-24"
                style={{ fontFamily: "var(--font-garamond)", color: "#2C2A26" }}
              >
                Up in under an hour.
              </h2>
            </div>
          </Fade>

          <div className="max-w-2xl" style={{ marginLeft: "15%" }}>
            {STEPS.map((s, i) => (
              <Fade key={s.title} delay={i * 0.1}>
                <div className="flex items-start gap-8 mb-16 last:mb-0">
                  <span
                    className="text-4xl font-light flex-shrink-0 leading-none mt-1"
                    style={{ fontFamily: "var(--font-garamond)", color: "#C4B9A8" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-base font-medium mb-2" style={{ color: "#2C2A26", fontFamily: "var(--font-garamond)", letterSpacing: "0.02em" }}>
                      {s.title}
                    </h3>
                    <p className="text-sm leading-[1.8]" style={{ color: "#6B705C" }}>{s.body}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Organic divider ──────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-8" style={{ marginRight: "10%" }}>
        <OrganicLine />
      </div>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 sm:py-44">
        <div className="mx-auto max-w-6xl px-8 lg:px-12">
          <Fade>
            <p className="text-xs tracking-[0.25em] uppercase mb-6" style={{ color: "#8B7355" }}>
              Plans
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl leading-[1.15] max-w-lg mb-6"
              style={{ fontFamily: "var(--font-garamond)", color: "#2C2A26" }}
            >
              Plans that grow with you.
            </h2>
            <p className="text-sm leading-[1.8] max-w-md mb-20" style={{ color: "#6B705C" }}>
              From your first model home to hundreds of communities. Every plan includes our smart lock hub hardware and onboarding.
            </p>
          </Fade>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 lg:gap-12">
            {PLANS.map((plan, i) => (
              <Fade key={plan.name} delay={i * 0.1}>
                <div className="flex flex-col">
                  <h3
                    className="text-2xl mb-2"
                    style={{ fontFamily: "var(--font-garamond)", color: "#2C2A26" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-xs leading-[1.8] mb-6" style={{ color: "#8B7355" }}>
                    {plan.description}
                  </p>

                  <div className="mb-8" style={{ borderTop: "1px solid #D4C9B8" }} />

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm leading-[1.7]" style={{ color: "#6B705C" }}>
                        <span className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: "#A68A64" }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/pricing#contact"
                    className="mt-10 text-sm border-b pb-0.5 self-start transition-opacity duration-500 hover:opacity-60"
                    style={{ color: "#2C2A26", borderColor: "#9C6B4F" }}
                  >
                    {i === 2 ? "Contact sales" : "Get pricing"}
                  </Link>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Organic divider ──────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-8">
        <OrganicLine />
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-40 sm:py-52">
        <div className="mx-auto max-w-6xl px-8 lg:px-12">
          <Fade>
            <div className="max-w-lg" style={{ marginLeft: "8%" }}>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-8"
                style={{ fontFamily: "var(--font-garamond)", color: "#2C2A26" }}
              >
                Ready to let the<br />
                homes speak for themselves?
              </h2>
              <p className="text-sm leading-[1.8] mb-12" style={{ color: "#6B705C" }}>
                Join property managers and builders who removed scheduling from their to-do list entirely.
              </p>
              <Link href="/pricing#contact"
                className="text-sm border-b-2 pb-1 transition-opacity duration-500 hover:opacity-60"
                style={{ color: "#2C2A26", borderColor: "#9C6B4F" }}>
                Request a demo
              </Link>
            </div>
          </Fade>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-12" style={{ borderTop: "1px solid #D4C9B8" }}>
        <div className="mx-auto max-w-6xl px-8 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: "#8B7355" }}>
                <span className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-garamond)" }}>K</span>
              </div>
              <span className="text-sm" style={{ fontFamily: "var(--font-garamond)", color: "#8B7355", letterSpacing: "0.08em" }}>
                KeySherpa
              </span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-xs transition-opacity duration-500 hover:opacity-60" style={{ color: "#A68A64" }}>Privacy</Link>
              <Link href="/terms" className="text-xs transition-opacity duration-500 hover:opacity-60" style={{ color: "#A68A64" }}>Terms</Link>
              <p className="text-xs" style={{ color: "#C4B9A8" }}>&copy; {new Date().getFullYear()} KeySherpa</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
