import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';

/**
 * Sizes the missed search opportunity: pages that rank but earn fewer clicks than
 * their position normally would. The result is an estimate for one 28-day audit
 * window (about a month), not a forecast.
 */

/** Approximate organic CTR by average position (position 1 → ~28%). Industry-typical, not site-specific. */
const CTR_BY_POSITION = [0.28, 0.15, 0.11, 0.08, 0.06, 0.05, 0.04, 0.032, 0.028, 0.025];

/** We only count 70% of the benchmark gap so the estimate stays conservative. */
const CAPTURE_FACTOR = 0.7;
const MIN_IMPRESSIONS = 50;
const MAX_POSITION = 20;
/** A page is "under-performing" when its CTR is below 60% of the benchmark. */
const UNDERPERFORM_RATIO = 0.6;
const MIN_SESSIONS_FOR_PAGE_RATE = 30;

export type ValueBasis = 'custom' | 'ga4_revenue';

export type ValueSettings = {
  valuePerConversion: number;
  currency: string;
} | null;

export type OpportunityItem = {
  kind: 'page' | 'query';
  target: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  benchmarkCtr: number;
  missedClicks: number;
  missedConversions: number | null;
};

export type OpportunityVerdict = {
  hasEstimate: boolean;
  headline: string;
  /** The headline split so the key number can be emphasised. */
  headlineParts: { before: string; highlight: string; after: string };
  detail: string;
  missedClicks: number;
  missedConversions: number | null;
  monthlyValue: number | null;
  /** ISO currency code when the user supplied one; null for GA4 revenue (property currency unknown). */
  currency: string | null;
  valueBasis: ValueBasis | null;
  valuePerConversion: number | null;
  /** True when a value could be shown but the user hasn't confirmed one. */
  canSetValue: boolean;
  pageCount: number;
  /** Every under-performing page, biggest gap first. */
  items: OpportunityItem[];
};

export function expectedCtr(position: number): number {
  if (!Number.isFinite(position) || position <= 0) return 0;
  const rounded = Math.round(position);
  if (rounded <= CTR_BY_POSITION.length) return CTR_BY_POSITION[rounded - 1]!;
  // Past page 1 the curve flattens quickly.
  return Math.max(0.005, 0.02 - (rounded - 10) * 0.0015);
}

/** Clicks a result at this position would plausibly earn beyond what it got. 0 when it isn't under-performing. */
export function estimateMissedClicks(input: {
  impressions: number;
  clicks: number;
  position: number;
}): { missedClicks: number; benchmarkCtr: number } {
  const benchmarkCtr = expectedCtr(input.position);
  if (
    input.impressions < MIN_IMPRESSIONS ||
    input.position <= 0 ||
    input.position > MAX_POSITION ||
    benchmarkCtr === 0
  ) {
    return { missedClicks: 0, benchmarkCtr };
  }
  const ctr = input.clicks / input.impressions;
  if (ctr >= benchmarkCtr * UNDERPERFORM_RATIO) return { missedClicks: 0, benchmarkCtr };
  const missed = input.impressions * benchmarkCtr * CAPTURE_FACTOR - input.clicks;
  return { missedClicks: Math.max(0, Math.round(missed)), benchmarkCtr };
}

/** Share of visits that convert: the page's own rate when it has enough traffic, else the site's. */
export function conversionRateFor(
  connected: ConnectedAuditMetrics,
  page: { sessions: number; conversions: number } | null
): number | null {
  if (page && page.sessions >= MIN_SESSIONS_FOR_PAGE_RATE) {
    return page.conversions / page.sessions;
  }
  const overview = connected.ga4Overview;
  if (overview && overview.sessions > 0) return overview.conversions / overview.sessions;
  return null;
}

function pathKey(path: string | null | undefined) {
  const trimmed = (path ?? '').trim() || '/';
  return trimmed === '/' ? '/' : trimmed.replace(/\/$/, '') || '/';
}

export function buildOpportunities(connected: ConnectedAuditMetrics): OpportunityItem[] {
  const seen = new Set<string>();
  const items: OpportunityItem[] = [];

  for (const p of connected.pageMetrics) {
    const key = pathKey(p.path);
    if (seen.has(key)) continue;
    seen.add(key);
    const { missedClicks, benchmarkCtr } = estimateMissedClicks({
      impressions: p.gsc_impressions,
      clicks: p.gsc_clicks,
      position: p.gsc_position,
    });
    if (missedClicks <= 0) continue;
    const rate = conversionRateFor(connected, {
      sessions: p.ga_sessions,
      conversions: p.ga_conversions,
    });
    items.push({
      kind: 'page',
      target: p.path || '/',
      impressions: p.gsc_impressions,
      clicks: p.gsc_clicks,
      ctr: p.gsc_impressions > 0 ? p.gsc_clicks / p.gsc_impressions : 0,
      position: p.gsc_position,
      benchmarkCtr,
      missedClicks,
      missedConversions: rate === null ? null : missedClicks * rate,
    });
  }

  return items.toSorted((a, b) => b.missedClicks - a.missedClicks);
}

