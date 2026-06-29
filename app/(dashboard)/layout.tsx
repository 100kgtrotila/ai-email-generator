'use client';

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Mail, History, User, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Generator", icon: Sparkles },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
] as const;

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.push("/");
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-semibold tracking-tight text-sidebar-foreground">
        <Mail className="size-4 text-primary" />
        MailGenius
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              id={`sidebar-nav-${label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-border p-3">
        <Button
          id="sidebar-signout"
          variant="ghost"
          className="w-full justify-start gap-2 text-sm text-sidebar-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auth guard — redirect unauthenticated users to /login
  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (user === null) {
    // Render nothing while the redirect happens
    return null;
  }

  return (
    <div className="flex min-h-full">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}
