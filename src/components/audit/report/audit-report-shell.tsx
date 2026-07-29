'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { AgentsReportPanel } from '@/components/audit/report/agents-report-panel';
import { AskAiImplement } from '@/components/audit/report/ask-ai-implement';
import {
  HumanReportPanel,
  type HumanTrafficTables,
} from '@/components/audit/report/human-report-panel';
import { ReportTabs, type ReportTabId } from '@/components/audit/report/report-tabs';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import type { DisplayAgentPrompt } from '@/lib/audit/display-agent-prompts';
import type { FreeReportViewModel } from '@/lib/audit/free-report-view';
import type { SiteIdentity } from '@/lib/audit/site-identity';
import type { Website } from '@/lib/supabase/types';

interface AuditReportShellProps {
  projectId: string;
  website: Website;
  siteIdentity: SiteIdentity;
  view: FreeReportViewModel;
  prompts: DisplayAgentPrompt[];
  analyzing?: boolean;
  hasResults?: boolean;
  /** Free audit vs connected paid audit eyebrow */
  variant: 'free' | 'paid';
  /** Paid: pass traffic tables; free: omit (upgrade strip shown instead) */
  traffic?: HumanTrafficTables | null;
  showRerun?: boolean;
}

function SiteFavicon({ src, domain }: { src: string; domain: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-600">
        {domain.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary third-party favicon hosts
    <img
      src={src}
      alt=""
      width={48}
      height={48}
      className="h-12 w-12 shrink-0 rounded-2xl border border-zinc-200 bg-white object-contain p-1.5"
      onError={() => setFailed(true)}
    />
  );
}

function OgImagePreview({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 sm:w-56 sm:shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary OG image hosts */}
      <img
        src={src}
        alt="Open Graph preview"
        className="aspect-[1.91/1] h-auto w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function AuditReportShell({
  projectId,
  website,
  siteIdentity,
  view,
  prompts,
  analyzing,
  hasResults,
  variant,
  traffic,
  showRerun = true,
}: AuditReportShellProps) {
  const [tab, setTab] = useState<ReportTabId>('human');

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            {variant === 'paid' ? 'Connected audit' : 'Site-OS audit'}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {siteIdentity.ogImageUrl ? (
              <OgImagePreview src={siteIdentity.ogImageUrl} />
            ) : null}
            <div className="flex min-w-0 flex-1 gap-4">
              <SiteFavicon src={siteIdentity.faviconUrl} domain={siteIdentity.domain} />
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                  {siteIdentity.title}
                </h1>
                {siteIdentity.description ? (
                  <p className="max-w-2xl text-sm leading-6 text-zinc-600">{siteIdentity.description}</p>
                ) : null}
                <a
                  href={siteIdentity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
                >
                  <span className="truncate">{siteIdentity.domain}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="sr-only">Open site</span>
                </a>
              </div>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            {view.categoryLabel} · {view.businessModelLabel} · {view.conversionGoalLabel}
            {view.uncertain ? ' · Classification still uncertain' : ''}
          </p>
        </div>
        {showRerun ? (
          <RerunFreeAuditButton websiteUrl={website.url} disabled={analyzing && !hasResults} />
        ) : null}
      </header>

      {analyzing && !hasResults ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-10 text-center">
          <p className="text-sm font-medium text-zinc-900">Analyzing {website.domain}…</p>
          <p className="mt-2 text-sm text-zinc-500">
            Crawling public pages and building the audit. This page refreshes automatically.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-zinc-200 py-4">
            {view.scoreStrip.map((item, index) => (
              <div key={item.id} className="flex items-baseline gap-2">
                {index > 0 ? <span className="mr-1 hidden text-zinc-300 sm:inline">·</span> : null}
                <span className="text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-zinc-950">{item.value}</span>
              </div>
            ))}
          </div>

          <ReportTabs active={tab} onChange={setTab} />

          {tab === 'human' ? (
            <HumanReportPanel view={view} traffic={traffic ?? null} />
          ) : (
            <AgentsReportPanel view={view} prompts={prompts} />
          )}

          <div className="border-t border-zinc-200 pt-8">
            <AskAiImplement askAi={view.askAi} />
          </div>

          {variant === 'free' ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Unlock live traffic</p>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                    Connect Google to add sessions, sources, and keywords to the Human tab.
                  </p>
                </div>
                <Link
                  href={`/audit/${projectId}/upgrade`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
                >
                  Upgrade & connect Google
                </Link>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
