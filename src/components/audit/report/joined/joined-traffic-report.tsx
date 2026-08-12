'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import '@/components/audit/report/audit-report-tokens.css';
import {
  buildDashboardSourceChips,
  DashboardSourceStrip,
} from '@/components/audit/dashboard/dashboard-source-strip';
import { DashboardFunnelViews } from '@/components/audit/dashboard/dashboard-funnel-views';
import { DashboardLeadsBlock } from '@/components/audit/dashboard/dashboard-leads-block';
import { FunnelHealthStrip } from '@/components/audit/dashboard/funnel-health-strip';
import { GoogleDataInventory } from '@/components/audit/dashboard/google-data-inventory';
import { ConnectedAnalyticsSuite } from '@/components/audit/report/analytics/connected-analytics-suite';
import { BrandAdsSection } from '@/components/audit/report/brand/brand-ads-section';
import {
  BrandEmptyState,
  BrandSectionNav,
} from '@/components/audit/report/brand/brand-section-nav';
import { JoinedChainBreaks } from '@/components/audit/report/joined/joined-chain-breaks';
import { JoinedPageStoryTable } from '@/components/audit/report/joined/joined-page-story-table';
import { JoinedQueryBridges } from '@/components/audit/report/joined/joined-query-bridges';
import { SectionHeading } from '@/components/audit/report/section-heading';
import {
  buildAnalyticsKpiTiles,
  buildConversionPeakCells,
  buildDetailTables,
  buildDevicesBarRows,
  buildEventsBarRows,
  buildLocationsBarRows,
  buildPagesBarRows,
  buildPathFunnelView,
  buildSearchBarRows,
  buildSourcesBarRows,
  hasAnyTrafficData,
} from '@/lib/audit/connected-analytics';
import {
  buildHeroDashboardFromConnected,
  buildKeywordsHeroDashboard,
} from '@/lib/audit/connected-hero-dashboard';
import { buildFunnelAssessment } from '@/lib/audit/funnel-assessment';
import { buildFunnelHealth } from '@/lib/audit/funnel-health';
import { buildJoinedTrafficStory } from '@/lib/audit/joined-traffic-story';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { LeadFunnelSummary } from '@/lib/supabase/types';

const HeroDemoDashboard = dynamic(
  () =>
    import('@/components/marketing/site-os/demo/hero-demo-dashboard').then(
      (mod) => mod.HeroDemoDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />
    ),
  }
);

function ChainKpiStrip({
  impressions,
  clicks,
  sessions,
  engaged,
  conversions,
  adsSpend,
}: {
  impressions: number;
  clicks: number;
  sessions: number;
  engaged: number;
  conversions: number;
  adsSpend: number | null;
}) {
  const cells = [
    { label: 'Impressions', value: impressions },
    { label: 'Clicks', value: clicks },
    { label: 'Sessions', value: sessions },
    { label: 'Engaged', value: engaged },
    { label: 'GA4 conversions', value: conversions },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-[14px] bg-white px-3 py-3"
        >
          <p className="text-[11px] tracking-wide text-zinc-400 uppercase">{cell.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">
            {cell.value.toLocaleString()}
          </p>
        </div>
      ))}
      <div className="rounded-[14px] bg-white px-3 py-3">
        <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Ads spend</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">
          {adsSpend != null && adsSpend > 0
            ? adsSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : '—'}
        </p>
      </div>
    </div>
  );
}

/**
 * Connected Dashboard — Website + GSC + GA4 + Ads on one chain.
 */
