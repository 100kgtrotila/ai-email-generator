'use client';

import { Sparkles, Mail } from "lucide-react";
import type { GeneratedEmail } from "@/types";

interface EmailResultViewProps {
  isSubmitting: boolean;
  generatedEmail: GeneratedEmail | null;
}

export function EmailResultView({ isSubmitting, generatedEmail }: EmailResultViewProps) {
  if (isSubmitting) {
    return (
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
    );
  }

  if (generatedEmail !== null) {
    return (
      <div className="flex-1 overflow-y-auto p-5 sm:p-6" id="dashboard-result">
        <div className="mb-3 border-b border-slate-100 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Subject</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{generatedEmail.subject}</p>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {generatedEmail.body}
        </p>
      </div>
    );
  }

  return (
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
  );
}
