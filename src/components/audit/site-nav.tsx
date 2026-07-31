import Link from 'next/link';
import type { ReactNode } from 'react';
import { UserAccountMenu } from '@/components/audit/user-account-menu';

/** Shared content width with marketing sections (`max-w-280 px-8`). */
export const SITE_CONTENT_CLASS = 'mx-auto w-full max-w-280 px-8';

export const SITE_NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
] as const;

interface SiteNavProps {
  userInitials?: string | null;
  showSignIn?: boolean;
  /** Explicit Supabase session — hides Sign in even if initials are missing. */
  signedIn?: boolean;
  /** Marketing center links (How it works / Pricing / FAQ). Off on product pages. */
  showMarketingNav?: boolean;
  rightSlot?: ReactNode;
}

export function SiteNav({
  userInitials,
  showSignIn,
  signedIn,
  showMarketingNav = false,
  rightSlot,
}: SiteNavProps) {
  const isSignedIn = Boolean(signedIn || userInitials);
  const shouldShowSignIn = Boolean(showSignIn) && !isSignedIn;
  const menuInitials = (userInitials || 'SO').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#F3F3F3]">
      {/* 3 equal columns so center links stay optically centered despite asymmetric sides */}
      <div className={`${SITE_CONTENT_CLASS} grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4`}>
        <Link
          href="/"
          className="justify-self-start flex shrink-0 items-center gap-2 font-semibold tracking-tight text-zinc-950"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
            SO
          </span>
          <span>Site-OS</span>
        </Link>

        {showMarketingNav ? (
          <nav aria-label="Primary" className="hidden items-center justify-center gap-1 md:flex">
            {SITE_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="justify-self-center" aria-hidden="true" />
        )}

        <div className="justify-self-end flex shrink-0 items-center gap-2 sm:gap-3">
          {rightSlot}
          <Link
            href="/#audit"
            className="hidden rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 sm:inline-flex"
          >
            New audit
          </Link>
          {shouldShowSignIn ? (
            <Link
              href="/login?next=/app"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Sign in
            </Link>
          ) : null}
          {isSignedIn ? <UserAccountMenu initials={menuInitials} /> : null}
        </div>
      </div>
    </header>
  );
}
