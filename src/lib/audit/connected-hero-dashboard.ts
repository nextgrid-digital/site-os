import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import type {
  ChartPoint,
  HeroDashboardData,
  MetricDef,
  MetricId,
  PageRow,
  SourceRow,
} from '@/components/marketing/site-os/demo/landing-demo-data';

const TRANSPARENT =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function fmt(n: number, digits = 0) {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function barsFromRows(
  rows: Array<{ id: string; label: string; value: number }>
): ChartPoint[] {
  if (rows.length === 0) {
    return [{ date: 'empty', label: '—', value: 0 }];
  }
  return rows.slice(0, 12).map((r, i) => ({
    date: r.id || `r-${i}`,
    label: r.label.length > 14 ? `${r.label.slice(0, 12)}…` : r.label,
    value: Math.max(0, r.value),
  }));
}

function emptySeries(): ChartPoint[] {
  return [{ date: 'empty', label: '—', value: 0 }];
}

/**
 * Map connected GSC/GA4 audit rows into HeroDemoDashboard data.
 * Falls back to BER crawl counts when Google rows are empty.
 */
export function buildHeroDashboardFromConnected(
  connected: ConnectedAuditMetrics | null | undefined,
  ber?: BrandEvidenceReportView | null
): HeroDashboardData {
  const m = connected?.metrics;
  const pages = connected?.pageMetrics ?? [];
  const queries = connected?.queryMetrics ?? [];
  const channels = connected?.trafficByChannel ?? [];

  const overview = connected?.ga4Overview;
  const daily = connected?.ga4Daily ?? [];
  const hasDaily = daily.length > 1;

  const sessions =
    overview?.sessions ??
    m?.total_sessions ??
    pages.reduce((s, p) => s + (p.ga_sessions || 0), 0);
  const engaged =
    overview?.engagedSessions ??
    m?.total_engaged_sessions ??
    pages.reduce((s, p) => s + (p.ga_engaged_sessions || 0), 0);
  const conversions =
    overview?.conversions ??
    m?.total_conversions ??
    pages.reduce((s, p) => s + (p.ga_conversions || 0), 0);
  const bounceRate = overview?.bounceRate ?? null;
  const avgDuration = overview?.averageSessionDuration ?? null;
  const totalRevenue = overview?.totalRevenue ?? null;
  const impressions =
    m?.total_impressions ??
    pages.reduce((s, p) => s + (p.gsc_impressions || 0), 0);
  const clicks =
    m?.total_clicks ?? pages.reduce((s, p) => s + (p.gsc_clicks || 0), 0);
  const ctr = m?.avg_ctr ?? (impressions > 0 ? clicks / impressions : 0);
  const position = m?.avg_position ?? 0;
  const engagedRate = sessions > 0 ? engaged / sessions : 0;

  const hasGoogleRows =
    sessions > 0 ||
    impressions > 0 ||
    clicks > 0 ||
    queries.length > 0 ||
    channels.some((c) => c.sessions > 0) ||
    pages.some((p) => p.ga_sessions > 0 || p.gsc_impressions > 0);

  const pagesAnalyzed = ber?.executive.pages_analyzed ?? pages.length;
  const claimsCount = ber?.claims.length ?? 0;
  const promptsCount = ber?.executive.sampled_prompts_tested ?? 0;
  const sourcesCount = ber?.executive.external_sources_identified ?? 0;

  function formatDuration(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }

  const useGa4Overview = Boolean(overview && (sessions > 0 || conversions > 0 || bounceRate != null));

  const metrics: MetricDef[] = useGa4Overview
    ? [
        {
          id: 'visitors',
          label: 'Sessions',
          change: 'GA4 · 28d',
          changePositive: true,
          value: fmt(sessions),
          chartTitle: 'Sessions over time',
          unit: 'count',
        },
        {
          id: 'visits',
          label: 'Engaged',
          change: engagedRate > 0 ? pct(engagedRate) : 'GA4',
          changePositive: true,
          value: fmt(engaged),
          chartTitle: 'Engaged sessions over time',
          unit: 'count',
        },
        {
          id: 'views',
          label: impressions > 0 ? 'Impressions' : 'Views proxy',
          change: impressions > 0 ? 'GSC' : 'Sessions',
          changePositive: true,
          value: impressions > 0 ? fmt(impressions) : fmt(sessions),
          chartTitle: impressions > 0 ? 'Impressions by query' : 'Sessions over time',
          unit: 'count',
        },
        {
          id: 'bounce',
          label: 'Bounce rate',
          change: 'GA4',
          changePositive: false,
          value: bounceRate != null ? pct(bounceRate) : '—',
          chartTitle: 'Bounce rate over time',
          unit: 'percent',
        },
        {
          id: 'session',
          label: 'Session time',
          change: 'GA4',
          changePositive: true,
          value: avgDuration != null ? formatDuration(avgDuration) : '—',
          chartTitle: 'Session duration over time',
          unit: 'count',
        },
        {
          id: 'revenue',
          label: totalRevenue != null ? 'Revenue' : 'Conversions',
          change: 'GA4',
          changePositive: true,
          value: totalRevenue != null ? `$${fmt(totalRevenue)}` : fmt(conversions),
          chartTitle: totalRevenue != null ? 'Revenue over time' : 'Conversions over time',
          unit: totalRevenue != null ? 'currency' : 'count',
        },
      ]
    : hasGoogleRows
    ? [
        {
          id: 'visitors',
          label: 'Sessions',
          change: connected?.ga4Connected ? 'GA4' : '—',
          changePositive: true,
          value: fmt(sessions),
          chartTitle: 'Sessions by page',
          unit: 'count',
        },
        {
          id: 'visits',
          label: 'Engaged',
          change: engagedRate > 0 ? pct(engagedRate) : 'GA4',
          changePositive: true,
          value: fmt(engaged),
          chartTitle: 'Engaged sessions by page',
          unit: 'count',
        },
        {
          id: 'views',
          label: 'Impressions',
          change: connected?.gscConnected ? 'GSC' : '—',
          changePositive: true,
          value: fmt(impressions),
          chartTitle: 'Impressions by query',
          unit: 'count',
        },
        {
          id: 'bounce',
          label: 'CTR',
          change: connected?.gscConnected ? 'GSC' : '—',
          changePositive: true,
          value: pct(ctr),
          chartTitle: 'CTR by query',
          unit: 'percent',
        },
        {
          id: 'session',
          label: 'Avg position',
          change: connected?.gscConnected ? 'GSC' : '—',
          changePositive: false,
          value: position > 0 ? fmt(position, 1) : '—',
          chartTitle: 'Position by query',
          unit: 'count',
        },
        {
          id: 'revenue',
          label: 'Conversions',
          change: connected?.ga4Connected ? 'GA4' : '—',
          changePositive: true,
          value: fmt(conversions),
          chartTitle: 'Conversions by channel',
          unit: 'count',
        },
      ]
    : [
        {
          id: 'visitors',
          label: 'Pages',
          change: 'Crawl',
          changePositive: true,
          value: fmt(pagesAnalyzed),
          chartTitle: 'Pages analyzed',
          unit: 'count',
        },
        {
          id: 'visits',
          label: 'Claims',
          change: 'Evidence',
          changePositive: true,
          value: fmt(claimsCount),
          chartTitle: 'Claims recorded',
          unit: 'count',
        },
        {
          id: 'views',
          label: 'Prompts',
          change: 'AI sample',
          changePositive: true,
          value: fmt(promptsCount),
          chartTitle: 'Prompts sampled',
          unit: 'count',
        },
        {
          id: 'bounce',
          label: 'Sources',
          change: 'External',
          changePositive: true,
          value: fmt(sourcesCount),
          chartTitle: 'External sources',
          unit: 'count',
        },
        {
          id: 'session',
          label: 'Associations',
          change: 'Brand',
          changePositive: true,
          value: fmt(ber?.associations.length ?? 0),
          chartTitle: 'Brand associations',
          unit: 'count',
        },
        {
          id: 'revenue',
          label: 'Clicks',
          change: connected?.gscConnected ? 'GSC pending' : 'Not connected',
          changePositive: false,
          value: '—',
          chartTitle: 'Search clicks',
          unit: 'count',
        },
      ];

  const pageBars = pages
    .filter((p) => p.ga_sessions > 0 || p.gsc_impressions > 0 || p.gsc_clicks > 0)
    .toSorted(
      (a, b) =>
        (b.ga_sessions || b.gsc_impressions) - (a.ga_sessions || a.gsc_impressions)
    )
    .slice(0, 12)
    .map((p) => ({
      id: p.id,
      label: p.path || '/',
      value: p.ga_sessions > 0 ? p.ga_sessions : p.gsc_impressions || p.gsc_clicks,
    }));

  const queryBars = queries
    .filter((q) => q.impressions > 0 || q.clicks > 0)
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, 12)
    .map((q) => ({
      id: q.id,
      label: q.query,
      value: q.impressions > 0 ? q.impressions : q.clicks,
    }));

  const queryCtrBars = queries
    .filter((q) => q.impressions > 0)
    .toSorted((a, b) => b.ctr - a.ctr)
    .slice(0, 12)
    .map((q) => ({
      id: q.id,
      label: q.query,
      value: Math.round(q.ctr * 1000) / 10,
    }));

  const queryPosBars = queries
    .filter((q) => q.position > 0)
    .toSorted((a, b) => a.position - b.position)
    .slice(0, 12)
    .map((q) => ({
      id: q.id,
      label: q.query,
      value: Math.round(q.position * 10) / 10,
    }));

  const channelBars = channels
    .filter((c) => c.sessions > 0 || c.conversions > 0)
    .toSorted((a, b) => b.conversions - a.conversions || b.sessions - a.sessions)
    .slice(0, 12)
    .map((c, i) => ({
      id: `${c.channel}-${i}`,
      label: c.channel || c.sourceMedium || 'Other',
      value: c.conversions > 0 ? c.conversions : c.sessions,
    }));

  function dailySeries(
    pick: (d: (typeof daily)[number]) => number,
    asPercent = false
  ): ChartPoint[] {
    if (!hasDaily) return emptySeries();
    return daily.map((d) => {
      const raw = pick(d);
      const value = asPercent ? (raw <= 1 ? raw * 100 : raw) : raw;
      const label = d.date.length >= 10 ? d.date.slice(5) : d.date;
      return { date: d.date, label, value: Math.max(0, value) };
    });
  }

  const seriesByMetric: Record<MetricId, ChartPoint[]> = useGa4Overview && hasDaily
    ? {
        visitors: dailySeries((d) => d.sessions),
        visits: dailySeries((d) => d.engagedSessions),
        views: impressions > 0 ? barsFromRows(queryBars.length ? queryBars : pageBars) : dailySeries((d) => d.sessions),
        bounce: dailySeries((d) => d.bounceRate, true),
        session: dailySeries((d) => d.averageSessionDuration),
        revenue:
          totalRevenue != null
            ? dailySeries((d) => d.totalRevenue)
            : dailySeries((d) => d.conversions),
      }
    : hasGoogleRows
    ? {
        visitors: barsFromRows(pageBars),
        visits: barsFromRows(pageBars),
        views: barsFromRows(queryBars.length ? queryBars : pageBars),
        bounce: barsFromRows(queryCtrBars.length ? queryCtrBars : queryBars),
        session: barsFromRows(queryPosBars.length ? queryPosBars : queryBars),
        revenue: barsFromRows(channelBars.length ? channelBars : pageBars),
      }
    : {
        visitors: emptySeries(),
        visits: emptySeries(),
        views: emptySeries(),
        bounce: emptySeries(),
        session: emptySeries(),
        revenue: emptySeries(),
      };

  const topPages: PageRow[] = (pageBars.length
    ? pageBars
    : pages.slice(0, 8).map((p) => ({
        id: p.id,
        label: p.path || '/',
        value: 0,
      }))
  ).map((p) => ({
    path: p.label,
    value: p.value > 0 ? fmt(p.value) : '—',
  }));

  const pagesByTab = {
    Top: topPages.length ? topPages : [{ path: '—', value: '—' }],
    Entered: topPages.length ? topPages : [{ path: '—', value: '—' }],
    Exited: topPages.length ? topPages : [{ path: '—', value: '—' }],
  };

  const channelRows: SourceRow[] = channels
    .filter((c) => c.sessions > 0)
    .toSorted((a, b) => b.sessions - a.sessions)
    .slice(0, 8)
    .map((c) => ({
      name: c.channel || c.sourceMedium || 'Other',
      value: fmt(c.sessions),
      imgSrc: TRANSPARENT,
    }));

  const queryRows: SourceRow[] = queries
    .filter((q) => q.impressions > 0 || q.clicks > 0)
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, 8)
    .map((q) => ({
      name: q.query,
      value: fmt(q.impressions),
      imgSrc: TRANSPARENT,
    }));

  const emptySource: SourceRow[] = [{ name: '—', value: '—', imgSrc: TRANSPARENT }];

  const sourcesByTab = {
    Referrers: channelRows.length ? channelRows : emptySource,
    Hostnames: emptySource,
    Channels: channelRows.length ? channelRows : emptySource,
    AI: queryRows.length ? queryRows : emptySource,
  };

  const gscLabel = connected?.gscConnected
    ? connected.gscPropertyLabel || 'Connected'
    : 'Not connected';
  const gaLabel = connected?.ga4Connected
    ? connected.ga4PropertyLabel || 'Connected'
    : 'Not connected';

  return {
    metrics,
    seriesByMetric,
    pagesByTab,
    sourcesByTab,
    dateRangeLabel: `GSC · ${gscLabel}  ·  GA4 · ${gaLabel}`,
    live: true,
    defaultMetricId: hasGoogleRows ? 'visitors' : 'visitors',
  };
}

/** Keywords-focused secondary dashboard (GSC queries as primary). */
export function buildKeywordsHeroDashboard(
  connected: ConnectedAuditMetrics | null | undefined
): HeroDashboardData {
  const base = buildHeroDashboardFromConnected(connected, null);
  return {
    ...base,
    defaultMetricId: 'views',
    dateRangeLabel: connected?.gscConnected
      ? `Search Console · ${connected.gscPropertyLabel ?? 'Connected'}`
      : 'Search Console · Not connected',
  };
}
