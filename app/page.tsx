import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Generate in Seconds",
    description:
      "Describe your email's purpose and let Gemini AI craft a polished message instantly — no more staring at a blank page.",
  },
  {
    icon: Sparkles,
    title: "5 Adaptive Tones",
    description:
      "Switch between Professional, Friendly, Formal, Casual, and Persuasive tones to match every context and relationship.",
  },
  {
    icon: Shield,
    title: "Your History, Secured",
    description:
      "Every generated email is saved to your personal Firestore history — accessible only to you, signed in with Firebase Auth.",
  },
];

const SOCIAL_PROOF = [
  "No credit card required",
  "Powered by Gemini 1.5 Flash",
  "Firebase-authenticated",
  "Fully open source",
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
            <Mail className="size-5 text-primary" />
            <span>MailGenius</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-28 text-center">
          {/* Background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
          >
            <div className="size-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Powered by Google Gemini 1.5 Flash
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Write Perfect Emails{" "}
            <span className="text-primary">in Seconds</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Stop wrestling with words. Describe your email, pick a tone, and let
            AI generate a professional message tailored to your recipient —
            every time.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          {/* Social proof chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {SOCIAL_PROOF.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="size-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Everything you need to email better
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            A focused tool with no fluff — just great emails, faster.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
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
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-border bg-muted/50 p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Ready to send better emails?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create a free account and generate your first email in under 60
              seconds.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/sign-up" id="bottom-cta">
                Get Started — It&apos;s Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Mail className="size-4" />
            MailGenius
          </span>
          <span>Built with Next.js &amp; Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
