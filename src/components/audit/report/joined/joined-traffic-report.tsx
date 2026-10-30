"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "@/components/audit/report/audit-report-tokens.css";
import {
  buildDashboardSourceChips,
  DashboardSourceStrip,
} from "@/components/audit/dashboard/dashboard-source-strip";
import { ChainKpis } from "@/components/audit/dashboard/chain-kpis";
import { DashboardFunnelViews } from "@/components/audit/dashboard/dashboard-funnel-views";
import { DashboardSection } from "@/components/audit/dashboard/dashboard-section";
import { DashboardSkeleton } from "@/components/audit/dashboard/dashboard-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InfoTip } from "@/components/audit/dashboard/info-tip";
import { PagesQueriesPanel } from "@/components/audit/dashboard/pages-queries-panel";
import { AnalyticsPathFunnel } from "@/components/audit/report/analytics/analytics-path-funnel";
import { ConnectedAnalyticsSuite } from "@/components/audit/report/analytics/connected-analytics-suite";
import { BrandAdsSection } from "@/components/audit/report/brand/brand-ads-section";
import { JoinedChainBreaks } from "@/components/audit/report/joined/joined-chain-breaks";
import { FunnelHealthStrip } from "@/components/audit/dashboard/funnel-health-strip";
import {
  BrandEmptyState,
  BrandSectionNav,
} from "@/components/audit/report/brand/brand-section-nav";
import {
  buildConversionPeakCells,
  buildDetailTables,
  buildPathFunnelView,
  hasAnyTrafficData,
} from "@/lib/audit/connected-analytics";
import { buildHeroDashboardFromConnected } from "@/lib/audit/connected-hero-dashboard";
import { buildFunnelAssessment } from "@/lib/audit/funnel-assessment";
import { buildFunnelHealth } from "@/lib/audit/funnel-health";
import { buildJoinedTrafficStory } from "@/lib/audit/joined-traffic-story";
import type { ConnectedAuditMetrics } from "@/lib/db/connected-metrics";

const HeroDemoDashboard = dynamic(
  () =>
    import("@/components/marketing/site-os/demo/hero-demo-dashboard").then(
      (mod) => mod.HeroDemoDashboard,
    ),
  { ssr: false, loading: () => <DashboardSkeleton blocks={2} /> },
);

/**
 * Connected Dashboard — Website + GSC + GA4 + Ads on one chain.
 */
