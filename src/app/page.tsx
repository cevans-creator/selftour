"use client";

import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Lock, Smartphone, BarChart3, Shield, MessageCircle, Palette } from "lucide-react";

// ─── Colors ───────────────────────────────────────────────────────────────

const C = {
  bg: "#F5F1EA",
  bgDark: "#2C2A26",
  text: "#3A3632",
  textMuted: "#6B705C",
  textLight: "#EDE6D9",
  accent: "#A0522D",
  accentHover: "#8B4513",
  border: "#D4C9B8",
  borderDark: "rgba(237,230,217,0.1)",
  cardBg: "rgba(255,255,255,0.55)",
  cardShadow: "0 8px 40px rgba(139,115,85,0.08)",
};

// ─── Animations ───────────────────────────────────────────────────────────

function Fade({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Mock Dashboard Component ─────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{
        backgroundColor: "#1a1917",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 20px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <span className="text-[10px] ml-2" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.3)" }}>
          keysherpa.io/dashboard
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-44 p-3 border-r hidden sm:block" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {["Dashboard", "Properties", "Tours", "Visitors", "Hubs", "Analytics"].map((item, i) => (
            <div key={item} className={`text-[11px] px-3 py-2 rounded-md mb-0.5 ${i === 0 ? "bg-white/[0.06]" : ""}`}
              style={{ color: i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)", fontFamily: "var(--font-inter)" }}>
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            {[
              { label: "Active Tours", value: "12", color: "#A0522D" },
              { label: "Visitors Today", value: "34", color: "#6B705C" },
              { label: "Completion Rate", value: "87%", color: "#6B705C" },
              { label: "Hubs Online", value: "8/8", color: "#4a8c5c" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg p-3" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)" }}>{s.label}</p>
                <p className="text-lg font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tour list */}
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)" }}>UPCOMING TOURS</span>
            </div>
            {[
              { name: "5010 Mimosa Ln", visitor: "Sarah Chen", time: "2:30 PM", status: "Access Sent", statusColor: "#A0522D" },
              { name: "1240 Oak Valley", visitor: "James Park", time: "3:00 PM", status: "Scheduled", statusColor: "#6B705C" },
              { name: "890 Sunset Blvd", visitor: "Maria Lopez", time: "4:15 PM", status: "Scheduled", statusColor: "#6B705C" },
            ].map((t, i) => (
              <div key={t.name} className="flex items-center justify-between px-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{t.name}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t.visitor} &middot; {t.time}</p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${t.statusColor}22`, color: t.statusColor }}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Lock, title: "Smart Lock Automation", body: "Z-Wave hub pairs in minutes. Time-locked codes generate before each tour and delete when it ends. Supports Kwikset, Schlage, Yale, and 150+ brands." },
  { icon: MessageCircle, title: "AI Tour Assistant", body: "Visitors text questions during their tour. Claude-powered AI answers instantly from your custom knowledge base via SMS." },
  { icon: Smartphone, title: "Automated Campaigns", body: "Booking confirmation, 24hr reminder, access code, wrap-up, thank you, and 72hr nurture follow-up. All automated." },
  { icon: BarChart3, title: "Analytics & CRM", body: "Tour completion rates, lead source tracking, visitor engagement reporting. Webhook integration pushes data to HubSpot, Salesforce, or Zapier." },
  { icon: Shield, title: "Identity Verification", body: "Photo ID via Stripe Identity or credit card verification. Visitors are verified before access codes are issued." },
  { icon: Palette, title: "White-Label Ready", body: "Your brand, your colors, your domain. Embed the booking widget on your website. Tour pages look like your company." },
];

const STEPS = [
  { title: "Plug in a hub", body: "Our pre-configured Pi hub connects to cellular automatically. Enter the claim code in your dashboard." },
  { title: "Pair your lock", body: "Press one button. The hub pairs with your Z-Wave lock in 30 seconds. No electrician needed." },
  { title: "Share your tour link", body: "Embed on your website, post on Zillow, or print a QR code at the property." },
  { title: "Tours run on autopilot", body: "Codes, reminders, AI chat, follow-ups, and reporting — all automatic, 24/7." },
];

const PLANS = [
  { name: "Rookie", desc: "Small teams getting started.", features: ["10 properties", "200 tours/mo", "5 team members", "Hub hardware included", "SMS + email automation", "AI visitor chat", "Tour reporting"] },
  { name: "Pro", desc: "Growing companies at scale.", features: ["50 properties", "1,000 tours/mo", "15 team members", "Advanced analytics", "Lead source tracking", "CRM integration", "Priority support"], popular: true },
  { name: "Elite", desc: "Enterprise builders.", features: ["Unlimited everything", "White-label branding", "Credit card verification", "Custom integrations & API", "Dedicated account manager"] },
];

// ─── Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const mockupY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <div style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", backgroundColor: C.bg, color: C.text }} className="overflow-x-hidden">

      {/* Paper texture */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Blueprint grid — very faint, across whole page */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{ backgroundImage: `linear-gradient(${C.accent}40 1px, transparent 1px), linear-gradient(90deg, ${C.accent}40 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="fixed top-0 z-40 w-full backdrop-blur-md" style={{ backgroundColor: `${C.bg}e6`, borderBottom: `1px solid ${C.border}` }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: C.accent }}>
              <span className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>K</span>
            </div>
            <span className="text-sm font-semibold tracking-wide" style={{ color: C.text }}>KeySherpa</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm transition-colors duration-300 hover:opacity-70" style={{ color: C.textMuted }}>Features</a>
            <Link href="/pricing" className="text-sm transition-colors duration-300 hover:opacity-70" style={{ color: C.textMuted }}>Pricing</Link>
            <Link href="/login" className="text-sm transition-colors duration-300 hover:opacity-70" style={{ color: C.textMuted }}>Sign in</Link>
            <Link href="/pricing#contact"
              className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: C.accent }}>
              Get started <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </nav>

          <Link href="/pricing#contact" className="md:hidden rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: C.accent }}>
            Get started
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="pt-32 pb-20 sm:pt-40 sm:pb-32 relative">
        {/* Subtle accent gradient */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: `radial-gradient(circle, ${C.accent} 0%, transparent 70%)` }} />

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left — copy */}
            <div className="lg:col-span-5">
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-xs tracking-[0.2em] uppercase mb-6"
                style={{ fontFamily: "var(--font-mono)", color: C.accent }}>
                01 — Self-Tour Platform
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] mb-6"
                style={{ fontFamily: "var(--font-fraunces)", color: C.text }}>
                Home tours that run themselves.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg leading-[1.7] mb-10 max-w-md"
                style={{ color: C.textMuted }}>
                Smart locks, AI Q&A, and automated follow-ups — so buyers can tour 24/7 while your team focuses on closing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap gap-4">
                <Link href="/pricing#contact"
                  className="rounded-lg px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  style={{ backgroundColor: C.accent }}>
                  Request a demo <ArrowRight className="inline h-4 w-4 ml-1.5" />
                </Link>
                <a href="#how-it-works"
                  className="rounded-lg px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:bg-black/[0.03]"
                  style={{ color: C.text, border: `1px solid ${C.border}` }}>
                  See how it works
                </a>
              </motion.div>
            </div>

            {/* Right — product mockup */}
            <motion.div className="lg:col-span-7" style={{ y: mockupY }}
              initial={{ opacity: 0, y: 40, rotateX: 4 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ perspective: "1200px" }}>
                <div style={{ transform: "rotateY(-2deg) rotateX(1deg)" }}>
                  <DashboardMockup />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <Fade>
        <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { label: "Tours completed", value: 10000, suffix: "+" },
                { label: "Avg. booking time", value: 90, suffix: "s" },
                { label: "Lock brands", value: 150, suffix: "+" },
                { label: "Conversion lift", value: 3, suffix: ".2×" },
              ].map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <p className="text-3xl font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)", color: C.text }}>
                    <CountUp target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs tracking-wide uppercase" style={{ fontFamily: "var(--font-mono)", color: C.textMuted }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Fade>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Fade>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "var(--font-mono)", color: C.accent }}>
              02 — Platform
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-4 max-w-xl"
              style={{ fontFamily: "var(--font-fraunces)", color: C.text }}>
              Everything the tour needs.
            </h2>
            <p className="text-base leading-[1.7] max-w-lg mb-16" style={{ color: C.textMuted }}>
              One platform handles scheduling, access, communication, and analytics. Your team does the selling.
            </p>
          </Fade>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Fade key={f.title} delay={i * 0.06}>
                <motion.div
                  className="rounded-xl p-6 sm:p-7 transition-all duration-300 cursor-default"
                  style={{ backgroundColor: C.cardBg, boxShadow: C.cardShadow, border: `1px solid transparent` }}
                  whileHover={{ scale: 1.01, borderColor: `${C.accent}30`, boxShadow: "0 12px 48px rgba(139,115,85,0.12)" }}
                >
                  <f.icon className="h-5 w-5 mb-4" style={{ color: C.accent }} />
                  <h3 className="text-base font-semibold mb-2" style={{ color: C.text }}>{f.title}</h3>
                  <p className="text-sm leading-[1.7]" style={{ color: C.textMuted }}>{f.body}</p>
                </motion.div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark section — How it works ──────────────────────── */}
      <section id="how-it-works" className="py-28 sm:py-36 relative" style={{ backgroundColor: C.bgDark }}>
        {/* Blueprint grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(160,82,45,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(160,82,45,0.5) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <Fade>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "var(--font-mono)", color: C.accent }}>
              03 — Process
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-4"
              style={{ fontFamily: "var(--font-fraunces)", color: C.textLight }}>
              Live in under an hour.
            </h2>
            <p className="text-base leading-[1.7] max-w-lg mb-20" style={{ color: "rgba(237,230,217,0.5)" }}>
              From unboxing your hub to your first automated tour — no contractors, no IT department.
            </p>
          </Fade>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <Fade key={s.title} delay={i * 0.1}>
                <div>
                  <span className="text-5xl font-light mb-4 block" style={{ fontFamily: "var(--font-fraunces)", color: `${C.accent}88` }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold mb-2" style={{ color: C.textLight }}>{s.title}</h3>
                  <p className="text-sm leading-[1.7]" style={{ color: "rgba(237,230,217,0.45)" }}>{s.body}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Fade>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "var(--font-mono)", color: C.accent }}>
              04 — Plans
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-4 max-w-lg"
              style={{ fontFamily: "var(--font-fraunces)", color: C.text }}>
              Plans that scale with you.
            </h2>
            <p className="text-base leading-[1.7] max-w-lg mb-16" style={{ color: C.textMuted }}>
              Every plan includes hub hardware and onboarding. No setup fees.
            </p>
          </Fade>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan, i) => (
              <Fade key={plan.name} delay={i * 0.08}>
                <motion.div
                  className="rounded-xl p-7 flex flex-col h-full"
                  style={{
                    backgroundColor: plan.popular ? C.bgDark : C.cardBg,
                    boxShadow: plan.popular ? "0 16px 64px rgba(44,42,38,0.2)" : C.cardShadow,
                    border: plan.popular ? `1px solid rgba(160,82,45,0.3)` : `1px solid ${C.border}`,
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  {plan.popular && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white self-start mb-4"
                      style={{ backgroundColor: C.accent, fontFamily: "var(--font-mono)" }}>
                      Most popular
                    </span>
                  )}
                  <h3 className="text-2xl font-semibold mb-1"
                    style={{ fontFamily: "var(--font-fraunces)", color: plan.popular ? C.textLight : C.text }}>
                    {plan.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: plan.popular ? "rgba(237,230,217,0.45)" : C.textMuted }}>
                    {plan.desc}
                  </p>
                  <p className="text-sm font-medium mb-6" style={{ fontFamily: "var(--font-mono)", color: C.accent }}>
                    Custom pricing
                  </p>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm leading-snug"
                        style={{ color: plan.popular ? "rgba(237,230,217,0.6)" : C.textMuted }}>
                        <span className="mt-2 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: C.accent }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/pricing#contact"
                    className="mt-8 block w-full rounded-lg py-3 text-center text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
                    style={plan.popular
                      ? { backgroundColor: C.accent, color: "white" }
                      : { border: `1px solid ${C.border}`, color: C.text }
                    }>
                    {i === 2 ? "Contact sales" : "Get pricing"}
                  </Link>
                </motion.div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA — dark ─────────────────────────────────── */}
      <section className="py-32 sm:py-40 relative" style={{ backgroundColor: C.bgDark }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(circle at 30% 50%, ${C.accent} 0%, transparent 60%)` }} />

        <Fade>
          <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
            <div className="max-w-xl" style={{ marginLeft: "5%" }}>
              <p className="text-xs tracking-[0.2em] uppercase mb-6" style={{ fontFamily: "var(--font-mono)", color: `${C.accent}aa` }}>
                05 — Get started
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-6"
                style={{ fontFamily: "var(--font-fraunces)", color: C.textLight }}>
                Ready to let the homes speak for themselves?
              </h2>
              <p className="text-base leading-[1.7] mb-10" style={{ color: "rgba(237,230,217,0.45)" }}>
                Join property managers and builders who removed scheduling from their to-do list entirely.
              </p>
              <Link href="/pricing#contact"
                className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                style={{ backgroundColor: C.accent }}>
                Request a demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Fade>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-10" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto max-w-6xl px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: C.accent }}>
              <span className="text-[10px] font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>K</span>
            </div>
            <span className="text-sm font-medium" style={{ color: C.textMuted }}>KeySherpa</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: C.textMuted }}>Privacy</Link>
            <Link href="/terms" className="text-xs hover:opacity-70 transition-opacity" style={{ color: C.textMuted }}>Terms</Link>
            <p className="text-xs" style={{ color: C.border }}>&copy; {new Date().getFullYear()} KeySherpa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
