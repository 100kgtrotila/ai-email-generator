'use client';

import { Trash2, Copy, CheckCircle2, Download, Save, Sparkles } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";

interface EmailActionToolbarProps {
  isSubmitting: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  copied: boolean;
  hasResult: boolean;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
}

export function EmailActionToolbar({
  isSubmitting,
  isSaving,
  saveSuccess,
  copied,
  hasResult,
  onClear,
  onCopy,
  onDownload,
  onSave,
}: EmailActionToolbarProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
      {/* Left — secondary actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          id="btn-dashboard-clear"
        >
          <Trash2 className="size-3.5" />
          Clear
        </button>

        {hasResult && (
          <>
            <button
              type="button"
              onClick={onCopy}
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
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              id="btn-dashboard-download"
            >
              <Download className="size-3.5" />
              Download
            </button>

            <button
              type="button"
              onClick={onSave}
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
  );
}
