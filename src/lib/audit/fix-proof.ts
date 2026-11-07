import { normalizePath } from '@/lib/audit/joined-traffic-story';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';

/**
 * Before/after proof for a fix. When a fix is marked done we freeze the target's
 * metrics; once a later audit has run long enough after the fix, we compare.
 * Every audit reads a 28-day window, so results are labelled as such.
 */

export type FixTargetKind = 'page' | 'query';

export type FixMetrics = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** Page targets only; null for queries (GA4 has no per-query sessions). */
  sessions: number | null;
  conversions: number | null;
};

export type SiteTotals = { clicks: number; sessions: number; conversions: number };

export type FixBaseline = {
  metrics: FixMetrics;
  site: SiteTotals;
  windowDays: number;
  capturedAt: string;
};

type PrimaryMetric = 'ctr' | 'clicks' | 'sessions' | 'conversions';

/** The number each kind of issue is meant to move. */
const PRIMARY_METRIC: Record<string, PrimaryMetric> = {
  'demand-without-clicks': 'ctr',
  'query-demand-without-clicks': 'ctr',
  'clicks-without-sessions': 'sessions',
  'sessions-without-conversions': 'conversions',
  'conversions-without-search': 'clicks',
};

export const WINDOW_DAYS = 28;
/** Don't judge a fix until at least this many days of post-fix data exist. */
export const MIN_DAYS_BEFORE_READ = 14;
const MIN_IMPRESSIONS_FOR_RATE = 50;
const MIN_VOLUME_FOR_COUNT = 10;
const SIGNIFICANT_CHANGE = 0.1;
const DAY_MS = 86_400_000;

export function primaryMetricFor(issueId: string): PrimaryMetric {
  return PRIMARY_METRIC[issueId] ?? 'clicks';
}

export function siteTotals(connected: ConnectedAuditMetrics): SiteTotals {
  const m = connected.metrics;
  const o = connected.ga4Overview;
  const pages = connected.pageMetrics;
  return {
    clicks: m?.total_clicks ?? pages.reduce((s, p) => s + (p.gsc_clicks || 0), 0),
    sessions: o?.sessions ?? m?.total_sessions ?? pages.reduce((s, p) => s + (p.ga_sessions || 0), 0),
    conversions:
      o?.conversions ?? m?.total_conversions ?? pages.reduce((s, p) => s + (p.ga_conversions || 0), 0),
  };
}

export function snapshotTarget(
  connected: ConnectedAuditMetrics,
  kind: FixTargetKind,
  target: string
): FixMetrics | null {
  if (kind === 'page') {
    const key = normalizePath(target);
    const page = connected.pageMetrics.find((p) => normalizePath(p.path) === key);
    if (!page) return null;
    return {
      clicks: page.gsc_clicks,
      impressions: page.gsc_impressions,
      ctr: page.gsc_impressions > 0 ? page.gsc_clicks / page.gsc_impressions : 0,
      position: page.gsc_position,
      sessions: page.ga_sessions,
      conversions: page.ga_conversions,
    };
  }

  const wanted = target.trim().toLowerCase();
  const rows = connected.queryMetrics.filter((q) => q.query.trim().toLowerCase() === wanted);
  if (rows.length === 0) return null;
  const impressions = rows.reduce((s, q) => s + q.impressions, 0);
  const clicks = rows.reduce((s, q) => s + q.clicks, 0);
  const position =
    impressions > 0
      ? rows.reduce((s, q) => s + q.position * q.impressions, 0) / impressions
      : rows[0]!.position;
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position,
    sessions: null,
    conversions: null,
  };
}

export function buildBaseline(
  connected: ConnectedAuditMetrics,
  kind: FixTargetKind,
  target: string,
  now: Date = new Date()
): FixBaseline | null {
  const metrics = snapshotTarget(connected, kind, target);
  if (!metrics) return null;
  return {
    metrics,
    site: siteTotals(connected),
    windowDays: WINDOW_DAYS,
    capturedAt: now.toISOString(),
  };
}

export type FixProofState =
  | 'collecting' // not enough time has passed since the fix
  | 'improved'
  | 'flat'
  | 'worse'
  | 'inconclusive'; // too little traffic, or the target vanished from the data

export type FixProofRow = {
  label: string;
  before: string;
  after: string;
  /** true = moved the right way, false = wrong way, null = neutral/unknown. */
  better: boolean | null;
};

export type FixProof = {
  state: FixProofState;
  summary: string;
  rows: FixProofRow[];
  /** Days between marking done and the audit that produced `after`. */
  daysSinceFix: number;
};

