import type { ReactNode } from 'react';
import Link from 'next/link';

export function AuditShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f7fafc] text-slate-900">
      <header className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">NextGrid</p>
            <span className="text-base font-semibold tracking-tight">Site-OS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              Sign in
            </Link>
            <Link
              href="/"
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
            >
              New audit
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8 md:px-6">{children}</main>
      <footer className="px-6 py-8">
        <div className="mx-auto max-w-4xl text-center text-xs text-slate-400">
          Preview first. Sign in for the full free audit. Upgrade for the paid connected audit.
        </div>
      </footer>
    </div>
  );
}
