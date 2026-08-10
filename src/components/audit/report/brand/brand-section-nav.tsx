'use client';

import Link from 'next/link';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { FunnelAssessment } from '@/lib/audit/funnel-assessment';
import type { JoinedTrafficStory } from '@/lib/audit/joined-traffic-story';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'channels', label: 'Channels' },
  { id: 'pages', label: 'Pages' },
  { id: 'search', label: 'Search' },
  { id: 'ads', label: 'Ads' },
  { id: 'social', label: 'Social' },
  { id: 'funnel', label: 'Funnel' },
  { id: 'issues', label: 'Issues' },
  { id: 'next-steps', label: 'Next steps' },
] as const;

export function BrandSectionNav() {
  return (
    <nav
      aria-label="Brand report sections"
      className="sticky top-0 z-10 -mx-2 mb-8 overflow-x-auto bg-white/90 px-2 py-2 backdrop-blur"
    >
      <ul className="flex min-w-max gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 whitespace-nowrap hover:bg-white hover:text-zinc-950"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
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
    <div className="rounded-[14px] border border-dashed border-zinc-300 bg-white p-6 text-center">
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{body}</p>
      {connectHref ? (
        <p className="mt-3">
          <Link
            href={connectHref}
            className="text-sm font-medium text-zinc-900 underline underline-offset-2"
          >
            Open Connect
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
