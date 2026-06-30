'use client';

import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { EmailLength } from "@/types";
import type { EmailGenerationInput } from "@/lib/validations/email";

const LENGTHS: { value: EmailLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export function EmailFormInputs() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EmailGenerationInput>();
  
  const watchedLength = watch("length");

  return (
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
  );
}
