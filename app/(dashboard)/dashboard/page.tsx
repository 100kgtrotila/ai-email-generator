'use client';

import { useState, useTransition, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers";
import { useIdToken, NotAuthenticatedError } from "@/hooks/use-id-token";
import { generateEmailAction, saveEmailAction } from "@/actions";
import { emailGenerationSchema, type EmailGenerationInput } from "@/lib/validations/email";
import type { GeneratedEmail } from "@/types";
import { toast } from "sonner";

// Import Extracted Components
import { ToneSelector } from "@/components/dashboard/tone-selector";
import { EmailFormInputs } from "@/components/dashboard/email-form-inputs";
import { EmailResultView } from "@/components/dashboard/email-result-view";
import { EmailActionToolbar } from "@/components/dashboard/email-action-toolbar";

export default function DashboardPage() {
  const { user } = useAuth();
  const getIdToken = useIdToken();

  // ── react-hook-form ────────────────────────────────────────────────────────
  const methods = useForm<EmailGenerationInput>({
    resolver: zodResolver(emailGenerationSchema),
    defaultValues: {
      subject: "",
      tone: "professional",
      length: "medium",
      context: "",
    },
    mode: "onTouched",
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  // ── Output state ──────────────────────────────────────────────────────────
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isSaving, startSaveTransition] = useTransition();

  // ── Submit handler ────────────────────────────────────────────────────────
  async function onValidSubmit(data: EmailGenerationInput) {
    setSaveSuccess(false);
    setGeneratedEmail(null);

    let idToken: string;
    try {
      idToken = await getIdToken();
    } catch (err) {
      if (err instanceof NotAuthenticatedError) {
        toast.error("Помилка авторизації", { description: "Ви повинні увійти, щоб генерувати листи." });
      } else {
        toast.error("Помилка мережі", { description: "Не вдалося перевірити сесію. Спробуйте ще раз." });
      }
      return;
    }

    try {
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
        toast.error("Помилка генерації", { description: result.error.message });
      }
    } catch (error) {
      console.error("Action failed:", error);
      toast.error("Системна помилка", { description: "Сталася непередбачена помилка. Спробуйте пізніше." });
    }
  }

  // ── Utility handlers ──────────────────────────────────────────────────────
  function handleClear() {
    if (isSubmitting || isSaving) return;
    reset();
    setGeneratedEmail(null);
    setSaveSuccess(false);
  }

  function handleCopy() {
    if (!generatedEmail) return;
    const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
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
      let idToken: string;
      try {
        idToken = await getIdToken();
      } catch (err) {
        if (err instanceof NotAuthenticatedError) {
          toast.error("Помилка авторизації", { description: "Ви повинні увійти, щоб зберігати листи." });
        } else {
          toast.error("Помилка мережі", { description: "Не вдалося перевірити сесію. Спробуйте ще раз." });
        }
        return;
      }
      try {
        const result = await saveEmailAction(idToken, generatedEmail);
        if (result.success) {
          setSaveSuccess(true);
          toast.success("Збережено", { description: "Лист успішно збережено в історію." });
        } else {
          toast.error("Помилка збереження", { description: result.error.message });
        }
      } catch (error) {
        console.error("Save failed:", error);
        toast.error("Системна помилка", { description: "Не вдалося зберегти лист." });
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

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-indigo-500/10 ring-1 ring-slate-200/60">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onValidSubmit)} id="email-generator-form" noValidate>
              
              <ToneSelector />

              {/* ── Split Body ──────────────────────────────────────────── */}
              <div className="grid min-h-[400px] grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                <EmailFormInputs />
                <EmailResultView isSubmitting={isSubmitting} generatedEmail={generatedEmail} />
              </div>

              <EmailActionToolbar
                isSubmitting={isSubmitting}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                copied={copied}
                hasResult={generatedEmail !== null}
                onClear={handleClear}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onSave={handleSave}
              />
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
