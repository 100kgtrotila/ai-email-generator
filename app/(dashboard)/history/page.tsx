'use client';

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getEmailHistoryAction, deleteEmailAction } from "@/actions";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import type { GeneratedEmail } from "@/types";

function EmailCard({
  email,
  onDelete,
  isDeleting,
}: {
  readonly email: GeneratedEmail;
  readonly onDelete: (id: string) => void;
  readonly isDeleting: boolean;
}) {
  const date = new Date(email.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{email.subject}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            To: {email.request.recipientName} &bull;{" "}
            <span className="capitalize">{email.request.tone}</span> &bull; {date}
          </p>
        </div>
        <Button
          id={`delete-email-${email.id}`}
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(email.id)}
          disabled={isDeleting}
          aria-label="Delete email"
        >
          {isDeleting ? (
            <LoadingSpinner size={14} />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {email.body}
      </p>
    </article>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) return;
    void currentUser.getIdToken().then((idToken) =>
      getEmailHistoryAction(idToken).then((result) => {
        if (result.success) {
          setEmails(result.data);
        } else {
          setError(result.error);
        }
        setLoading(false);
      })
    );
  }, [user]);

  function handleDelete(emailId: string) {
    if (!user) return;
    setDeletingId(emailId);
    startDeleteTransition(async () => {
      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) {
        setError('You must be signed in to delete emails.');
        setDeletingId(null);
        return;
      }
      const idToken = await currentUser.getIdToken();
      const result = await deleteEmailAction(idToken, emailId);
      if (result.success) {
        setEmails((prev) => prev.filter((e) => e.id !== emailId));
      } else {
        setError(result.error);
      }
      setDeletingId(null);
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All your previously saved generated emails.
        </p>
      </div>

      {error !== null && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={28} />
        </div>
      ) : emails.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <Mail className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No saved emails yet. Generate one and click &ldquo;Save&rdquo;!
          </p>
        </div>
      ) : (
        <div id="email-history-list" className="space-y-4">
          {emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onDelete={handleDelete}
              isDeleting={isDeleting && deletingId === email.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
