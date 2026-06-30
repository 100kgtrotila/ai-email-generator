'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { parseFirebaseAuthError } from "@/lib/firebase/parse-auth-error";
import { AuthForm, type AuthField } from "@/components/auth/auth-form";

const SIGNUP_FIELDS: readonly AuthField[] = [
  {
    id: "signup-name",
    name: "name",
    type: "text",
    label: "Full Name",
    placeholder: "Jane Smith",
    required: true,
    autoComplete: "name",
  },
  {
    id: "signup-email",
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
    autoComplete: "email",
  },
  {
    id: "signup-password",
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "At least 8 characters",
    required: true,
    minLength: 8,
    autoComplete: "new-password",
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function formAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      setError(null);
      try {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );
        await updateProfile(credential.user, { displayName: name });
        router.push("/dashboard");
      } catch (err) {
        setError(parseFirebaseAuthError(err));
      }
    });
  }

  return (
    <AuthForm
      title="Create your account"
      subtitle="Start generating emails with AI — free forever"
      formId="signup-form"
      fields={SIGNUP_FIELDS}
      submitLabel="Create Account"
      loadingLabel="Creating account…"
      submitId="signup-submit"
      onSubmit={formAction}
      error={error}
      isPending={isPending}
      footerLink={{
        text: "Already have an account?",
        linkText: "Sign in",
        href: "/login",
        id: "signup-login-link",
      }}
    />
  );
}
