import type { ReactNode } from 'react';
import { SITE_CONTENT_CLASS, SiteNav } from '@/components/audit/site-nav';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';

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
    <div
      className="flex min-h-dvh flex-col bg-background text-foreground"
      {...(!fullBleed ? { 'data-audit-app': '' } : {})}
    >
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
        <>
          <main className={`${SITE_CONTENT_CLASS} flex-1 py-6`}>{children}</main>
          <footer className="mt-auto border-t border-border py-4">
            <div
              className={`${SITE_CONTENT_CLASS} flex flex-wrap items-center justify-between gap-3`}
            >
              <p className="text-xs text-muted-foreground">Site-OS</p>
              <ThemeModeToggle />
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
