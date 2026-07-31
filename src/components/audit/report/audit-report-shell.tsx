'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { KobbeAuditReport } from '@/components/audit/report/kobbe-audit-report';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { SiteIdentity } from '@/lib/audit/site-identity';
import type { Website } from '@/lib/supabase/types';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface AuditReportShellProps {
  projectId: string;
  website: Website;
  siteIdentity: SiteIdentity;
  brandEvidence: BrandEvidenceReportView | null;
  previousBrandEvidence?: BrandEvidenceReportView | null;
  connectedMetrics?: ConnectedAuditMetrics | null;
  analyzing?: boolean;
  variant: 'free' | 'paid';
  showRerun?: boolean;
  rerunSlot?: ReactNode;
  showUpgradeBanner?: boolean;
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

function SiteIdentityBlock({ siteIdentity }: { siteIdentity: SiteIdentity }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
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
  );
}

function AuditProgress({ domain }: { domain: string }) {
  return (
    <div className="mx-auto w-full max-w-md space-y-3 pt-10">
      <p className="text-center text-sm font-medium text-zinc-900">Analyzing {domain}…</p>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"
        role="progressbar"
        aria-valuetext={`Analyzing ${domain}`}
        aria-busy="true"
      >
        <div className="audit-progress-bar h-full w-1/3 rounded-full bg-zinc-950" />
      </div>
      <p className="text-center text-xs text-zinc-500">
        Collecting public evidence. This page refreshes automatically.
      </p>
    </div>
  );
}

export function AuditReportShell({
  projectId,
  website,
  siteIdentity,
  brandEvidence,
  previousBrandEvidence = null,
  connectedMetrics = null,
  analyzing,
  variant,
  showRerun = true,
  rerunSlot,
  showUpgradeBanner = true,
}: AuditReportShellProps) {
  void previousBrandEvidence;
  if (analyzing) {
    return (
      <div className="space-y-8">
        <SiteIdentityBlock siteIdentity={siteIdentity} />
        <AuditProgress domain={website.domain} />
      </div>
    );
  }

  const resolvedRerunSlot =
    rerunSlot ??
    (showRerun ? <RerunFreeAuditButton websiteUrl={website.url} /> : null);

  return (
    <div className="space-y-6">
      {brandEvidence ? (
        <KobbeAuditReport
          view={brandEvidence}
          siteIdentity={siteIdentity}
          projectId={projectId}
          connectedMetrics={connectedMetrics}
          showRerun={showRerun}
          rerunSlot={showRerun ? resolvedRerunSlot : null}
          showUpgradeBanner={showUpgradeBanner}
        />
      ) : (
        <div className="space-y-8">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Brand Evidence Record
              </p>
              <SiteIdentityBlock siteIdentity={siteIdentity} />
            </div>
            {showRerun ? resolvedRerunSlot : null}
          </header>
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-5 py-8 text-center">
            <p className="text-sm font-medium text-zinc-800">
              No Brand Evidence Record is available for this audit yet.
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Re-run the audit to generate a source-backed evidence record from the public website.
            </p>
          </div>
        </div>
      )}

      {variant === 'free' ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-5 print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Add connected sources</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                Connect Google to include Search Console and Analytics observations in future
                evidence records.
              </p>
            </div>
            <Link
              href={`/audit/${projectId}/upgrade`}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
            >
              Connect sources
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
