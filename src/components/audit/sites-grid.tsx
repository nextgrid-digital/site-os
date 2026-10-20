'use client';

import { useState } from 'react';
import { AddSiteAuditDialogLazy } from '@/components/audit/add-site-audit-dialog-lazy';
import { SiteCard, type SitesDashboardSite } from '@/components/audit/site-card';

export function SitesGrid({
  initialSites,
  highlightSessionId,
}: {
  initialSites: SitesDashboardSite[];
  highlightSessionId?: string | null;
}) {
  const [sites, setSites] = useState(initialSites);

  if (sites.length === 0) {
    return (
      <div className="rounded-2xl bg-raised px-6 py-14 text-center">
        <p className="text-sm font-medium text-foreground">No sites yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Add a site to start your first free audit.</p>
        <div className="mt-5 flex justify-center">
          <AddSiteAuditDialogLazy
            triggerClassName="inline-flex h-auto items-center gap-1.5 rounded-lg bg-primary px-4 py-2 pointer-coarse:py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
          />
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <SiteCard
          key={site.sessionId}
          site={site}
          highlighted={highlightSessionId === site.sessionId}
          onDeleted={(projectId) => {
            setSites((prev) => prev.filter((s) => s.projectId !== projectId));
          }}
        />
      ))}
    </ul>
  );
}
