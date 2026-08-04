import { AddSiteAuditDialogLazy } from '@/components/audit/add-site-audit-dialog-lazy';
import { AppShell } from '@/components/audit/app-shell';
import { ConnectedUpgradeBanner } from '@/components/audit/connected-upgrade-banner';
import type { SitesDashboardSite } from '@/components/audit/site-card';
import { SitesGrid } from '@/components/audit/sites-grid';

export type { SitesDashboardSite };

interface SitesDashboardProps {
  sites: SitesDashboardSite[];
  userInitials: string;
  highlightSessionId?: string | null;
  showUpgradeBanner?: boolean;
}

export function SitesDashboard({
  sites,
  userInitials,
  highlightSessionId,
  showUpgradeBanner = false,
}: SitesDashboardProps) {
  return (
    <AppShell userInitials={userInitials} signedIn>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-base font-semibold text-zinc-900">Your sites</h1>
        <AddSiteAuditDialogLazy />
      </div>

      {showUpgradeBanner ? <ConnectedUpgradeBanner className="mb-8" /> : null}

      <section className="space-y-4">
        <SitesGrid initialSites={sites} highlightSessionId={highlightSessionId} />
      </section>
    </AppShell>
  );
}
