import { AddSiteAuditDialogLazy } from '@/components/audit/add-site-audit-dialog-lazy';
import { ConnectedUpgradeBanner } from '@/components/audit/connected-upgrade-banner';
import { GoogleInventorySitesSection } from '@/components/audit/google-inventory-sites-section';
import type { SitesDashboardSite } from '@/components/audit/site-card';
import { SitesGrid } from '@/components/audit/sites-grid';
import type { GoogleInventoryCandidate } from '@/lib/db/google-inventory';

export type { SitesDashboardSite };

interface SitesDashboardProps {
  sites: SitesDashboardSite[];
  highlightSessionId?: string | null;
  showUpgradeBanner?: boolean;
  googleInventory?: {
    connected: boolean;
    operatorEmail: string | null;
    syncedAt: string | null;
    candidates: GoogleInventoryCandidate[];
  } | null;
}

export function SitesDashboard({
  sites,
  highlightSessionId,
  showUpgradeBanner = false,
  googleInventory = null,
}: SitesDashboardProps) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-base font-semibold text-zinc-900">Your sites</h1>
        <AddSiteAuditDialogLazy />
      </div>

      {showUpgradeBanner ? <ConnectedUpgradeBanner className="mb-8" /> : null}

      <section className="space-y-4">
        <SitesGrid initialSites={sites} highlightSessionId={highlightSessionId} />
      </section>

      {googleInventory ? (
        <div className="mt-10">
          <GoogleInventorySitesSection initial={googleInventory} />
        </div>
      ) : null}
    </>
  );
}