export function JoinedTrafficReport({
  projectId,
  connectedMetrics,
  domain,
  websiteConnected = false,
  websiteLabel = null,
}: {
  projectId: string;
  connectedMetrics: ConnectedAuditMetrics | null;
  domain?: string;
  websiteConnected?: boolean;
  websiteLabel?: string | null;
}) {
  const connectHref = `/audit/${projectId}/connect`;

  const story = useMemo(
    () => buildJoinedTrafficStory(connectedMetrics),
    [connectedMetrics],
  );
  const funnelAssessment = useMemo(
    () => buildFunnelAssessment(connectedMetrics),
    [connectedMetrics],
  );
  const funnelHealth = useMemo(
    () => buildFunnelHealth(connectedMetrics),
    [connectedMetrics],
  );
  const detailTables = useMemo(
    () => buildDetailTables(connectedMetrics),
    [connectedMetrics],
  );
  const peakCells = useMemo(
    () => buildConversionPeakCells(connectedMetrics?.ga4ConversionPeak),
    [connectedMetrics],
  );
  const funnelSteps = useMemo(
    () => buildPathFunnelView(connectedMetrics?.ga4FunnelSteps),
    [connectedMetrics],
  );
  const heroData = useMemo(
    () => buildHeroDashboardFromConnected(connectedMetrics, null),
    [connectedMetrics],
  );
  const hasTraffic = hasAnyTrafficData(connectedMetrics);

  const sourceChips = useMemo(
    () =>
      buildDashboardSourceChips({
        websiteConnected:
          websiteConnected ||
          Boolean(domain) ||
          (connectedMetrics?.pageMetrics.some((p) =>
            Boolean(p.title || p.h1),
          ) ??
            false),
        websiteLabel: websiteLabel ?? domain ?? null,
        gscConnected: Boolean(
          connectedMetrics?.gscConnected || story.status.hasGsc,
        ),
        gscLabel: connectedMetrics?.gscPropertyLabel ?? null,
        ga4Connected: Boolean(
          connectedMetrics?.ga4Connected || story.status.hasGa4,
        ),
        ga4Label: connectedMetrics?.ga4PropertyLabel ?? null,
        adsConnected: Boolean(
          connectedMetrics?.adsConnected || story.status.hasAds,
        ),
        adsLabel: connectedMetrics?.adsAccountLabel ?? null,
      }),
    [websiteConnected, websiteLabel, domain, connectedMetrics, story.status],
  );

  const impressions =
    connectedMetrics?.metrics?.total_impressions ??
    connectedMetrics?.pageMetrics.reduce(
      (s, p) => s + (p.gsc_impressions || 0),
      0,
    ) ??
    0;
  const engaged =
    connectedMetrics?.ga4Overview?.engagedSessions ??
    connectedMetrics?.pageMetrics.reduce(
      (s, p) => s + (p.ga_engaged_sessions || 0),
      0,
    ) ??
    0;
  const adsSpend =
    connectedMetrics?.googleAds && connectedMetrics.googleAds.spend > 0
      ? connectedMetrics.googleAds.spend
      : null;

  return (
    <TooltipProvider delay={80} closeDelay={60}>
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
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search shows what people wanted. Analytics shows what they
                  did. Funnels show where they left.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <DashboardSourceStrip
                sources={sourceChips}
                connectHref={connectHref}
              />
            </div>
          </div>
        </section>

        <DashboardSection
          id="overview"
          title="Chain KPIs"
          lead="Query → click → landing → engagement → GA4 conversion"
          tip={{
            what: "The journey of a visitor in six numbers: seen in Google, clicked, visited, engaged, converted, and what ads cost.",
            why: "Read left to right. The step where the number shrinks the most is where you are losing people.",
          }}
        >
          <ChainKpis
            impressions={impressions}
            clicks={story.status.searchClicks}
            sessions={story.status.sessions}
            engaged={engaged}
            conversions={story.status.conversions}
            adsSpend={adsSpend}
          />
          {story.status.breakCallout ? (
            <p className="rounded-lg bg-tint px-3 py-2 text-sm text-foreground/80">
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
        </DashboardSection>

        <DashboardSection
          id="channels"
          title="Traffic over time"
          lead="Pick a metric, then hover or click a day to see its value"
          tip={{
            what: "Each tile is a metric; select one to chart its daily values. The % on a tile compares this period with the one before.",
            why: "Spot spikes and dips, then match them to what you changed (a post, a campaign, a fix).",
          }}
        >
          {hasTraffic ? (
            <>
              <HeroDemoDashboard
                data={heroData}
                variant="landing"
                showBreakdowns={false}
                chartHint={
                  <InfoTip
                    what="Daily values for the selected metric. Click a bar to pin it."
                    why="Dates are shown as Month Day (e.g. Mar 5) so they read the same in every country."
                  />
                }
              />
              <ConnectedAnalyticsSuite
                detailTables={detailTables}
                peakCells={peakCells}
              />
            </>
          ) : (
            <BrandEmptyState
              title="No channel traffic yet"
              body="Connect Search Console and GA4, then re-run a full audit."
              connectHref={connectHref}
            />
          )}
        </DashboardSection>

        <DashboardSection
          id="pages"
          title="Pages & queries"
          lead="What people searched, which page they landed on, and whether it converted"
          tip={{
            what: "Impr. = times shown in Google. Clicks = visits from Google. CTR = clicks ÷ impressions. Pos. = average Google ranking (1 is the top). Sessions / Engaged / Conv. come from GA4.",
            why: "The Tag tells you the weak link for each row: not found, not clicked, bounced, or not converting.",
          }}
        >
          <PagesQueriesPanel
            story={story}
            hasPages={(connectedMetrics?.pageMetrics.length ?? 0) > 0}
            hasQueries={
              (connectedMetrics?.queryMetrics.length ?? 0) > 0 ||
              Boolean(connectedMetrics?.gscConnected)
            }
          />
        </DashboardSection>

        <BrandAdsSection
          connected={connectedMetrics}
          connectHref={connectHref}
        />

        <DashboardSection
          id="funnel"
          title="Funnels"
          lead="Where visitors stop on the way to converting"
          tip={{
            what: "A funnel is a series of steps toward a goal. Each step has fewer people than the one before; the gap between steps is who you lost.",
            why: "It points to the single biggest leak, so you fix one thing instead of guessing.",
          }}
        >
          {funnelAssessment.hasData ? (
            <>
              <DashboardFunnelViews assessment={funnelAssessment} />
              <AnalyticsPathFunnel steps={funnelSteps} />
              {funnelHealth ? (
                <FunnelHealthStrip
                  health={funnelHealth}
                  daily={connectedMetrics?.ga4Daily ?? []}
                />
              ) : null}
            </>
          ) : (
            <BrandEmptyState
              title="Funnel data not ready"
              body={
                funnelAssessment.emptyReason ??
                "Connect GA4 and re-run a full audit."
              }
              connectHref={connectHref}
            />
          )}
        </DashboardSection>

        <DashboardSection
          id="issues"
          title="Issues"
          lead="Chain breaks and paid mismatches"
          tip={{
            what: "Places where the chain from search to conversion is broken, e.g. clicks that never become sessions.",
            why: "Each issue is a concrete thing to fix, ordered by impact.",
          }}
        >
          <JoinedChainBreaks breaks={story.breaks} />
          {funnelAssessment.paidMismatches.length > 0 ? (
            <ul className="space-y-2">
              {funnelAssessment.paidMismatches.slice(0, 4).map((p) => (
                <li
                  key={p.channel}
                  className="rounded-lg bg-raised px-3 py-2 text-sm"
                >
                  <span className="font-medium">{p.channel}</span>
                  <span className="text-muted-foreground"> — {p.meaning}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </DashboardSection>
      </div>
    </TooltipProvider>
  );
}
