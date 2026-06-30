'use client';

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { EmailTone } from "@/types";
import type { EmailGenerationInput } from "@/lib/validations/email";

const TONES: { value: EmailTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "persuasive", label: "Persuasive" },
];

export function ToneSelector() {
  const { watch, setValue } = useFormContext<EmailGenerationInput>();
  const watchedTone = watch("tone");

  return (
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
  );
}
