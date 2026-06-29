'use client';

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    startTransition(async () => {
      setError(null);
      try {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        router.push("/dashboard");
      } catch {
        setError("Invalid email or password. Please try again.");
      }
    });
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your MailGenius account
        </p>
      </div>

      <form onSubmit={handleSubmit} id="login-form" className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={isPending}
          />
        </div>

        {error !== null && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          id="login-submit"
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoadingSpinner className="mr-2" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          id="login-signup-link"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up free
        </Link>
      </p>
    </>
  );
}