function pctText(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

function countText(n: number | null) {
  return n === null ? '—' : Math.round(n).toLocaleString();
}

function relChange(before: number, after: number): number | null {
  if (before <= 0) return null;
  return (after - before) / before;
}

function signedPct(change: number) {
  const v = Math.round(change * 100);
  return `${v > 0 ? '+' : ''}${v}%`;
}

function buildRows(before: FixMetrics, after: FixMetrics): FixProofRow[] {
  const higherIsBetter = (a: number | null, b: number | null) =>
    a === null || b === null || a === b ? null : b > a;
  const rows: FixProofRow[] = [
    { label: 'Clicks', before: countText(before.clicks), after: countText(after.clicks), better: higherIsBetter(before.clicks, after.clicks) },
    { label: 'Impressions', before: countText(before.impressions), after: countText(after.impressions), better: null },
    { label: 'CTR', before: pctText(before.ctr), after: pctText(after.ctr), better: higherIsBetter(before.ctr, after.ctr) },
    {
      label: 'Avg. position',
      before: before.position > 0 ? before.position.toFixed(1) : '—',
      after: after.position > 0 ? after.position.toFixed(1) : '—',
      better:
        before.position > 0 && after.position > 0 && before.position !== after.position
          ? after.position < before.position
          : null,
    },
  ];
  if (before.sessions !== null && after.sessions !== null) {
    rows.push({ label: 'Sessions', before: countText(before.sessions), after: countText(after.sessions), better: higherIsBetter(before.sessions, after.sessions) });
  }
  if (before.conversions !== null && after.conversions !== null) {
    rows.push({ label: 'Conversions', before: countText(before.conversions), after: countText(after.conversions), better: higherIsBetter(before.conversions, after.conversions) });
  }
  return rows;
}

const METRIC_LABEL: Record<PrimaryMetric, string> = {
  ctr: 'CTR',
  clicks: 'Clicks',
  sessions: 'Sessions',
  conversions: 'Conversions',
};

/**
 * Compare a frozen baseline with the target's metrics in a later audit.
 * Volume metrics are judged against the site-wide trend so a seasonal lift
 * isn't credited to the fix.
 */
export function compareFix(input: {
  issueId: string;
  baseline: FixBaseline;
  after: FixMetrics | null;
  siteAfter: SiteTotals;
  doneAt: Date;
  runCompletedAt: Date;
}): FixProof {
  const { baseline, after } = input;
  const daysSinceFix = Math.floor((input.runCompletedAt.getTime() - input.doneAt.getTime()) / DAY_MS);

  if (daysSinceFix < MIN_DAYS_BEFORE_READ) {
    return {
      state: 'collecting',
      summary: `Too early to judge. Re-run the audit after ${MIN_DAYS_BEFORE_READ} days so the 28-day window mostly covers the time after your change.`,
      rows: [],
      daysSinceFix: Math.max(0, daysSinceFix),
    };
  }

  if (!after) {
    return {
      state: 'inconclusive',
      summary: 'This target no longer appears in Google data for the latest window, so there is nothing to compare.',
      rows: [],
      daysSinceFix,
    };
  }

  const metric = primaryMetricFor(input.issueId);
  const rows = buildRows(baseline.metrics, after);
  const before = baseline.metrics;

  const beforeValue = before[metric];
  const afterValue = after[metric];
  if (beforeValue === null || afterValue === null) {
    return { state: 'inconclusive', summary: 'The metric this fix targets isn’t available for this item.', rows, daysSinceFix };
  }

  const enoughData =
    metric === 'ctr'
      ? before.impressions >= MIN_IMPRESSIONS_FOR_RATE && after.impressions >= MIN_IMPRESSIONS_FOR_RATE
      : beforeValue + afterValue >= MIN_VOLUME_FOR_COUNT;
  if (!enoughData) {
    return {
      state: 'inconclusive',
      summary: 'There isn’t enough traffic on this item to tell a real change from noise.',
      rows,
      daysSinceFix,
    };
  }

  const raw = beforeValue > 0 ? relChange(beforeValue, afterValue) : afterValue > 0 ? 1 : 0;
  let adjusted = raw ?? 0;
  let siteNote = '';
  if (metric !== 'ctr') {
    const siteBefore = baseline.site[metric];
    const siteChange = relChange(siteBefore, input.siteAfter[metric]);
    if (siteChange !== null) {
      adjusted = (raw ?? 0) - siteChange;
      if (Math.abs(siteChange) >= SIGNIFICANT_CHANGE) {
        siteNote = ` The whole site moved ${signedPct(siteChange)} over the same period, which is factored in.`;
      }
    }
  }

  const label = METRIC_LABEL[metric];
  const fmt = (n: number) => (metric === 'ctr' ? pctText(n) : countText(n));
  const move = `${label} ${fmt(beforeValue)} → ${fmt(afterValue)}${raw !== null && beforeValue > 0 ? ` (${signedPct(raw)})` : ''}.`;

  if (adjusted >= SIGNIFICANT_CHANGE) {
    return { state: 'improved', summary: `${move}${siteNote}`, rows, daysSinceFix };
  }
  if (adjusted <= -SIGNIFICANT_CHANGE) {
    return { state: 'worse', summary: `${move}${siteNote}`, rows, daysSinceFix };
  }
  return { state: 'flat', summary: `${move} No clear change yet.${siteNote}`, rows, daysSinceFix };
}
