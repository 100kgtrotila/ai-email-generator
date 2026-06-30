'use client';

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { generateEmailAction, saveEmailAction } from "@/actions";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Mail,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { emailGenerationSchema, type EmailGenerationInput } from "@/lib/validations/email";
import type { EmailTone, EmailLength, GeneratedEmail } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TONES: { value: EmailTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "persuasive", label: "Persuasive" },
];

const LENGTHS: { value: EmailLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  // ── react-hook-form ────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmailGenerationInput>({
    resolver: zodResolver(emailGenerationSchema),
    defaultValues: {
      subject: "",
      tone: "professional",
      length: "medium",
      context: "",
    },
    mode: "onTouched",
  });

  const watchedTone = watch("tone");
  const watchedLength = watch("length");

  // ── Output state ──────────────────────────────────────────────────────────
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isSaving, startSaveTransition] = useTransition();

  // ── Submit handler — only called when Zod validation passes ───────────────
  async function onValidSubmit(data: EmailGenerationInput) {
    setServerError(null);
    setSaveSuccess(false);
    setGeneratedEmail(null);

    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) {
      setServerError("You must be signed in to generate emails.");
      return;
    }
    const idToken = await currentUser.getIdToken();

    const result = await generateEmailAction(idToken, {
      senderName: user?.displayName ?? "Me",
      recipientName: "",
      recipientRole: "",
      purpose: data.subject,
      tone: data.tone,
      additionalContext: data.context ?? "",
      length: data.length,
    });

    if (result.success) {
      setGeneratedEmail(result.data);
    } else {
      setServerError(result.error);
    }
  }

  // ── Utility handlers ──────────────────────────────────────────────────────
  function handleClear() {
    reset();
    setGeneratedEmail(null);
    setServerError(null);
    setSaveSuccess(false);
  }

  function handleCopy() {
    if (!generatedEmail) return;
    const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!generatedEmail) return;
    const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generatedEmail.subject.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleSave() {
    if (!generatedEmail) return;
    startSaveTransition(async () => {
      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) {
        setServerError("You must be signed in to save emails.");
        return;
      }
      const idToken = await currentUser.getIdToken();
      const result = await saveEmailAction(idToken, generatedEmail);
      if (result.success) {
        setSaveSuccess(true);
      } else {
        setServerError(result.error);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Page Headline */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Free AI Email Writer
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Generate professional emails in seconds — powered by Gemini AI.
          </p>
        </div>

        {/* Server Error Banner */}
        {serverError !== null && (
          <div
            role="alert"
            id="dashboard-error-banner"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-0.5 font-normal opacity-80">{serverError}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-indigo-500/10 ring-1 ring-slate-200/60">
          <form onSubmit={handleSubmit(onValidSubmit)} id="email-generator-form" noValidate>

            {/* ── Tone Header Bar ─────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3.5">
              <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Tone :
              </span>
              {TONES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  id={`tone-${value}`}
                  onClick={() => setValue("tone", value, { shouldValidate: true })}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
                    watchedTone === value
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Split Body ──────────────────────────────────────────── */}
            <div className="grid min-h-[400px] grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">

              {/* Left — Input Column */}
              <div className="flex flex-col gap-4 p-5 sm:p-6">

                {/* Subject field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="dashboard-subject"
                      className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
                    >
                      Subject / Topic
                    </label>
                    {/* Length pill selector */}
                    <div className="flex items-center gap-1" id="length-selector">
                      {LENGTHS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          id={`length-${value}`}
                          onClick={() => setValue("length", value, { shouldValidate: true })}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-150 cursor-pointer select-none",
                            watchedLength === value
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-200 bg-white text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    {...register("subject")}
                    id="dashboard-subject"
                    type="text"
                    placeholder="e.g., Partnership proposal..."
                    autoComplete="off"
                    className={cn(
                      "w-full rounded-lg border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2",
                      errors.subject
                        ? "border-red-300 focus:border-red-400 focus:ring-red-500/15"
                        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/15"
                    )}
                  />

                  {/* Subject validation error */}
                  {errors.subject && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-red-500" role="alert" id="subject-error">
                      <AlertTriangle className="size-3 shrink-0" />
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Context textarea */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <label
                    htmlFor="dashboard-context"
                    className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
                  >
                    Context
                    <span className="ml-1.5 font-normal normal-case text-slate-400/70">
                      — optional
                    </span>
                  </label>

                  <Textarea
                    {...register("context")}
                    id="dashboard-context"
                    placeholder="Enter your email context or paste text here..."
                    rows={9}
                    className={cn(
                      "flex-1 resize-none text-sm text-slate-800 placeholder:text-slate-400 transition focus:bg-white",
                      errors.context
                        ? "border-red-300 focus:border-red-400 focus:ring-red-500/15"
                        : "border-slate-200 bg-slate-50/60 focus:border-indigo-400 focus:ring-indigo-500/15"
                    )}
                  />

                  {/* Context validation error */}
                  {errors.context && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-red-500" role="alert" id="context-error">
                      <AlertTriangle className="size-3 shrink-0" />
                      {errors.context.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right — Output Column */}
              <div className="flex flex-col" id="output-column">
                {isSubmitting ? (
                  /* Loading state */
                  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="relative">
                      <div className="size-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                      <Sparkles className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">Writing your email…</p>
                      <p className="text-xs text-slate-400">Gemini AI is composing your draft</p>
                    </div>
                  </div>
                ) : generatedEmail !== null ? (
                  /* Result state */
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6" id="dashboard-result">
                    <div className="mb-3 border-b border-slate-100 pb-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Subject</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{generatedEmail.subject}</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {generatedEmail.body}
                    </p>
                  </div>
                ) : (
                  /* Empty state */
                  <div
                    className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
                    id="dashboard-empty-state"
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                      <Mail className="size-5" />
                    </div>
                    <div className="max-w-[220px] space-y-1">
                      <p className="text-sm font-semibold text-slate-600">Your email will appear here</p>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Add a subject and context on the left, then click &ldquo;Draft Email&rdquo;.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer Bar ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">

              {/* Left — secondary actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                  id="btn-dashboard-clear"
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </button>

                {generatedEmail !== null && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                      id="btn-dashboard-copy"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                      id="btn-dashboard-download"
                    >
                      <Download className="size-3.5" />
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving || saveSuccess}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                      id="btn-dashboard-save"
                    >
                      {isSaving ? (
                        <LoadingSpinner size={12} />
                      ) : saveSuccess ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      {saveSuccess ? "Saved!" : "Save"}
                    </button>
                  </>
                )}
              </div>

              {/* Right — primary CTA */}
              <button
                type="submit"
                id="btn-dashboard-generate"
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 cursor-pointer select-none",
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 shadow-indigo-300/50 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300/50"
                )}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size={14} className="text-white/80" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Draft Email
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
