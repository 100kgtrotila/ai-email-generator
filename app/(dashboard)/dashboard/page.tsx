'use client';

import { useState, useTransition } from "react";
import { useAuth } from "@/components/providers";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { generateEmailAction, saveEmailAction } from "@/actions";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Save, Sparkles, CheckCircle2 } from "lucide-react";
import type { EmailTone, GeneratedEmail } from "@/types";

const TONES: { value: EmailTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "persuasive", label: "Persuasive" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Selected tone tracked separately so Select value is controlled
  const [tone, setTone] = useState<EmailTone>("professional");

  function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement).value;

    startTransition(async () => {
      setError(null);
      setSaveSuccess(false);

      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) {
        setError('You must be signed in to generate emails.');
        return;
      }
      const idToken = await currentUser.getIdToken();

      const result = await generateEmailAction(idToken, {
        recipientName: get("recipientName"),
        recipientRole: get("recipientRole"),
        senderName: get("senderName"),
        purpose: get("purpose"),
        tone,
        additionalContext: get("additionalContext"),
      });

      if (result.success) {
        setGeneratedEmail(result.data);
      } else {
        setError(result.error);
      }
    });
  }

  function handleCopy() {
    if (!generatedEmail) return;
    const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSave() {
    if (!generatedEmail) return;
    startSaveTransition(async () => {
      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) {
        setError('You must be signed in to save emails.');
        return;
      }
      const idToken = await currentUser.getIdToken();
      const result = await saveEmailAction(idToken, generatedEmail);
      if (result.success) {
        setSaveSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email Generator
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below and let AI write your email.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Input Form ──────────────────────────────────────────────────── */}
        <form
          id="email-generator-form"
          onSubmit={handleGenerate}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gen-sender-name">Your Name</Label>
              <Input
                id="gen-sender-name"
                name="senderName"
                placeholder="Jane Smith"
                required
                defaultValue={user?.displayName ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen-recipient-name">Recipient Name</Label>
              <Input
                id="gen-recipient-name"
                name="recipientName"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gen-recipient-role">Recipient Role / Company</Label>
            <Input
              id="gen-recipient-role"
              name="recipientRole"
              placeholder="Hiring Manager at Acme Corp"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gen-purpose">Purpose of the Email</Label>
            <Input
              id="gen-purpose"
              name="purpose"
              placeholder="Follow up on my job application submitted last week"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gen-tone">Tone</Label>
            <Select
              value={tone}
              onValueChange={(v) => setTone(v as EmailTone)}
            >
              <SelectTrigger id="gen-tone">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gen-context">Additional Context (optional)</Label>
            <Textarea
              id="gen-context"
              name="additionalContext"
              placeholder="Any specific details, deadlines, or talking points to include…"
              rows={4}
            />
          </div>

          {error !== null && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            id="gen-submit"
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Generate Email
              </>
            )}
          </Button>
        </form>

        {/* ── Output ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Generated Email
            </h2>
            {generatedEmail !== null && (
              <div className="flex gap-2">
                <Button
                  id="gen-copy"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckCircle2 className="mr-1.5 size-3.5 text-primary" />
                  ) : (
                    <Copy className="mr-1.5 size-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  id="gen-save"
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                >
                  {isSaving ? (
                    <LoadingSpinner className="mr-1.5" size={12} />
                  ) : saveSuccess ? (
                    <CheckCircle2 className="mr-1.5 size-3.5 text-primary" />
                  ) : (
                    <Save className="mr-1.5 size-3.5" />
                  )}
                  {saveSuccess ? "Saved!" : "Save"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex min-h-[360px] flex-1 flex-col rounded-xl border border-border bg-muted/30">
            {generatedEmail === null ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {isPending
                    ? "Writing your email…"
                    : "Your generated email will appear here."}
                </p>
              </div>
            ) : (
              <div className="p-5 text-sm leading-relaxed text-foreground">
                <p className="mb-3 font-medium">
                  <span className="text-muted-foreground">Subject: </span>
                  {generatedEmail.subject}
                </p>
                <hr className="mb-3 border-border" />
                <p className="whitespace-pre-wrap">{generatedEmail.body}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
