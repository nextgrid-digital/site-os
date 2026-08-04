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
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
        <p className="text-sm font-medium text-zinc-900">No sites yet</p>
        <p className="mt-1 text-sm text-zinc-500">Add a site to start your first free audit.</p>
        <div className="mt-5 flex justify-center">
          <AddSiteAuditDialogLazy
            triggerClassName="inline-flex h-auto items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
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
