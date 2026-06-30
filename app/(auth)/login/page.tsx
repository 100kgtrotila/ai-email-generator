'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { parseFirebaseAuthError } from "@/lib/firebase/parse-auth-error";
import { AuthForm, type AuthField } from "@/components/auth/auth-form";

const LOGIN_FIELDS: readonly AuthField[] = [
  {
    id: "login-email",
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
    autoComplete: "email",
  },
  {
    id: "login-password",
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "••••••••",
    required: true,
    autoComplete: "current-password",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function formAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      setError(null);
      try {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        router.push("/dashboard");
      } catch (err) {
        setError(parseFirebaseAuthError(err));
      }
    });
  }

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your MailGenius account"
      formId="login-form"
      fields={LOGIN_FIELDS}
      submitLabel="Sign In"
      loadingLabel="Signing in…"
      submitId="login-submit"
      onSubmit={formAction}
      error={error}
      isPending={isPending}
      footerLink={{
        text: "Don't have an account?",
        linkText: "Sign up free",
        href: "/sign-up",
        id: "login-signup-link",
      }}
    />
  );
}
