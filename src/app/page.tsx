"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useInView, useAnimation } from "framer-motion";
import { useRef, useEffect } from "react";
import { KeyRound, ArrowRight, Check } from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    tag: "01",
    title: "Smart Lock Integration",
    description: "Connects with SmartThings, Schlage, and 150+ lock brands via Seam. Time-locked codes generate automatically before each tour.",
  },
  {
    tag: "02",
    title: "Automated SMS Journey",
    description: "From booking confirmation to 72-hour nurture follow-ups, every touchpoint is handled automatically.",
  },
  {
    tag: "03",
    title: "AI On-Tour Assistant",
    description: "Visitors ask questions during their tour and get instant, accurate answers from your custom knowledge base.",
  },
  {
    tag: "04",
    title: "Real-Time Dashboard",
    description: "See who's touring right now, track conversion rates, manage your property portfolio, and monitor lock health.",
  },
  {
    tag: "05",
    title: "Identity Verification",
    description: "Optional Stripe Identity integration for ID verification before access codes are issued.",
  },
  {
    tag: "06",
    title: "White-Label Ready",
    description: "Custom branding, your domain, your colors. Visitor-facing tour pages look like your brand, not ours.",
  },
];

const STEPS = [
  { n: "01", title: "Connect your smart lock", body: "Link your existing lock in minutes via our Seam integration. No hardware changes needed." },
  { n: "02", title: "Add your properties", body: "Create listings with photos, descriptions, and tour availability windows." },
  { n: "03", title: "Share your tour link", body: "Drop your unique URL on Zillow, your site, or a QR code sign. Visitors self-book." },
  { n: "04", title: "KeySherpa handles the rest", body: "Confirmations, reminders, door codes, AI Q&A, and follow-ups run on autopilot." },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying it out",
    features: ["2 active properties", "20 tours / month", "1 team member", "Basic SMS automation", "AI assistant"],
    cta: "Start Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "For small teams",
    features: ["10 active properties", "100 tours / month", "3 team members", "Full SMS + email automation", "AI knowledge base", "Identity verification", "Analytics"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Growth",
    price: "$299",
    period: "per month",
    description: "For growing portfolios",
    features: ["50 active properties", "500 tours / month", "10 team members", "Everything in Starter", "White-label branding", "Priority support", "Custom integrations"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: false,
  },
];

// ─── Animation helpers ──────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] }}>
      {children}
    </motion.div>
  );
}

function StaggerList({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}>
      {children}
    </motion.div>
  );
}

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
};

// ─── Neon Line ──────────────────────────────────────────────────────────────

