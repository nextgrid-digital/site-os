'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import '@/components/audit/report/audit-report-tokens.css';
import { ConnectedAnalyticsSuite } from '@/components/audit/report/analytics/connected-analytics-suite';
import { BrandAdsSection } from '@/components/audit/report/brand/brand-ads-section';
import {
  BrandEmptyState,
  BrandSectionNav,
  buildBrandOverviewLines,
} from '@/components/audit/report/brand/brand-section-nav';
import { FunnelAssessmentBrief } from '@/components/audit/report/funnel/funnel-assessment-brief';
import { JoinedChainBreaks } from '@/components/audit/report/joined/joined-chain-breaks';
import { JoinedPageStoryTable } from '@/components/audit/report/joined/joined-page-story-table';
import { JoinedQueryBridges } from '@/components/audit/report/joined/joined-query-bridges';
import { JoinedStatusBanner } from '@/components/audit/report/joined/joined-status-banner';
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
import { buildJoinedTrafficStory } from '@/lib/audit/joined-traffic-story';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';

const HeroDemoDashboard = dynamic(
  () =>
    import('@/components/marketing/site-os/demo/hero-demo-dashboard').then(
      (mod) => mod.HeroDemoDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" aria-hidden />
    ),
  }
);

/**
 * Unified Brand dashboard (workspace Brand tab) — one connected view across sources.
 */
