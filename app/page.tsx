import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Zap,
  Sliders,
  ShieldCheck,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { FaqAccordion } from "@/components/shared/faq-accordion";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: "Generate in Seconds",
    description:
      "Describe your email's purpose, pick a tone, and Gemini AI crafts a polished message instantly — no more staring at a blank page.",
  },
  {
    icon: Sliders,
    title: "5 Adaptive Tones",
    description:
      "Switch between Professional, Friendly, Formal, Casual, and Persuasive to perfectly match every context and recipient.",
  },
  {
    icon: ShieldCheck,
    title: "Your History, Secured",
    description:
      "Every generated email is saved to your personal Firestore history — accessible only to you via Firebase Authentication.",
  },
  {
    icon: FileText,
    title: "Copy & Save Instantly",
    description:
      "Copy your draft to the clipboard or save it to your history with a single click. Your work is never lost.",
  },
  {
    icon: Clock,
    title: "Three Length Formats",
    description:
      "Choose Short for quick replies, Medium for standard messages, or Long for detailed proposals — the AI adapts accordingly.",
  },
  {
    icon: Sparkles,
    title: "Powered by Gemini 2.5",
    description:
      "Built on Google's latest Gemini 2.5 Flash model with server-side execution — fast, secure, and consistently high-quality output.",
  },
];

const TRUST_ITEMS = [
  "No credit card required",
  "Firebase-authenticated",
  "Server-side AI generation",
  "Free to get started",
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Mail className="size-4" />
            </div>
            <span>MailGenius</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </a>
          </div>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login" id="nav-signin">
                Sign In
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up" id="nav-get-started">
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center sm:py-32">
          {/* Subtle grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <svg
              className="absolute inset-0 h-full w-full stroke-border/60 [mask-image:radial-gradient(60%_60%_at_center,white,transparent)]"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="landing-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M.5 40V.5H40" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#landing-grid)" />
            </svg>
            {/* Soft radial glow */}
            <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
          </div>

          <h1
            className="mt-2 max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
            id="hero-headline"
          >
            Write Perfect Emails{" "}
            <span className="text-primary">in Seconds</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Stop wrestling with words. Describe your email, pick a tone and
            length, and let AI generate a professional message tailored to your
            recipient — every time.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row" id="hero-ctas">
            <Button size="lg" asChild>
              <Link href="/sign-up" id="hero-cta-primary">
                Start Generating Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login" id="hero-cta-secondary">
                Sign In
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-2">
            {TRUST_ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────────── */}
        <section
          id="features"
          className="border-y border-border/50 bg-muted/30 py-20 scroll-mt-16"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Why MailGenius
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Write emails with total confidence
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                A focused, no-fluff tool that handles everything from quick
                replies to high-stakes business proposals.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                How It Works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Three steps to a great email
              </h2>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Describe your email",
                  desc: "Enter the subject, choose your tone (Professional, Casual, Friendly…) and desired length.",
                },
                {
                  step: "02",
                  title: "Hit Generate",
                  desc: "Our server sends your request to Gemini 2.5 Flash. The AI composes a polished draft in seconds.",
                },
                {
                  step: "03",
                  title: "Copy, save, or refine",
                  desc: "Copy to clipboard, save to your history, or tweak the inputs and regenerate until it's perfect.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="relative flex flex-col gap-4">
                  <span className="text-5xl font-extrabold tracking-tight text-border">
                    {step}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section
          id="faq"
          className="border-t border-border/50 bg-muted/30 py-20 scroll-mt-16"
        >
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Got Questions?
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Everything you need to know about MailGenius, security, and how
                AI generation works.
              </p>
            </div>

            <FaqAccordion />
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to send better emails?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Create a free account and generate your first email in under 60
                seconds. No credit card required.
              </p>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/sign-up" id="bottom-cta">
                  Get Started — It&apos;s Free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Mail className="size-4" />
            MailGenius
          </span>
          <span>Built with Next.js &amp; Google Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