function NeonLine() {
  const controls = useAnimation();

  useEffect(() => {
    async function run() {
      // Power on — stroke and glow materialise slowly
      await controls.start({
        filter: "blur(0px)",
        WebkitTextStroke: "1px rgba(255,255,255,0.28)",
        textShadow: "0 0 6px rgba(147,197,253,0.6), 0 0 20px rgba(49,110,224,0.55), 0 0 55px rgba(49,110,224,0.25), 0 0 110px rgba(49,110,224,0.08)",
        transition: { duration: 2.8, delay: 1.0, ease: [0.06, 0.8, 0.2, 1] },
      });

      // Puffco-style pulse — slow, deep, expanding heat glow
      controls.start({
        textShadow: [
          "0 0 6px rgba(147,197,253,0.6), 0 0 20px rgba(49,110,224,0.55), 0 0 55px rgba(49,110,224,0.25), 0 0 110px rgba(49,110,224,0.08)",
          "0 0 10px rgba(147,197,253,0.95), 0 0 30px rgba(49,110,224,0.9), 0 0 80px rgba(49,110,224,0.5), 0 0 160px rgba(49,110,224,0.2), 0 0 260px rgba(49,110,224,0.07)",
          "0 0 6px rgba(147,197,253,0.6), 0 0 20px rgba(49,110,224,0.55), 0 0 55px rgba(49,110,224,0.25), 0 0 110px rgba(49,110,224,0.08)",
        ],
        transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
      });
    }
    void run();
  }, [controls]);

  return (
    <div className="overflow-hidden">
      <motion.h1
        className="text-[clamp(3rem,10vw,8rem)] font-extralight leading-[0.95] tracking-[0.04em] select-none"
        style={{ color: "transparent" }}
        initial={{ filter: "blur(10px)", WebkitTextStroke: "1px rgba(255,255,255,0)", textShadow: "none" }}
        animate={controls}
      >
        That Run
      </motion.h1>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden uppercase" style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <motion.header
        className="fixed top-0 z-50 w-full"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#316ee0]">
              <KeyRound className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide">KeySherpa</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-white/40 hover:text-white transition-colors duration-200 tracking-wide">Features</a>
            <a href="#pricing" className="text-sm text-white/40 hover:text-white transition-colors duration-200 tracking-wide">Pricing</a>
            <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors duration-200 tracking-wide">Sign in</Link>
            <Link href="/signup"
              className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              Get started
            </Link>
          </nav>

          <Link href="/signup" className="md:hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white">
            Get started
          </Link>
        </div>

        {/* Glass blur bar */}
        <div className="absolute inset-0 -z-10 border-b border-white/[0.04] bg-black/60 backdrop-blur-xl" />
      </motion.header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center overflow-hidden">

        {/* Grid background */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* Blue glow orb — outer pulse */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] rounded-full"
          style={{ background: "radial-gradient(circle, #316ee0 0%, transparent 65%)" }}
          animate={{ opacity: [0.18, 0.28, 0.18], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner bright core pulse */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, #93c5fd 0%, #316ee0 30%, transparent 70%)" }}
          animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.12, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl px-6 text-center">

          {/* Tag */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="mb-8 text-[10px] text-white/25 tracking-[0.3em]"
          >
            // Intelligent Tour Automation
          </motion.p>

          {/* Headline */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
              className="text-[clamp(3rem,10vw,8rem)] font-extralight leading-[0.95] tracking-[0.04em] text-white"
            >
              Home Tours
            </motion.h1>
          </div>
          {/* "that run" — powers on then flickers like a neon sign */}
          <NeonLine />
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.16, ease: [0.25, 1, 0.5, 1] }}
              className="text-[clamp(3rem,10vw,8rem)] font-extralight leading-[0.95] tracking-[0.04em] text-white"
            >
              Themselves.
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-white/40 tracking-wide"
          >
            Smart lock access codes, AI-powered Q&A, and automated follow-ups — so buyers and renters can tour 24/7 while your team stays focused on closing.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.25, 1, 0.5, 1] }}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/signup"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#316ee0] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(49,110,224,0.4)] hover:shadow-[0_0_60px_rgba(49,110,224,0.6)] hover:bg-[#2558c8] transition-all duration-300"
            >
              Start for free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm font-medium text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-5 font-mono text-xs text-white/20 tracking-widest"
          >
            NO CREDIT CARD · FREE PLAN AVAILABLE
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">Scroll</span>
          <motion.div
            className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent"
            animate={{ scaleY: [1, 0.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ── Live stats bar ─────────────────────────────────────────── */}
      <FadeUp>
        <div className="border-y border-white/[0.05] bg-white/[0.01]">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { label: "Tours automated daily", value: "2,400+" },
                { label: "Avg. booking time", value: "< 90s" },
                { label: "Lock brands supported", value: "150+" },
                { label: "Conversion lift", value: "3.2×" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-light text-white tabular-nums">{s.value}</p>
                  <p className="mt-1 font-mono text-xs text-white/25 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeUp className="mb-20">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/25 mb-4">// Capabilities</p>
            <h2 className="text-4xl font-light leading-tight text-white sm:text-6xl max-w-2xl">
              Everything the tour needs.
              <span className="text-white/20"> Nothing it doesn't.</span>
            </h2>
          </FadeUp>

          <StaggerList className="grid grid-cols-1 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div key={f.tag} variants={item}
                className="group relative py-10 sm:px-8 sm:py-10 border-white/[0.05] hover:bg-white/[0.02] transition-colors duration-300 sm:border-l first:border-l-0 lg:first:border-l-0 lg:[&:nth-child(4)]:border-l-0"
              >
                <p className="font-mono text-xs text-white/20 mb-4 tracking-widest">{f.tag}</p>
                <h3 className="text-base font-medium text-white mb-3 leading-snug">{f.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="py-32 sm:py-40 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] opacity-[0.07] rounded-full"
          style={{ background: "radial-gradient(circle, #316ee0 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <FadeUp className="mb-20">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/25 mb-4">// Process</p>
            <h2 className="text-4xl font-light text-white sm:text-6xl">Up in under an hour.</h2>
          </FadeUp>

          <StaggerList className="max-w-3xl space-y-0 divide-y divide-white/[0.05]">
            {STEPS.map((s) => (
              <motion.div key={s.n} variants={item} className="group flex items-start gap-10 py-10">
                <span className="font-mono text-5xl font-light text-white/[0.07] group-hover:text-white/15 transition-colors duration-500 flex-shrink-0 leading-none mt-1">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed max-w-md">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 sm:py-40 border-t border-white/[0.05]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeUp className="mb-20 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/25 mb-4">// Pricing</p>
            <h2 className="text-4xl font-light text-white sm:text-6xl">Simple. Transparent.</h2>
            <p className="mt-4 text-white/30 text-base tracking-wide">Start free. Upgrade when you're ready.</p>
          </FadeUp>

          <StaggerList className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
            {PRICING.map((plan) => (
              <motion.div key={plan.name} variants={item}
                className={`relative rounded-2xl border p-8 transition-all duration-300 ${plan.highlight
                  ? "border-[#316ee0]/40 bg-[#316ee0]/[0.05] shadow-[0_0_60px_rgba(49,110,224,0.12)]"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-[#316ee0] to-transparent" />
                )}

                <div className="mb-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-white/30 mb-1">{plan.name}</p>
                  <p className="text-xs text-white/20 mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-light text-white">{plan.price}</span>
                    <span className="text-xs text-white/25 font-mono">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/40">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#316ee0]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}
                  className={`block w-full rounded-full py-3 text-center text-sm font-medium transition-all duration-300 ${plan.highlight
                    ? "bg-[#316ee0] text-white hover:bg-[#2558c8] shadow-[0_0_20px_rgba(49,110,224,0.3)] hover:shadow-[0_0_30px_rgba(49,110,224,0.5)]"
                    : "border border-white/10 text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-40 overflow-hidden border-t border-white/[0.05]">
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, #316ee0 0%, transparent 65%)" }}
          animate={{ opacity: [0.14, 0.24, 0.14], scale: [1, 1.07, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

        <FadeUp className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/20 mb-8">// Get started</p>
          <h2 className="text-4xl font-light text-white sm:text-6xl leading-tight mb-6">
            Ready to automate<br />your tours?
          </h2>
          <p className="text-white/30 mb-12 text-base leading-relaxed max-w-md mx-auto">
            Join property managers and builders who've removed scheduling from their to-do list entirely.
          </p>
          <Link href="/signup"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#316ee0] px-10 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(49,110,224,0.4)] hover:shadow-[0_0_70px_rgba(49,110,224,0.65)] hover:bg-[#2558c8] transition-all duration-300"
          >
            Start for free — no card required
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </FadeUp>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#316ee0]">
                <KeyRound className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium tracking-wide text-white/60">KeySherpa</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="font-mono text-xs text-white/20 hover:text-white/40 transition-colors tracking-wide">Privacy</Link>
              <Link href="/terms" className="font-mono text-xs text-white/20 hover:text-white/40 transition-colors tracking-wide">Terms</Link>
              <p className="font-mono text-xs text-white/15 tracking-wide">© {new Date().getFullYear()} KeySherpa</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
