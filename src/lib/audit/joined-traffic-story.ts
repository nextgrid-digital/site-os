import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { PageMetric, QueryMetric } from '@/lib/supabase/types';

export type JoinedSourceTag = 'GSC' | 'GA4' | 'Crawl';

export type JoinedStatus = {
  headline: string;
  breakCallout: string | null;
  searchClicks: number;
  sessions: number;
  conversions: number;
  hasGsc: boolean;
  hasGa4: boolean;
  hasAds: boolean;
  emptyReason: string | null;
};

export type JoinedPageStoryRow = {
  path: string;
  searchClicks: number;
  impressions: number;
  ctr: number;
  position: number;
  sessions: number;
  conversions: number;
  note: string;
  sources: JoinedSourceTag[];
};

export type JoinedQueryBridge = {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  pagePath: string | null;
  sessions: number | null;
  conversions: number | null;
  note: string;
  sources: JoinedSourceTag[];
};

export type JoinedChainBreak = {
  id: string;
  title: string;
  statement: string;
  sources: JoinedSourceTag[];
};

export type JoinedTrafficStory = {
  status: JoinedStatus;
  pages: JoinedPageStoryRow[];
  queries: JoinedQueryBridge[];
  breaks: JoinedChainBreak[];
};

function fmt(n: number, digits = 0) {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function pct(rate: number) {
  const value = rate <= 1 ? rate * 100 : rate;
  return `${value.toFixed(1)}%`;
}

function normalizePath(path: string | null | undefined) {
  if (!path) return '/';
  const trimmed = path.trim() || '/';
  if (trimmed === '/') return '/';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) || '/' : trimmed;
}

function pageNote(p: {
  impressions: number;
  clicks: number;
  ctr: number;
  sessions: number;
  conversions: number;
}): string {
  const hasSearch = p.impressions > 0 || p.clicks > 0;
  const hasTraffic = p.sessions > 0;
  const hasOutcome = p.conversions > 0;

  if (p.impressions >= 50 && p.ctr > 0 && p.ctr < 0.02) {
    return 'Visible in search, few clicks';
  }
  if (p.clicks >= 5 && p.sessions === 0) {
    return 'Clicks don’t become visits (tracking or landing mismatch)';
  }
  if (p.clicks >= 10 && p.sessions > 0 && p.sessions < p.clicks * 0.4) {
    return 'Clicks don’t become visits (tracking or landing mismatch)';
  }
  if (hasTraffic && !hasOutcome && p.sessions >= 10) {
    return 'Traffic without measured outcome';
  }
  if (hasOutcome && (!hasSearch || p.clicks < 3) && p.conversions >= 1) {
    return 'Outcomes mostly not from organic search';
  }
  if (hasSearch && p.ctr >= 0.03 && hasOutcome) {
    return 'Search demand lands and converts';
  }
  if (hasSearch && hasTraffic && hasOutcome) {
    return 'Search demand lands and converts';
  }
  if (hasSearch && hasTraffic) {
    return 'Search traffic arrives; outcome not measured here';
  }
  if (hasTraffic && !hasSearch) {
    return 'Visits without Search Console demand on this path';
  }
  if (hasSearch && !hasTraffic) {
    return 'Search demand recorded; no GA4 sessions on this path';
  }
  return 'Limited joined signal on this path';
}

function queryNote(
  q: QueryMetric,
  page: { sessions: number; conversions: number } | null
): string {
  if (q.impressions >= 50 && q.ctr < 0.02) {
    return 'Query is visible but rarely clicked';
  }
  if (q.clicks >= 5 && page && page.sessions === 0) {
    return 'Clicks this query, but no sessions on the landing path';
  }
  if (q.clicks >= 3 && page && page.conversions > 0) {
    return 'Query demand reaches a converting page';
  }
  if (q.clicks >= 3 && page && page.sessions > 0 && page.conversions === 0) {
    return 'Query brings visits without measured conversions';
  }
  if (!q.page_path) {
    return 'Search demand without a joined landing page';
  }
  return 'Search demand linked to a landing path';
}

