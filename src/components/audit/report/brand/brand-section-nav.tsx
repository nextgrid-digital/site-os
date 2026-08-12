'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  PreviewRail,
  type PreviewRailItem,
} from '@/components/motion/preview-rail';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { FunnelAssessment } from '@/lib/audit/funnel-assessment';
import type { JoinedTrafficStory } from '@/lib/audit/joined-traffic-story';
import { cn } from '@/lib/utils';

const DASHBOARD_RAIL_ITEMS: PreviewRailItem[] = [
  {
    id: 'overview',
    label: 'KPIs',
    description: 'Impressions → clicks → sessions → GA4 conversions.',
    href: '#overview',
  },
  {
    id: 'channels',
    label: 'Channels',
    description: 'Traffic quality and GA4 conversions by source.',
    href: '#channels',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Key events, event counts, campaigns, GSC country/device.',
    href: '#inventory',
  },
  {
    id: 'pages',
    label: 'Pages',
    description: 'GSC + GA4 on the same path.',
    href: '#pages',
  },
  {
    id: 'search',
    label: 'Queries',
    description: 'Query → page → did it convert?',
    href: '#search',
  },
  {
    id: 'ads',
    label: 'Ads',
    description: 'Paid entry and waste on the same funnel.',
    href: '#ads',
  },
  {
    id: 'funnel',
    label: 'Funnels',
    description: 'GA4 visit → engaged → conversion drops.',
    href: '#funnel',
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'CRM lead gain by channel, stage, and status.',
    href: '#leads',
  },
  {
    id: 'issues',
    label: 'Issues',
    description: 'Chain breaks and paid mismatches.',
    href: '#issues',
  },
];

const VALID_IDS = new Set(DASHBOARD_RAIL_ITEMS.map((item) => item.id));

export function BrandSectionNav() {
  const [activeId, setActiveId] = useState('overview');

  useEffect(() => {
    function syncFromHash() {
      const id = window.location.hash.replace(/^#/, '');
      if (VALID_IDS.has(id)) setActiveId(id);
    }
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    const elements = DASHBOARD_RAIL_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id;
        if (id && VALID_IDS.has(id)) setActiveId(id);
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Mobile: compact horizontal pills inside content */}
      <nav
        aria-label="Dashboard sections"
        className="sticky top-0 z-10 -mx-2 mb-6 overflow-x-auto bg-white/90 px-2 py-2 backdrop-blur xl:hidden"
      >
        <ul className="flex min-w-max gap-1 rounded-xl bg-zinc-50 p-1">
          {DASHBOARD_RAIL_ITEMS.map((section) => {
            const active = activeId === section.id;
            return (
              <li key={section.id}>
                <a
                  href={section.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap',
                    active
                      ? 'bg-white text-zinc-950'
                      : 'text-zinc-600 hover:bg-white hover:text-zinc-950'
                  )}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop: fixed just outside the centered max-w-280 column */}
      <aside
        className="pointer-events-none fixed top-1/2 z-40 hidden -translate-y-1/2 xl:block"
        style={{ left: 'max(0.75rem, calc(50vw - 35rem - 3.5rem))' }}
      >
        <div className="pointer-events-auto">
          <PreviewRail
            items={DASHBOARD_RAIL_ITEMS}
            orientation="vertical"
            previewSide="after"
            activeId={activeId}
            defaultActiveId="overview"
            highlightActive
            label="Dashboard sections"
            className="h-[360px] w-72 min-h-0 justify-start"
            onActiveChange={setActiveId}
            onItemSelect={(item) => {
              setActiveId(item.id);
            }}
          />
        </div>
      </aside>
    </>
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
    <div className="rounded-[14px] bg-white px-4 py-5 text-center">
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">{body}</p>
      {connectHref ? (
        <p className="mt-2">
          <Link
            href={connectHref}
            className="text-sm font-medium text-zinc-900 underline underline-offset-2"
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
