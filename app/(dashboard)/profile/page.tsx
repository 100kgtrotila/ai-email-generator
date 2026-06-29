'use client';

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { UserCircle, Mail, LogOut } from "lucide-react";

function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  readonly label: string;
  readonly value: string | null;
  readonly icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut(getFirebaseAuth());
      router.push("/");
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account information.
        </p>
      </div>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <UserCircle className="size-10 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {user?.displayName ?? "Anonymous"}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <ProfileField
          label="Display Name"
          value={user?.displayName ?? null}
          icon={UserCircle}
        />
        <ProfileField
          label="Email Address"
          value={user?.email ?? null}
          icon={Mail}
        />
      </div>

      {/* Sign out */}
      <div className="mt-8 border-t border-border pt-6">
        <Button
          id="profile-signout"
          variant="destructive"
          className="w-full gap-2"
          onClick={handleSignOut}
          disabled={isPending}
        >
          {isPending ? (
            <LoadingSpinner className="mr-1" />
          ) : (
            <LogOut className="size-4" />
          )}
          Sign Out
        </Button>
      </div>
    </div>
  );
}