export function resolveValuePerConversion(
  connected: ConnectedAuditMetrics,
  settings: ValueSettings
): { value: number; basis: ValueBasis; currency: string | null } | null {
  if (settings && settings.valuePerConversion > 0) {
    return { value: settings.valuePerConversion, basis: 'custom', currency: settings.currency };
  }
  const overview = connected.ga4Overview;
  if (overview?.totalRevenue && overview.conversions > 0) {
    return {
      value: overview.totalRevenue / overview.conversions,
      basis: 'ga4_revenue',
      currency: null,
    };
  }
  return null;
}

export function formatMoney(amount: number, currency: string | null): string {
  const rounded = amount >= 100 ? Math.round(amount) : Math.round(amount * 10) / 10;
  if (!currency) return rounded.toLocaleString(undefined, { maximumFractionDigits: 1 });
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: amount >= 100 ? 0 : 1,
    }).format(amount);
  } catch {
    return `${currency} ${rounded.toLocaleString()}`;
  }
}

function formatCount(n: number) {
  return Math.round(n).toLocaleString();
}

const EMPTY: OpportunityVerdict = {
  hasEstimate: false,
  headline: '',
  headlineParts: { before: '', highlight: '', after: '' },
  detail: '',
  missedClicks: 0,
  missedConversions: null,
  monthlyValue: null,
  currency: null,
  valueBasis: null,
  valuePerConversion: null,
  canSetValue: false,
  pageCount: 0,
  items: [],
};

export function buildOpportunityVerdict(
  connected: ConnectedAuditMetrics | null,
  settings: ValueSettings = null
): OpportunityVerdict {
  if (!connected || !connected.gscConnected) {
    return {
      ...EMPTY,
      detail: 'Connect Search Console to see how much search demand your pages are leaving on the table.',
    };
  }

  const items = buildOpportunities(connected);
  if (items.length === 0) {
    return {
      ...EMPTY,
      detail:
        'No page stands out as ranking well but under-clicked in this window. Nothing to size right now.',
    };
  }

  const missedClicks = items.reduce((s, i) => s + i.missedClicks, 0);
  const hasConversions = items.some((i) => i.missedConversions !== null);
  const missedConversions = hasConversions
    ? items.reduce((s, i) => s + (i.missedConversions ?? 0), 0)
    : null;

  const value = resolveValuePerConversion(connected, settings);
  const monthlyValue =
    value && missedConversions !== null ? missedConversions * value.value : null;

  const pagesLabel = `${items.length} ${items.length === 1 ? 'page' : 'pages'}`;
  // The highlighted figure decides the verb: a money amount or a single conversion is singular.
  let highlight: string;
  let singular = false;
  if (monthlyValue !== null && value && monthlyValue >= 1) {
    highlight = formatMoney(monthlyValue, value.currency);
    singular = true;
  } else if (missedConversions !== null && missedConversions >= 1) {
    const rounded = Math.round(missedConversions);
    highlight = `${formatCount(missedConversions)} ${rounded === 1 ? 'conversion' : 'conversions'}`;
    singular = rounded === 1;
  } else {
    highlight = `${formatCount(missedClicks)} clicks`;
  }
  const headlineParts = {
    before: 'About ',
    highlight,
    after: ` a month ${singular ? 'is' : 'are'} leaking from ${pagesLabel} that rank but don’t get clicked.`,
  };
  const headline = `${headlineParts.before}${headlineParts.highlight}${headlineParts.after}`;

  const parts = [`~${formatCount(missedClicks)} extra clicks`];
  if (missedConversions !== null && missedConversions >= 1) {
    parts.push(`~${formatCount(missedConversions)} conversions at your current conversion rate`);
  }

  return {
    hasEstimate: true,
    headline,
    headlineParts,
    detail: `Closing the gap would bring ${parts.join(', ')} per 28 days. Estimate based on typical click-through rates for each page’s Google position, counting only 70% of the gap.`,
    missedClicks,
    missedConversions,
    monthlyValue,
    currency: value?.currency ?? null,
    valueBasis: value?.basis ?? null,
    valuePerConversion: value?.value ?? null,
    canSetValue: missedConversions !== null,
    pageCount: items.length,
    items,
  };
}
