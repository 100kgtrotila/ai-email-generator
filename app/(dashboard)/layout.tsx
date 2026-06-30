'use client';

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
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
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <Mail className="size-3.5" />
        </div>
        <span className="font-semibold tracking-tight text-slate-800">MailGenius</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              id={`sidebar-nav-${label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-indigo-600" : "text-slate-400",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-slate-100 p-3">
        <button
          id="sidebar-signout"
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          <LogOut className="size-4 shrink-0" />
          Sign Out
        </button>
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