function biggestBreak(input: {
  clicks: number;
  sessions: number;
  conversions: number;
  avgCtr: number;
  impressions: number;
}): string | null {
  const { clicks, sessions, conversions, avgCtr, impressions } = input;
  if (impressions >= 100 && avgCtr > 0 && avgCtr < 0.02) {
    return 'Biggest break: search visibility isn’t turning into clicks.';
  }
  if (clicks >= 20 && sessions < clicks * 0.4) {
    return 'Biggest break: search clicks aren’t becoming site visits.';
  }
  if (sessions >= 50 && conversions === 0) {
    return 'Biggest break: visits arrive without measured conversions.';
  }
  if (conversions >= 5 && clicks < 5) {
    return 'Biggest break: outcomes are happening mostly outside organic search.';
  }
  if (clicks > 0 && sessions > 0 && conversions > 0) {
    return 'Chain is connected: search clicks → visits → conversions.';
  }
  return null;
}

/**
 * Join GSC + GA4 into plain-language Search → Visit → Outcome stories.
 */
export function buildJoinedTrafficStory(
  connected: ConnectedAuditMetrics | null
): JoinedTrafficStory {
  const empty: JoinedTrafficStory = {
    status: {
      headline: 'Connect Search Console and GA4, then re-run a full audit to see the search→visit→outcome chain.',
      breakCallout: null,
      searchClicks: 0,
      sessions: 0,
      conversions: 0,
      hasGsc: false,
      hasGa4: false,
      hasAds: false,
      emptyReason: 'No connected Google metrics stored for this audit yet.',
    },
    pages: [],
    queries: [],
    breaks: [],
  };

  if (!connected) return empty;

  const pages = connected.pageMetrics ?? [];
  const queries = connected.queryMetrics ?? [];
  const overview = connected.ga4Overview;
  const metrics = connected.metrics;

  const searchClicks =
    metrics?.total_clicks ?? pages.reduce((s, p) => s + (p.gsc_clicks || 0), 0);
  const impressions =
    metrics?.total_impressions ?? pages.reduce((s, p) => s + (p.gsc_impressions || 0), 0);
  const sessions =
    overview?.sessions ??
    metrics?.total_sessions ??
    pages.reduce((s, p) => s + (p.ga_sessions || 0), 0);
  const conversions =
    overview?.conversions ??
    metrics?.total_conversions ??
    pages.reduce((s, p) => s + (p.ga_conversions || 0), 0);
  const avgCtr =
    metrics?.avg_ctr ?? (impressions > 0 ? searchClicks / impressions : 0);

  const hasGsc =
    connected.gscConnected ||
    searchClicks > 0 ||
    impressions > 0 ||
    queries.length > 0 ||
    pages.some((p) => p.gsc_impressions > 0 || p.gsc_clicks > 0);
  const hasGa4 =
    connected.ga4Connected ||
    sessions > 0 ||
    conversions > 0 ||
    pages.some((p) => p.ga_sessions > 0 || p.ga_conversions > 0);
  const hasAds =
    connected.adsConnected ||
    Boolean(connected.googleAds && (connected.googleAds.spend > 0 || connected.googleAds.campaigns.length > 0));

  if (!hasGsc && !hasGa4 && !hasAds) {
    return {
      ...empty,
      status: {
        ...empty.status,
        hasGsc: connected.gscConnected,
        hasGa4: connected.ga4Connected,
        hasAds: connected.adsConnected,
        emptyReason: connected.googleConnected
          ? 'Properties are selected, but this audit stored no Google rows. Reconnect and re-run a full audit.'
          : empty.status.emptyReason,
      },
    };
  }

  const pageByPath = new Map<string, PageMetric>();
  for (const p of pages) {
    pageByPath.set(normalizePath(p.path), p);
  }

  const pageRows: JoinedPageStoryRow[] = pages
    .filter(
      (p) =>
        p.gsc_clicks > 0 ||
        p.gsc_impressions > 0 ||
        p.ga_sessions > 0 ||
        p.ga_conversions > 0
    )
    .toSorted((a, b) => {
      const aScore = a.gsc_clicks * 3 + a.ga_sessions + a.ga_conversions * 5;
      const bScore = b.gsc_clicks * 3 + b.ga_sessions + b.ga_conversions * 5;
      return bScore - aScore;
    })
    .slice(0, 20)
    .map((p) => {
      const sources: JoinedSourceTag[] = [];
      if (p.gsc_clicks > 0 || p.gsc_impressions > 0) sources.push('GSC');
      if (p.ga_sessions > 0 || p.ga_conversions > 0) sources.push('GA4');
      return {
        path: p.path || '/',
        searchClicks: p.gsc_clicks,
        impressions: p.gsc_impressions,
        ctr: p.gsc_ctr,
        position: p.gsc_position,
        sessions: p.ga_sessions,
        conversions: p.ga_conversions,
        note: pageNote({
          impressions: p.gsc_impressions,
          clicks: p.gsc_clicks,
          ctr: p.gsc_ctr,
          sessions: p.ga_sessions,
          conversions: p.ga_conversions,
        }),
        sources,
      };
    });

  const queryRows: JoinedQueryBridge[] = [...queries]
    .filter((q) => q.impressions > 0 || q.clicks > 0)
    .toSorted((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, 15)
    .map((q) => {
      const path = q.page_path ? normalizePath(q.page_path) : null;
      const page = path ? pageByPath.get(path) ?? null : null;
      const sources: JoinedSourceTag[] = ['GSC'];
      if (page && (page.ga_sessions > 0 || page.ga_conversions > 0)) sources.push('GA4');
      return {
        query: q.query,
        impressions: q.impressions,
        clicks: q.clicks,
        ctr: q.ctr,
        position: q.position,
        pagePath: q.page_path,
        sessions: page ? page.ga_sessions : null,
        conversions: page ? page.ga_conversions : null,
        note: queryNote(
          q,
          page ? { sessions: page.ga_sessions, conversions: page.ga_conversions } : null
        ),
        sources,
      };
    });

  const breaks: JoinedChainBreak[] = [];

  const lowCtrPages = pageRows.filter((p) => p.impressions >= 50 && p.ctr > 0 && p.ctr < 0.02);
  if (lowCtrPages.length) {
    const top = lowCtrPages[0]!;
    breaks.push({
      id: 'demand-without-clicks',
      title: 'Demand without clicks',
      statement: `${top.path} had ${fmt(top.impressions)} impressions at ${pct(top.ctr)} CTR — visible in search, few clicks.`,
      sources: ['GSC'],
    });
  }

  const clickNoVisit = pageRows.filter(
    (p) => p.searchClicks >= 5 && (p.sessions === 0 || p.sessions < p.searchClicks * 0.4)
  );
  if (clickNoVisit.length) {
    const top = clickNoVisit[0]!;
    breaks.push({
      id: 'clicks-without-sessions',
      title: 'Clicks without sessions',
      statement: `${top.path} recorded ${fmt(top.searchClicks)} search clicks but only ${fmt(top.sessions)} sessions — clicks may not be becoming visits.`,
      sources: ['GSC', 'GA4'],
    });
  }

  const trafficNoOutcome = pageRows.filter((p) => p.sessions >= 10 && p.conversions === 0);
  if (trafficNoOutcome.length) {
    const top = trafficNoOutcome[0]!;
    breaks.push({
      id: 'sessions-without-conversions',
      title: 'Sessions without conversions',
      statement: `${top.path} had ${fmt(top.sessions)} sessions and 0 measured conversions in this audit window.`,
      sources: ['GA4'],
    });
  }

  const outcomeWeakSearch = pageRows.filter(
    (p) => p.conversions >= 1 && p.searchClicks < 3 && p.impressions < 50
  );
  if (outcomeWeakSearch.length) {
    const top = outcomeWeakSearch[0]!;
    breaks.push({
      id: 'conversions-without-search',
      title: 'Converting pages with little search demand',
      statement: `${top.path} drove ${fmt(top.conversions)} conversions with only ${fmt(top.searchClicks)} search clicks — outcomes mostly outside organic search on this path.`,
      sources: ['GA4', 'GSC'],
    });
  }

  const demandQueries = queryRows.filter((q) => q.impressions >= 50 && q.ctr < 0.02);
  if (demandQueries.length && breaks.length < 7) {
    const top = demandQueries[0]!;
    breaks.push({
      id: 'query-demand-without-clicks',
      title: 'Query demand without clicks',
      statement: `“${top.query}” had ${fmt(top.impressions)} impressions at ${pct(top.ctr)} CTR${
        top.pagePath ? ` on ${top.pagePath}` : ''
      }.`,
      sources: ['GSC'],
    });
  }

  const breakCallout = biggestBreak({
    clicks: searchClicks,
    sessions,
    conversions,
    avgCtr,
    impressions,
  });

  const headline = `In this audit window: ${fmt(searchClicks)} search clicks → ${fmt(sessions)} sessions → ${fmt(conversions)} conversions on measured pages.`;

  return {
    status: {
      headline,
      breakCallout,
      searchClicks,
      sessions,
      conversions,
      hasGsc,
      hasGa4,
      hasAds,
      emptyReason: null,
    },
    pages: pageRows,
    queries: queryRows,
    breaks: breaks.slice(0, 7),
  };
}
