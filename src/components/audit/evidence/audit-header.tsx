'use client';

import { useState, type ReactNode } from 'react';
import { ExternalLink, Printer } from 'lucide-react';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import type { SiteIdentity } from '@/lib/audit/site-identity';
import { StatusChip } from '@/components/audit/evidence/ui';

export type ReportViewId = 'executive' | 'explorer' | 'compare' | 'connected';

export function AuditHeader({
  siteIdentity,
  view,
  activeView,
  onViewChange,
  showRerun,
  rerunSlot,
  showConnected,
}: {
  siteIdentity: SiteIdentity;
  view: BrandEvidenceReportView;
  activeView: ReportViewId;
  onViewChange: (id: ReportViewId) => void;
  showRerun?: boolean;
  rerunSlot?: ReactNode;
  showConnected?: boolean;
}) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const ex = view.executive;

  return (
    <header className="sticky top-14 z-30 -mx-8 bg-[#F3F3F3]/90 px-8 py-3 backdrop-blur-md print:static print:border-0 print:bg-white">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {faviconFailed ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-600">
              {siteIdentity.domain.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={siteIdentity.faviconUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-1"
              onError={() => setFaviconFailed(true)}
            />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold tracking-tight text-zinc-950">
                {siteIdentity.title}
              </h1>
              <StatusChip>Record ready</StatusChip>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
              <a
                href={siteIdentity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-zinc-900"
              >
                {siteIdentity.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span>Audit {ex.audit_date.slice(0, 10)}</span>
              <span className="tabular-nums">{ex.pages_analyzed} pages</span>
              <span className="tabular-nums">{ex.sampled_prompts_tested} prompts</span>
              <span className="tabular-nums">{ex.external_sources_identified} sources</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap rounded-lg bg-zinc-50 p-0.5 text-xs font-medium">
            {(
              [
                { id: 'executive' as const, label: 'Executive' },
                { id: 'explorer' as const, label: 'Evidence Explorer' },
                { id: 'compare' as const, label: 'Compare' },
                ...(showConnected
                  ? [{ id: 'connected' as const, label: 'Connected' }]
                  : []),
              ]
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onViewChange(id)}
                className={
                  activeView === id
                    ? 'rounded-md bg-white px-2.5 py-1.5 text-zinc-950 shadow-sm'
                    : 'rounded-md px-2.5 py-1.5 text-zinc-500 hover:text-zinc-800'
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Export
          </button>
          {showRerun ? rerunSlot : null}
        </div>
      </div>
    </header>
  );
}
