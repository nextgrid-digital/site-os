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
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
      {/* 3 equal columns so center links stay optically centered despite asymmetric sides */}
      <div className={`${SITE_CONTENT_CLASS} grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4`}>
        <Link
          href="/"
          className="justify-self-start flex shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground"
          aria-label="Site-OS home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            className="h-7 w-7 shrink-0"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M19.5 3.5h-2.38l.94-.94a1.49 1.49 0 0 0 0-2.12a1.51 1.51 0 0 0-2.12 0L12.88 3.5h-1.76L8.06.44a1.51 1.51 0 0 0-2.12 0a1.49 1.49 0 0 0 0 2.12l.94.94H4.5A4.51 4.51 0 0 0 0 8v10a4.51 4.51 0 0 0 4.5 4.5H5a1.75 1.75 0 0 0 3.46 0h7a1.75 1.75 0 0 0 3.46 0h.52A4.51 4.51 0 0 0 24 18V8a4.51 4.51 0 0 0-4.5-4.5M21 18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V8a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 8Z"
            />
            <path
              fill="currentColor"
              d="M15 15.1a.73.73 0 0 0-.87.57a.54.54 0 0 1-.34.08c-.65 0-1-1-1-1a.76.76 0 0 0-.71-.49a.76.76 0 0 0-.7.49s-.4 1-1.05 1c-.23 0-.32-.06-.32 0a.75.75 0 0 0-1.55.25a1.69 1.69 0 0 0 1.79 1.24a2.35 2.35 0 0 0 1.75-.82a2.35 2.35 0 0 0 1.75.83A1.69 1.69 0 0 0 15.54 16a.77.77 0 0 0-.54-.9m-5.24-4.45a.74.74 0 0 0-.88-.58l-3.94.8a.75.75 0 0 0-.59.89a.77.77 0 0 0 .74.6h.15l3.94-.8a.76.76 0 0 0 .58-.91m9.3.22l-3.94-.8a.74.74 0 0 0-.88.58a.76.76 0 0 0 .58.89l3.94.8h.15a.77.77 0 0 0 .74-.6a.75.75 0 0 0-.59-.87"
            />
          </svg>
        </Link>

        {showMarketingNav ? (
          <nav aria-label="Primary" className="hidden items-center justify-center gap-1 md:flex">
            {SITE_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isSignedIn ? (
              <Link
                href="/app"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
            ) : null}
          </nav>
        ) : isSignedIn ? (
          <nav aria-label="Primary" className="hidden items-center justify-center gap-1 md:flex">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Marketing site
            </Link>
          </nav>
        ) : (
          <div className="justify-self-center" aria-hidden="true" />
        )}

        <div className="justify-self-end flex shrink-0 items-center gap-2 sm:gap-3">
          {rightSlot}
          {shouldShowSignIn ? (
            <Link
              href="/login?next=/app"
              className="rounded-lg bg-card px-3 py-1.5 text-sm font-medium text-card-foreground shadow-sm transition hover:bg-muted"
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
