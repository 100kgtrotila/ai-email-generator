import type { ReactNode } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/30 px-4 py-12">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-semibold tracking-tight text-foreground"
        id="auth-logo-link"
      >
        <Mail className="size-5 text-primary" />
        MailGenius
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