export function JoinedTrafficReport({
  projectId,
  connectedMetrics,
  leadSummary = null,
  domain,
  websiteConnected = false,
  websiteLabel = null,
}: {
  projectId: string;
  connectedMetrics: ConnectedAuditMetrics | null;
  leadSummary?: LeadFunnelSummary | null;
  domain?: string;
  websiteConnected?: boolean;
  websiteLabel?: string | null;
}) {
  const [secondaryTab, setSecondaryTab] = useState<'channels' | 'keywords'>('channels');
  const connectHref = `/audit/${projectId}/connect`;
  const leadsHref = `/audit/${projectId}/leads`;

  const story = useMemo(
    () => buildJoinedTrafficStory(connectedMetrics),
    [connectedMetrics]
  );
  const funnelAssessment = useMemo(
    () => buildFunnelAssessment(connectedMetrics),
    [connectedMetrics]
  );
  const funnelHealth = useMemo(
    () => buildFunnelHealth(connectedMetrics),
    [connectedMetrics]
  );
  const analyticsKpis = useMemo(
    () => buildAnalyticsKpiTiles(connectedMetrics),
    [connectedMetrics]
  );
  const detailTables = useMemo(() => buildDetailTables(connectedMetrics), [connectedMetrics]);
  const peakCells = useMemo(
    () => buildConversionPeakCells(connectedMetrics?.ga4ConversionPeak),
    [connectedMetrics]
  );
  const funnelSteps = useMemo(
    () => buildPathFunnelView(connectedMetrics?.ga4FunnelSteps),
    [connectedMetrics]
  );
  const dimensionCards = useMemo(
    () => [
      {
        title: 'Pages',
        kind: 'page' as const,
        rows: buildPagesBarRows(connectedMetrics),
        empty: 'No page traffic in this audit yet.',
      },
      {
        title: 'Sources',
        kind: 'source' as const,
        rows: buildSourcesBarRows(connectedMetrics),
        empty: 'No channel traffic in this audit yet.',
      },
      {
        title: 'Locations',
        kind: 'country' as const,
        rows: buildLocationsBarRows(connectedMetrics),
        empty: 'No country breakdown yet.',
      },
      {
        title: 'Devices',
        kind: 'device' as const,
        rows: buildDevicesBarRows(connectedMetrics),
        empty: 'No device breakdown yet.',
      },
      {
        title: 'Google Search',
        kind: 'search' as const,
        rows: buildSearchBarRows(connectedMetrics),
        empty: 'No Search Console queries yet.',
      },
      {
        title: 'Events',
        kind: 'event' as const,
        rows: buildEventsBarRows(connectedMetrics),
        empty: 'No event breakdown yet.',
      },
    ],
    [connectedMetrics]
  );

  const heroData = useMemo(
    () => buildHeroDashboardFromConnected(connectedMetrics, null),
    [connectedMetrics]
  );
  const keywordsData = useMemo(
    () => buildKeywordsHeroDashboard(connectedMetrics),
    [connectedMetrics]
  );
  const hasTraffic = hasAnyTrafficData(connectedMetrics);

  const sourceChips = useMemo(
    () =>
      buildDashboardSourceChips({
        websiteConnected:
          websiteConnected ||
          Boolean(domain) ||
          (connectedMetrics?.pageMetrics.some((p) => Boolean(p.title || p.h1)) ?? false),
        websiteLabel: websiteLabel ?? domain ?? null,
        gscConnected: Boolean(connectedMetrics?.gscConnected || story.status.hasGsc),
        gscLabel: connectedMetrics?.gscPropertyLabel ?? null,
        ga4Connected: Boolean(connectedMetrics?.ga4Connected || story.status.hasGa4),
        ga4Label: connectedMetrics?.ga4PropertyLabel ?? null,
        adsConnected: Boolean(connectedMetrics?.adsConnected || story.status.hasAds),
        adsLabel: connectedMetrics?.adsAccountLabel ?? null,
      }),
    [websiteConnected, websiteLabel, domain, connectedMetrics, story.status]
  );

  const impressions =
    connectedMetrics?.metrics?.total_impressions ??
    connectedMetrics?.pageMetrics.reduce((s, p) => s + (p.gsc_impressions || 0), 0) ??
    0;
  const engaged =
    connectedMetrics?.ga4Overview?.engagedSessions ??
    connectedMetrics?.pageMetrics.reduce((s, p) => s + (p.ga_engaged_sessions || 0), 0) ??
    0;
  const adsSpend =
    connectedMetrics?.googleAds && connectedMetrics.googleAds.spend > 0
      ? connectedMetrics.googleAds.spend
      : null;

  return (
    <div className="site-os-home site-os-home--flush -mx-8">
      <BrandSectionNav />

      <section className="block">
        <div className="mx-auto max-w-280 px-8 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {domain ? (
                <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {domain}
                </p>
              ) : null}
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Search shows what people wanted. Analytics shows what they did. Funnels show where
                they left.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <DashboardSourceStrip sources={sourceChips} connectHref={connectHref} />
          </div>
        </div>
      </section>

      <section id="overview" className="block scroll-mt-24">
        <div className="mx-auto max-w-280 space-y-4 px-8 pb-8">
          <SectionHeading
            title="Chain KPIs"
            lead="Query → click → landing → engagement → GA4 conversion (not CRM leads)"
          />
          <ChainKpiStrip
            impressions={impressions}
            clicks={story.status.searchClicks}
            sessions={story.status.sessions}
            engaged={engaged}
            conversions={story.status.conversions}
            adsSpend={adsSpend}
          />
          {story.status.breakCallout ? (
            <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              {story.status.breakCallout}
            </p>
          ) : null}
          {story.status.emptyReason ? (
            <BrandEmptyState
              title="No connected metrics yet"
              body={story.status.emptyReason}
              connectHref={connectHref}
            />
          ) : null}
        </div>
      </section>

      <section id="channels" className="block scroll-mt-24 pt-2">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading
            title="Channels"
            lead="Traffic → engagement → GA4 conversions by source"
          />
          {hasTraffic ? (
            <>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'channels' as const, label: 'Channels' },
                    { id: 'keywords' as const, label: 'Keywords' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSecondaryTab(tab.id)}
                    className={
                      secondaryTab === tab.id
                        ? 'rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-surface-3'
                        : 'rounded-lg  bg-surface-3 px-3 py-1.5 text-xs font-medium text-muted-foreground'
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <HeroDemoDashboard
                data={secondaryTab === 'keywords' ? keywordsData : heroData}
              />
              <ConnectedAnalyticsSuite
                kpis={analyticsKpis}
                dimensionCards={dimensionCards}
                detailTables={detailTables}
                peakCells={peakCells}
                funnelSteps={funnelSteps}
              />
            </>
          ) : (
            <BrandEmptyState
              title="No channel traffic yet"
              body="Connect Search Console and GA4, then re-run a full audit."
              connectHref={connectHref}
            />
          )}
        </div>
      </section>

      <section id="inventory" className="block scroll-mt-24 pt-2">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading
            title="Google inventory"
            lead="Key events, full event counts, campaigns, and Search Console country/device"
          />
          <GoogleDataInventory connected={connectedMetrics} />
        </div>
      </section>

      <section id="pages" className="block scroll-mt-24 pt-2">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading
            title="Pages"
            lead="Search Console + GA4 on the same path"
          />
          {(connectedMetrics?.pageMetrics.length ?? 0) > 0 ? (
            <JoinedPageStoryTable rows={story.pages} />
          ) : (
            <BrandEmptyState
              title="No page metrics yet"
              body="Run an audit with Website + Google sources."
              connectHref={connectHref}
            />
          )}
        </div>
      </section>

      <section id="search" className="block scroll-mt-24 pt-2">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading
            title="Queries"
            lead="Query → page → did that page convert?"
          />
          {(connectedMetrics?.queryMetrics.length ?? 0) > 0 || connectedMetrics?.gscConnected ? (
            <JoinedQueryBridges rows={story.queries} />
          ) : (
            <BrandEmptyState
              title="Search Console not connected"
              body="Connect Search Console to see query demand and click gaps."
              connectHref={connectHref}
            />
          )}
        </div>
      </section>

      <BrandAdsSection connected={connectedMetrics} connectHref={connectHref} />

      <section id="funnel" className="block scroll-mt-24 pt-2">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading
            title="Funnels"
            lead="GA4 visit → engaged → conversion — where people enter and drop"
          />
          {funnelAssessment.hasData ? (
            <>
              {funnelHealth ? <FunnelHealthStrip health={funnelHealth} /> : null}
              <DashboardFunnelViews
                assessment={funnelAssessment}
                pathSteps={funnelSteps}
              />
            </>
          ) : (
            <BrandEmptyState
              title="Funnel data not ready"
              body={funnelAssessment.emptyReason ?? 'Connect GA4 and re-run a full audit.'}
              connectHref={connectHref}
            />
          )}
        </div>
      </section>

      <section id="leads" className="block scroll-mt-24 pt-2">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading
            title="Leads"
            lead="Channel-wise lead gain, funnel stage, and status (CRM)"
          />
          {leadSummary ? (
            <DashboardLeadsBlock leadSummary={leadSummary} leadsHref={leadsHref} />
          ) : (
            <BrandEmptyState
              title="Lead reporting unavailable"
              body="Open Leads to add pipeline records and track stage and status."
              connectHref={leadsHref}
            />
          )}
        </div>
      </section>

      <section id="issues" className="block scroll-mt-24 pt-2 pb-10">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading title="Issues" lead="Chain breaks and paid mismatches" />
          <JoinedChainBreaks breaks={story.breaks} />
          {funnelAssessment.paidMismatches.length > 0 ? (
            <ul className="space-y-2">
              {funnelAssessment.paidMismatches.slice(0, 4).map((p) => (
                <li
                  key={p.channel}
                  className="rounded-[12px] bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium">{p.channel}</span>
                  <span className="text-zinc-500"> — {p.meaning}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
