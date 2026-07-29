import Link from 'next/link';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  userInitials?: string | null;
  showSignIn?: boolean;
  rightSlot?: ReactNode;
}

export function AppShell({ children, userInitials, showSignIn, rightSlot }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#fafafa] text-zinc-950">
      <header className="border-b border-zinc-200/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/app" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
              SO
            </span>
            <span>Site-OS</span>
          </Link>
          <div className="flex items-center gap-3">
            {rightSlot}
            {showSignIn ? (
              <Link
                href="/login?next=/app"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              >
                Sign in
              </Link>
            ) : null}
            {userInitials ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700"
                aria-label="Account"
              >
                {userInitials}
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
