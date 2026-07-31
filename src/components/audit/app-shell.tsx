import type { ReactNode } from 'react';
import { SITE_CONTENT_CLASS, SiteNav } from '@/components/audit/site-nav';

interface AppShellProps {
  children: ReactNode;
  userInitials?: string | null;
  showSignIn?: boolean;
  signedIn?: boolean;
  rightSlot?: ReactNode;
  /** Skip constrained main — for full-bleed pages like the marketing home. */
  fullBleed?: boolean;
}

export function AppShell({
  children,
  userInitials,
  showSignIn,
  signedIn,
  rightSlot,
  fullBleed,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#F3F3F3] text-zinc-950">
      <SiteNav
        userInitials={userInitials}
        showSignIn={showSignIn}
        signedIn={signedIn}
        showMarketingNav={Boolean(fullBleed)}
        rightSlot={rightSlot}
      />
      {fullBleed ? (
        children
      ) : (
        <main className={`${SITE_CONTENT_CLASS} py-6`}>{children}</main>
      )}
    </div>
  );
}
