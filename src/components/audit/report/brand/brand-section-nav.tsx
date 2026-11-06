'use client';

import Link from 'next/link';
import { PreviewRail } from '@/components/motion/preview-rail';
import { DASHBOARD_RAIL_ITEMS, useDashboardSectionSpy, useIsDesktopNav } from './use-dashboard-section-spy';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { FunnelAssessment } from '@/lib/audit/funnel-assessment';
import type { JoinedTrafficStory } from '@/lib/audit/joined-traffic-story';

export function BrandSectionNav() {
  const desktop = useIsDesktopNav();
  const { activeId, selectSection } = useDashboardSectionSpy(desktop);

  if (!desktop) return null;

  // Desktop only: fixed just outside the centered max-w-280 column. Small screens use DashboardMobileTabs.
  return (
    <aside
      className="pointer-events-none fixed top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      style={{ left: 'max(0.75rem, calc(50vw - 35rem - 3.5rem))' }}
    >
      <div className="pointer-events-none [&_nav]:pointer-events-auto">
        <PreviewRail
          items={DASHBOARD_RAIL_ITEMS}
          orientation="vertical"
          previewSide="after"
          activeId={activeId}
          defaultActiveId="overview"
          highlightActive
          label="Dashboard sections"
          className="h-[360px] w-72 min-h-0 justify-start"
          onItemSelect={(item) => selectSection(item.id, false)}
        />
      </div>
    </aside>
  );
}

export function BrandEmptyState({
  title,
  body,
  connectHref,
}: {
  title: string;
  body: string;
  connectHref?: string;
}) {
  return (
    <div className="rounded-xl bg-raised px-4 py-5 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {connectHref ? (
        <p className="mt-2">
          <Link
            href={connectHref}
            className="text-sm font-medium text-foreground underline underline-offset-2"
          >
            Open Setup
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export function buildBrandOverviewLines(
  connected: ConnectedAuditMetrics | null,
  story: JoinedTrafficStory,
  funnel: FunnelAssessment
) {
  const says = connected?.pageMetrics?.[0]?.title
    ? `Top crawled page title: “${connected.pageMetrics[0].title}”.`
    : 'Website crawl shows what the brand says on-site.';
  const finds =
    (connected?.queryMetrics?.length ?? 0) > 0
      ? `People find you via ${connected!.queryMetrics.length} Search Console queries in this window.`
      : 'Connect Search Console to see what people find.';
  const clicks =
    (connected?.metrics?.total_clicks ?? 0) > 0 || (connected?.metrics?.total_sessions ?? 0) > 0
      ? `${(connected?.metrics?.total_clicks ?? 0).toLocaleString()} search clicks and ${(connected?.metrics?.total_sessions ?? 0).toLocaleString()} sessions.`
      : 'Connect GA4 / Search Console to see what people click.';
  const converts =
    (connected?.metrics?.total_conversions ?? 0) > 0
      ? `${connected!.metrics!.total_conversions.toLocaleString()} conversions in this audit.`
      : funnel.hasFunnelProblem
        ? 'Conversion is weak relative to traffic — see Funnel.'
        : 'Conversion signals appear once GA4 (and Ads) are connected.';

  return { says, finds, clicks, converts, chainBreaks: story.breaks.length };
}
