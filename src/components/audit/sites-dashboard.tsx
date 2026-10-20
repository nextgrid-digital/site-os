import { AddSiteAuditDialogLazy } from '@/components/audit/add-site-audit-dialog-lazy';
import type { SitesDashboardSite } from '@/components/audit/site-card';
import { SitesGrid } from '@/components/audit/sites-grid';

export type { SitesDashboardSite };

interface SitesDashboardProps {
  sites: SitesDashboardSite[];
  highlightSessionId?: string | null;
}

export function SitesDashboard({
  sites,
  highlightSessionId,
}: SitesDashboardProps) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-base font-semibold text-foreground">Your sites</h1>
        <AddSiteAuditDialogLazy />
      </div>

      <section className="space-y-4">
        <SitesGrid initialSites={sites} highlightSessionId={highlightSessionId} />
      </section>
    </>
  );
}
