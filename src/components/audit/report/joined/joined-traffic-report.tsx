'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import '@/components/marketing/site-os/site-os-home.css';
import { JoinedChainBreaks } from '@/components/audit/report/joined/joined-chain-breaks';
import { JoinedPageStoryTable } from '@/components/audit/report/joined/joined-page-story-table';
import { JoinedQueryBridges } from '@/components/audit/report/joined/joined-query-bridges';
import { JoinedRawGoogleDisclosure } from '@/components/audit/report/joined/joined-raw-google-disclosure';
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
} from '@/lib/audit/connected-analytics';
import { buildJoinedTrafficStory } from '@/lib/audit/joined-traffic-story';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';

/**
 * Joined Search → Visit → Outcome surface (workspace Journey tab).
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
  const story = useMemo(
    () => buildJoinedTrafficStory(connectedMetrics),
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

  return (
    <div className="site-os-home -mx-8">
      <section className="block">
        <div className="mx-auto max-w-280 px-8 py-12">
          <div className="mx-auto max-w-3xl text-center text-balance">
            {domain ? (
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {domain}
              </p>
            ) : null}
            <h1 className="mt-2 block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9">
              Search → visit → outcome
            </h1>
            <p className="mt-1.5 block text-muted-foreground">
              Search Console and GA4 joined on the same pages — the connection Google’s tools don’t
              show together. Brand crawl evidence stays on{' '}
              <Link
                href={`/audit/${projectId}`}
                className="font-medium text-foreground underline underline-offset-2"
              >
                Evidence
              </Link>
              .
            </p>
          </div>
          <div className="mt-10">
            <JoinedStatusBanner
              status={story.status}
              connectHref={`/audit/${projectId}/connect`}
            />
          </div>
        </div>
      </section>

      <section className="block pt-4">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="Page stories"
            lead="Search demand and on-site outcome on the same path — what Google’s tools don’t show together."
          />
          <JoinedPageStoryTable rows={story.pages} />
        </div>
      </section>

      <section className="block pt-4">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="Query → page bridges"
            lead="What people type, where they land, and whether that path shows visits or conversions."
          />
          <JoinedQueryBridges rows={story.queries} />
        </div>
      </section>

      <section className="block pt-4">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="Where the chain breaks"
            lead="Factual observations from joined search and traffic — not scores or recommendations."
          />
          <JoinedChainBreaks breaks={story.breaks} />
        </div>
      </section>

      <section className="block pt-4 pb-8">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="How Google saw it"
            lead="Optional raw GA4 and Search Console dimensions — same silos you’d see in Google’s tools."
          />
          <JoinedRawGoogleDisclosure
            kpis={analyticsKpis}
            dimensionCards={dimensionCards}
            detailTables={detailTables}
            peakCells={peakCells}
            funnelSteps={funnelSteps}
          />
        </div>
      </section>
    </div>
  );
}