export function JoinedTrafficReport({
  projectId,
  connectedMetrics,
  domain,
}: {
  projectId: string;
  connectedMetrics: ConnectedAuditMetrics | null;
  domain?: string;
}) {
  const [secondaryTab, setSecondaryTab] = useState<'channels' | 'keywords'>('channels');
  const connectHref = `/audit/${projectId}/connect`;

  const story = useMemo(
    () => buildJoinedTrafficStory(connectedMetrics),
    [connectedMetrics]
  );
  const funnelAssessment = useMemo(
    () => buildFunnelAssessment(connectedMetrics),
    [connectedMetrics]
  );
  const overview = useMemo(
    () => buildBrandOverviewLines(connectedMetrics, story, funnelAssessment),
    [connectedMetrics, story, funnelAssessment]
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
        empty: 'No country breakdown yet. Re-run full audit with GA4.',
      },
      {
        title: 'Devices',
        kind: 'device' as const,
        rows: buildDevicesBarRows(connectedMetrics),
        empty: 'No device breakdown yet. Re-run full audit with GA4.',
      },
      {
        title: 'Google Search',
        kind: 'search' as const,
        rows: buildSearchBarRows(connectedMetrics),
        empty: 'No Search Console queries in this audit yet.',
      },
      {
        title: 'Events',
        kind: 'event' as const,
        rows: buildEventsBarRows(connectedMetrics),
        empty: 'No event breakdown yet. Re-run full audit with GA4.',
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

  const nextSteps = useMemo(() => {
    const items: { title: string; detail: string }[] = [];
    for (const b of funnelAssessment.bottlenecks.slice(0, 3)) {
      items.push({ title: b.title, detail: b.fixFirst });
    }
    for (const w of connectedMetrics?.googleAds?.wasteSignals.slice(0, 2) ?? []) {
      items.push({ title: `Ads waste: ${w.label}`, detail: w.meaning });
    }
    for (const br of story.breaks.slice(0, 2)) {
      items.push({ title: br.title, detail: br.statement });
    }
    return items.slice(0, 6);
  }, [funnelAssessment.bottlenecks, connectedMetrics?.googleAds?.wasteSignals, story.breaks]);

  return (
    <div className="site-os-home site-os-home--flush -mx-8">
      <section className="block">
        <div className="mx-auto max-w-280 px-8 py-12">
          <div className="mx-auto max-w-3xl text-center text-balance">
            {domain ? (
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {domain}
              </p>
            ) : null}
            <h1 className="mt-2 block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9">
              Brand performance
            </h1>
            <p className="mt-1.5 block text-muted-foreground">
              One view of what the brand says, what people find, what they click, and what converts.
              Crawl evidence stays on{' '}
              <Link
                href={`/audit/${projectId}`}
                className="font-medium text-foreground underline underline-offset-2"
              >
                Evidence
              </Link>
              .
            </p>
          </div>
          <div className="mt-8">
            <BrandSectionNav />
          </div>
          <div className="mt-4">
            <JoinedStatusBanner
              status={story.status}
              connectHref={connectHref}
            />
          </div>
        </div>
      </section>

      <section id="overview" className="block scroll-mt-24 pt-2">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-10">
          <SectionHeading
            title="Overview"
            lead="What the brand says, what people find, what they click, and what converts."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'What the brand says', text: overview.says },
              { label: 'What people find', text: overview.finds },
              { label: 'What people click', text: overview.clicks },
              { label: 'What converts', text: overview.converts },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-[14px] border border-zinc-200 bg-white p-4"
              >
                <p className="text-[11px] tracking-wide text-zinc-400 uppercase">{card.label}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-800">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="channels" className="block scroll-mt-24 pt-4">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-12">
          <SectionHeading
            title="Channels"
            lead="How each source contributes to sessions and outcomes."
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
                        : 'rounded-lg border border-surface bg-surface-3 px-3 py-1.5 text-xs font-medium text-muted-foreground'
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
              body="Connect Search Console and GA4, then re-run a full audit to see how each channel contributes."
              connectHref={connectHref}
            />
          )}
        </div>
      </section>

      <section id="pages" className="block scroll-mt-24 pt-4">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="Pages"
            lead="Search Console and GA4 columns on the same path, plus crawl fields."
          />
          {(connectedMetrics?.pageMetrics.length ?? 0) > 0 ? (
            <JoinedPageStoryTable rows={story.pages} />
          ) : (
            <BrandEmptyState
              title="No page metrics yet"
              body="Run an audit with a website URL (and optional Google sources) to join crawl, search, and traffic on each path."
              connectHref={connectHref}
            />
          )}
        </div>
      </section>

      <section id="search" className="block scroll-mt-24 pt-4">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="Search"
            lead="Queries, landing paths, clicks, impressions, sessions, and conversions."
          />
          {(connectedMetrics?.queryMetrics.length ?? 0) > 0 || connectedMetrics?.gscConnected ? (
            <JoinedQueryBridges rows={story.queries} />
          ) : (
            <BrandEmptyState
              title="Search Console not connected"
              body="Connect Search Console to see queries, impressions, CTR, position, and pages with demand but weak clicks."
              connectHref={connectHref}
            />
          )}
        </div>
      </section>

      <BrandAdsSection connected={connectedMetrics} connectHref={connectHref} />

      <section id="social" className="block scroll-mt-24 pt-4">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-12">
          <SectionHeading
            title="Social"
            lead="Brand presence on Instagram and X — Phase 2."
          />
          <BrandEmptyState
            title="Social connectors coming later"
            body="Instagram and X will show profile clarity, content themes, link behavior, and consistency with website messaging. Until then, social may appear only as GA4 channel traffic above."
          />
        </div>
      </section>

      <div id="funnel" className="scroll-mt-24">
        <FunnelAssessmentBrief
          assessment={funnelAssessment}
          connectHref={connectHref}
        />
      </div>

      <section id="issues" className="block scroll-mt-24 pt-4">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="Issues"
            lead="Chain breaks and funnel leaks that block lead generation."
          />
          <JoinedChainBreaks breaks={story.breaks} />
          {funnelAssessment.paidMismatches.length > 0 ? (
            <ul className="space-y-2">
              {funnelAssessment.paidMismatches.slice(0, 4).map((p) => (
                <li
                  key={p.channel}
                  className="rounded-[12px] border border-zinc-200 bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium">{p.channel}</span>
                  <span className="text-zinc-500"> — {p.meaning}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section id="next-steps" className="block scroll-mt-24 pt-4 pb-8">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-12">
          <SectionHeading
            title="Next steps"
            lead="What to fix first across connected sources."
          />
          {nextSteps.length > 0 ? (
            <ol className="space-y-3">
              {nextSteps.map((step, index) => (
                <li
                  key={`${step.title}-${index}`}
                  className="rounded-[14px] border border-zinc-200 bg-white px-4 py-3"
                >
                  <p className="text-sm font-semibold text-zinc-950">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{step.detail}</p>
                </li>
              ))}
            </ol>
          ) : (
            <BrandEmptyState
              title="No prioritized fixes yet"
              body="Connect sources and re-run a full audit to surface funnel leaks, chain breaks, and Ads waste."
              connectHref={connectHref}
            />
          )}
        </div>
      </section>
    </div>
  );
}
