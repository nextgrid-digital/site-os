import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { Ga4ConversionPeakCell, Ga4DimensionRow, Ga4FunnelStep } from '@/lib/google/ga4';

export type AnalyticsRowKind =
  | 'page'
  | 'source'
  | 'country'
  | 'device'
  | 'browser'
  | 'search'
  | 'event';

export type AnalyticsBarRow = {
  label: string;
  value: number;
  display: string;
  kind: AnalyticsRowKind;
};

export type AnalyticsTableRow = {
  label: string;
  views: string;
  share: string;
  secondary?: string;
  kind: AnalyticsRowKind;
};

export type AnalyticsKpiTile = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  /** Hide tile entirely (e.g. revenue when unavailable). */
  hidden?: boolean;
  emphasize?: boolean;
};

export type AnalyticsFunnelStepView = {
  step: number;
  path: string;
  visitors: number;
  conversionPct: number;
  dropOffPct: number | null;
};

export type AnalyticsPeakCell = {
  dayOfWeek: number;
  hour: number;
  level: 0 | 1 | 2 | 3 | 4;
  conversions: number;
};

function fmt(n: number, digits = 0) {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function fmtPct(rate: number) {
  if (!Number.isFinite(rate)) return '—';
  // GA4 bounceRate is 0–1
  const pct = rate <= 1 ? rate * 100 : rate;
  return `${pct.toFixed(0)}%`;
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function shareOf(value: number, total: number) {
  if (total <= 0 || value <= 0) return '—';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function toBarRows(
  rows: Ga4DimensionRow[],
  kind: AnalyticsRowKind,
  limit = 5
): AnalyticsBarRow[] {
  return rows.slice(0, limit).map((r) => ({
    label: r.label,
    value: r.sessions,
    display: fmt(r.sessions),
    kind,
  }));
}

function toTableRows(
  rows: Array<{ label: string; sessions: number; conversions?: number }>,
  totalSessions: number,
  kind: AnalyticsRowKind,
  opts?: { showRevenue?: boolean; revenueByLabel?: Map<string, number> }
): AnalyticsTableRow[] {
  return rows.slice(0, 8).map((r) => ({
    label: r.label,
    views: fmt(r.sessions),
    share: shareOf(r.sessions, totalSessions),
    kind,
    secondary:
      opts?.showRevenue && opts.revenueByLabel
        ? opts.revenueByLabel.has(r.label)
          ? fmtMoney(opts.revenueByLabel.get(r.label) ?? 0)
          : '—'
        : r.conversions != null && r.conversions > 0
          ? fmt(r.conversions)
          : undefined,
  }));
}

/** Secondary KPI strip under the hero (real overview only). */
export function buildAnalyticsKpiTiles(connected: ConnectedAuditMetrics | null): AnalyticsKpiTile[] {
  const o = connected?.ga4Overview;
  if (!o) {
    return [
      { id: 'sessions', label: 'Sessions', value: '—' },
      { id: 'engaged', label: 'Engaged', value: '—' },
      { id: 'bounce', label: 'Bounce rate', value: '—' },
      { id: 'duration', label: 'Session time', value: '—' },
      { id: 'conversions', label: 'Conversions', value: '—' },
      { id: 'revenue', label: 'Revenue', value: '—', hidden: true },
    ];
  }

  const days = Math.max(1, connected?.ga4Daily.length || 28);
  const avgDaily = o.sessions / days;

  return [
    {
      id: 'sessions',
      label: 'Sessions',
      value: fmt(o.sessions),
      hint: `~${fmt(avgDaily)} / day`,
    },
    {
      id: 'engaged',
      label: 'Engaged',
      value: fmt(o.engagedSessions),
      hint: o.sessions > 0 ? shareOf(o.engagedSessions, o.sessions) : undefined,
    },
    {
      id: 'bounce',
      label: 'Bounce rate',
      value: fmtPct(o.bounceRate),
      emphasize: true,
    },
    {
      id: 'duration',
      label: 'Session time',
      value: fmtDuration(o.averageSessionDuration),
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: fmt(o.conversions),
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: o.totalRevenue != null ? fmtMoney(o.totalRevenue) : '—',
      hint: o.totalRevenue != null ? `${fmt(o.conversions)} conv.` : undefined,
      hidden: o.totalRevenue == null,
      emphasize: o.totalRevenue != null,
    },
  ];
}

export function buildPagesBarRows(connected: ConnectedAuditMetrics | null): AnalyticsBarRow[] {
  const pages = connected?.pageMetrics ?? [];
  return pages
    .filter((p) => p.ga_sessions > 0 || p.gsc_impressions > 0)
    .toSorted(
      (a, b) =>
        (b.ga_sessions || b.gsc_impressions) - (a.ga_sessions || a.gsc_impressions)
    )
    .slice(0, 5)
    .map((p) => {
      const value = p.ga_sessions > 0 ? p.ga_sessions : p.gsc_impressions;
      return { label: p.path || '/', value, display: fmt(value), kind: 'page' as const };
    });
}

export function buildSourcesBarRows(connected: ConnectedAuditMetrics | null): AnalyticsBarRow[] {
  return (connected?.trafficByChannel ?? [])
    .filter((c) => c.sessions > 0)
    .toSorted((a, b) => b.sessions - a.sessions)
    .slice(0, 5)
    .map((c) => ({
      label: c.channel || c.sourceMedium || 'Other',
      value: c.sessions,
      display: fmt(c.sessions),
      kind: 'source' as const,
    }));
}

export function buildSearchBarRows(connected: ConnectedAuditMetrics | null): AnalyticsBarRow[] {
  return (connected?.queryMetrics ?? [])
    .filter((q) => q.impressions > 0 || q.clicks > 0)
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, 5)
    .map((q) => ({
      label: q.query,
      value: q.impressions || q.clicks,
      display: fmt(q.impressions || q.clicks),
      kind: 'search' as const,
    }));
}

export function buildLocationsBarRows(connected: ConnectedAuditMetrics | null) {
  return toBarRows(connected?.ga4Countries ?? [], 'country');
}

export function buildDevicesBarRows(connected: ConnectedAuditMetrics | null) {
  return toBarRows(connected?.ga4Devices ?? [], 'device');
}

export function buildBrowsersBarRows(connected: ConnectedAuditMetrics | null) {
  return toBarRows(connected?.ga4Browsers ?? [], 'browser');
}

export function buildEventsBarRows(connected: ConnectedAuditMetrics | null): AnalyticsBarRow[] {
  return (connected?.ga4Events ?? [])
    .filter((e) => e.sessions > 0 || e.conversions > 0)
    .toSorted((a, b) => b.conversions - a.conversions || b.sessions - a.sessions)
    .slice(0, 5)
    .map((e) => ({
      label: e.label,
      value: e.conversions > 0 ? e.conversions : e.sessions,
      display: fmt(e.conversions > 0 ? e.conversions : e.sessions),
      kind: 'event' as const,
    }));
}

export function buildDetailTables(connected: ConnectedAuditMetrics | null) {
  const totalSessions =
    connected?.ga4Overview?.sessions ??
    (connected?.trafficByChannel ?? []).reduce((s, c) => s + c.sessions, 0) ??
    0;

  const pages = (connected?.pageMetrics ?? [])
    .filter((p) => p.ga_sessions > 0)
    .toSorted((a, b) => b.ga_sessions - a.ga_sessions)
    .map((p) => ({
      label: p.path || '/',
      sessions: p.ga_sessions,
      conversions: p.ga_conversions,
    }));

  const sources = (connected?.trafficByChannel ?? []).map((c) => ({
    label: c.channel || c.sourceMedium || 'Other',
    sessions: c.sessions,
    conversions: c.conversions,
  }));

  return {
    sources: toTableRows(sources, totalSessions, 'source'),
    countries: toTableRows(
      (connected?.ga4Countries ?? []).map((r) => ({
        label: r.label,
        sessions: r.sessions,
        conversions: r.conversions,
      })),
      totalSessions,
      'country'
    ),
    devices: toTableRows(
      (connected?.ga4Devices ?? []).map((r) => ({
        label: r.label,
        sessions: r.sessions,
        conversions: r.conversions,
      })),
      totalSessions,
      'device'
    ),
    browsers: toTableRows(
      (connected?.ga4Browsers ?? []).map((r) => ({
        label: r.label,
        sessions: r.sessions,
        conversions: r.conversions,
      })),
      totalSessions,
      'browser'
    ),
    pages: toTableRows(pages, totalSessions, 'page'),
    events: toTableRows(
      (connected?.ga4Events ?? []).map((r) => ({
        label: r.label,
        sessions: r.sessions,
        conversions: r.conversions,
      })),
      totalSessions,
      'event'
    ),
  };
}

export function buildConversionPeakCells(
  peak: Ga4ConversionPeakCell[] | undefined
): AnalyticsPeakCell[] {
  if (!peak?.length) return [];

  const max = Math.max(...peak.map((c) => c.conversions), 0);
  if (max <= 0) return [];

  return peak.map((c) => {
    const ratio = c.conversions / max;
    let level: AnalyticsPeakCell['level'] = 0;
    if (ratio <= 0) level = 0;
    else if (ratio < 0.25) level = 1;
    else if (ratio < 0.5) level = 2;
    else if (ratio < 0.75) level = 3;
    else level = 4;
    return {
      dayOfWeek: c.dayOfWeek,
      hour: c.hour,
      level,
      conversions: c.conversions,
    };
  });
}

export function buildPathFunnelView(
  steps: Ga4FunnelStep[] | undefined
): AnalyticsFunnelStepView[] {
  if (!steps || steps.length < 2) return [];

  // Keep order from snapshot (top paths).
  const base = steps.slice(0, 3);
  const first = base[0]?.sessions || 0;
  if (first <= 0) return [];

  return base.map((step, index) => {
    const prev = index === 0 ? step.sessions : base[index - 1]?.sessions || step.sessions;
    const conversionPct = (step.sessions / first) * 100;
    const dropOffPct =
      index === 0 || prev <= 0 ? null : ((prev - step.sessions) / prev) * 100;
    return {
      step: index + 1,
      path: step.path,
      visitors: step.sessions,
      conversionPct,
      dropOffPct,
    };
  });
}

export function hasAnyTrafficData(connected: ConnectedAuditMetrics | null): boolean {
  if (!connected) return false;
  return Boolean(
    connected.ga4Overview ||
      connected.ga4Daily.length ||
      connected.pageMetrics.some((p) => p.ga_sessions > 0 || p.gsc_impressions > 0) ||
      connected.queryMetrics.length ||
      connected.trafficByChannel.some((c) => c.sessions > 0) ||
      connected.ga4Countries.length ||
      connected.ga4Devices.length ||
      connected.ga4Events.length
  );
}
