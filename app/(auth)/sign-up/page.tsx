'use client';

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

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
        const message =
          err instanceof Error ? err.message : "Sign up failed. Please try again.";
        setError(message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim());
      }
    });
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start generating emails with AI — free forever
        </p>
      </div>

      <form action={formAction} id="signup-form" className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input
            id="signup-name"
            name="name"
            type="text"
            placeholder="Jane Smith"
            required
            autoComplete="name"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={isPending}
          />
        </div>

        {error !== null && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          id="signup-submit"
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoadingSpinner className="mr-2" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          id="signup-login-link"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
