import { cache } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  Ga4ChannelRow,
  Ga4ConversionPeakCell,
  Ga4DailyRow,
  Ga4DimensionRow,
  Ga4EventRow,
  Ga4FunnelStep,
  Ga4KeyEventConfig,
  Ga4Overview,
} from '@/lib/google/ga4';
import type {
  AdsCampaignRow,
  AdsKeywordRow,
  AdsLandingMismatch,
  AdsLandingPageRow,
  AdsWasteSignal,
} from '@/lib/google/ads';
import type { GscDimensionRow } from '@/lib/google/search-console';
import type {
  AuditMetrics,
  ChannelTrafficRow,
  PageMetric,
  QueryMetric,
} from '@/lib/supabase/types';

export type ConnectedAdsMetrics = {
  campaigns: AdsCampaignRow[];
  keywords: AdsKeywordRow[];
  landingPages: AdsLandingPageRow[];
  wasteSignals: AdsWasteSignal[];
  landingMismatches: AdsLandingMismatch[];
  spend: number;
  conversions: number;
};

export type ConnectedAuditMetrics = {
  auditRunId: string | null;
  googleConnected: boolean;
  gscConnected: boolean;
  ga4Connected: boolean;
  adsConnected: boolean;
  gscPropertyLabel: string | null;
  ga4PropertyLabel: string | null;
  adsAccountLabel: string | null;
  metrics: AuditMetrics | null;
  pageMetrics: PageMetric[];
  queryMetrics: QueryMetric[];
  trafficByChannel: ChannelTrafficRow[];
  /** Extended GA4 analytics from report_exports.snapshot (may be empty on older audits). */
  ga4Overview: Ga4Overview | null;
  ga4Daily: Ga4DailyRow[];
  ga4Countries: Ga4DimensionRow[];
  ga4Devices: Ga4DimensionRow[];
  ga4Browsers: Ga4DimensionRow[];
  ga4Events: Ga4EventRow[];
  ga4KeyEvents: Ga4KeyEventConfig[];
  ga4ChannelGroups: Ga4DimensionRow[];
  ga4Campaigns: Ga4DimensionRow[];
  ga4SourceMedium: Ga4ChannelRow[];
  ga4ConversionPeak: Ga4ConversionPeakCell[];
  ga4FunnelSteps: Ga4FunnelStep[];
  gscByCountry: GscDimensionRow[];
  gscByDevice: GscDimensionRow[];
  googleAds: ConnectedAdsMetrics | null;
};

const EMPTY_ANALYTICS = {
  ga4Overview: null as Ga4Overview | null,
  ga4Daily: [] as Ga4DailyRow[],
  ga4Countries: [] as Ga4DimensionRow[],
  ga4Devices: [] as Ga4DimensionRow[],
  ga4Browsers: [] as Ga4DimensionRow[],
  ga4Events: [] as Ga4EventRow[],
  ga4KeyEvents: [] as Ga4KeyEventConfig[],
  ga4ChannelGroups: [] as Ga4DimensionRow[],
  ga4Campaigns: [] as Ga4DimensionRow[],
  ga4SourceMedium: [] as Ga4ChannelRow[],
  ga4ConversionPeak: [] as Ga4ConversionPeakCell[],
  ga4FunnelSteps: [] as Ga4FunnelStep[],
  gscByCountry: [] as GscDimensionRow[],
  gscByDevice: [] as GscDimensionRow[],
};

const PAGE_METRIC_COLUMNS =
  'id, audit_run_id, path, url, title, meta_description, h1, internal_link_count, has_faq, has_faq_schema, gsc_clicks, gsc_impressions, gsc_ctr, gsc_position, ga_sessions, ga_engaged_sessions, ga_conversions, flags, created_at';
const QUERY_METRIC_COLUMNS =
  'id, audit_run_id, query, page_path, clicks, impressions, ctr, position, opportunity_score, created_at';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function trafficFromSnapshot(snapshot: unknown): ChannelTrafficRow[] {
  if (!isRecord(snapshot) || !Array.isArray(snapshot.trafficByChannel)) return [];
  return (snapshot.trafficByChannel as ChannelTrafficRow[]).slice(0, 80);
}

function normalizeEventRows(raw: unknown): Ga4EventRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!isRecord(item)) return null;
      // New shape
      if (typeof item.eventName === 'string') {
        return {
          eventName: item.eventName,
          eventCount: Number(item.eventCount ?? 0),
          sessions: Number(item.sessions ?? 0),
          conversions: Number(item.conversions ?? 0),
          isKeyEvent: Boolean(item.isKeyEvent),
        } satisfies Ga4EventRow;
      }
      // Legacy Ga4DimensionRow shape
      if (typeof item.label === 'string') {
        return {
          eventName: item.label,
          eventCount: Number(item.sessions ?? 0),
          sessions: Number(item.sessions ?? 0),
          conversions: Number(item.conversions ?? 0),
          isKeyEvent: Number(item.conversions ?? 0) > 0,
        } satisfies Ga4EventRow;
      }
      return null;
    })
    .filter((row): row is Ga4EventRow => Boolean(row))
    .slice(0, 500);
}

function analyticsFromSnapshot(snapshot: unknown): typeof EMPTY_ANALYTICS {
  if (!isRecord(snapshot)) return { ...EMPTY_ANALYTICS };

  const overview = isRecord(snapshot.ga4Overview)
    ? (snapshot.ga4Overview as Ga4Overview)
    : null;

  return {
    ga4Overview: overview,
    ga4Daily: Array.isArray(snapshot.ga4Daily)
      ? (snapshot.ga4Daily as Ga4DailyRow[]).slice(0, 90)
      : [],
    ga4Countries: Array.isArray(snapshot.ga4Countries)
      ? (snapshot.ga4Countries as Ga4DimensionRow[]).slice(0, 100)
      : [],
    ga4Devices: Array.isArray(snapshot.ga4Devices)
      ? (snapshot.ga4Devices as Ga4DimensionRow[]).slice(0, 20)
      : [],
    ga4Browsers: Array.isArray(snapshot.ga4Browsers)
      ? (snapshot.ga4Browsers as Ga4DimensionRow[]).slice(0, 40)
      : [],
    ga4Events: normalizeEventRows(snapshot.ga4Events),
    ga4KeyEvents: Array.isArray(snapshot.ga4KeyEvents)
      ? (snapshot.ga4KeyEvents as Ga4KeyEventConfig[]).slice(0, 200)
      : [],
    ga4ChannelGroups: Array.isArray(snapshot.ga4ChannelGroups)
      ? (snapshot.ga4ChannelGroups as Ga4DimensionRow[]).slice(0, 50)
      : [],
    ga4Campaigns: Array.isArray(snapshot.ga4Campaigns)
      ? (snapshot.ga4Campaigns as Ga4DimensionRow[]).slice(0, 100)
      : [],
    ga4SourceMedium: Array.isArray(snapshot.ga4SourceMedium)
      ? (snapshot.ga4SourceMedium as Ga4ChannelRow[]).slice(0, 250)
      : [],
    ga4ConversionPeak: Array.isArray(snapshot.ga4ConversionPeak)
      ? (snapshot.ga4ConversionPeak as Ga4ConversionPeakCell[])
      : [],
    ga4FunnelSteps: Array.isArray(snapshot.ga4FunnelSteps)
      ? (snapshot.ga4FunnelSteps as Ga4FunnelStep[]).slice(0, 12)
      : [],
    gscByCountry: Array.isArray(snapshot.gscByCountry)
      ? (snapshot.gscByCountry as GscDimensionRow[]).slice(0, 250)
      : [],
    gscByDevice: Array.isArray(snapshot.gscByDevice)
      ? (snapshot.gscByDevice as GscDimensionRow[]).slice(0, 20)
      : [],
  };
}

function adsFromSnapshot(snapshot: unknown): ConnectedAdsMetrics | null {
  if (!isRecord(snapshot)) return null;
  const fromConnectors =
    isRecord(snapshot.connectors) && isRecord(snapshot.connectors.google_ads)
      ? snapshot.connectors.google_ads
      : null;
  const raw = isRecord(snapshot.googleAds) ? snapshot.googleAds : fromConnectors;
  if (!isRecord(raw)) return null;

  return {
    campaigns: Array.isArray(raw.campaigns) ? (raw.campaigns as AdsCampaignRow[]) : [],
    keywords: Array.isArray(raw.keywords) ? (raw.keywords as AdsKeywordRow[]) : [],
    landingPages: Array.isArray(raw.landingPages)
      ? (raw.landingPages as AdsLandingPageRow[])
      : [],
    wasteSignals: Array.isArray(raw.wasteSignals)
      ? (raw.wasteSignals as AdsWasteSignal[])
      : [],
    landingMismatches: Array.isArray(raw.landingMismatches)
      ? (raw.landingMismatches as AdsLandingMismatch[])
      : [],
    spend: Number(raw.spend ?? 0),
    conversions: Number(raw.conversions ?? 0),
  };
}

async function loadConnectionStatus(projectId: string) {
  const supabase = getSupabaseAdmin();
  const [{ data: google }, { data: gsc }, { data: ga4 }, { data: ads }] = await Promise.all([
    supabase
      .from('google_connections')
      .select('id')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('search_console_properties')
      .select('site_url, is_selected')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .maybeSingle(),
    supabase
      .from('ga4_properties')
      .select('property_id, property_name, is_selected')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .maybeSingle(),
    supabase
      .from('google_ads_accounts')
      .select('customer_id, descriptive_name, is_selected')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .maybeSingle(),
  ]);

  return {
    googleConnected: Boolean(google),
    gscConnected: Boolean(gsc),
    ga4Connected: Boolean(ga4),
    adsConnected: Boolean(ads),
    gscPropertyLabel: gsc?.site_url ?? null,
    ga4PropertyLabel: ga4?.property_name || ga4?.property_id || null,
    adsAccountLabel: ads?.descriptive_name || ads?.customer_id || null,
  };
}

/** Cached per request — layout + metrics loaders share one connection status. */
const loadConnectionStatusCached = cache(loadConnectionStatus);

/** Connection status only — used when there is no completed audit run yet. */
export const loadConnectedStatusForProject = cache(async function loadConnectedStatusForProject(
  projectId: string
): Promise<ConnectedAuditMetrics> {
  const status = await loadConnectionStatusCached(projectId);
  return {
    auditRunId: null,
    ...status,
    metrics: null,
    pageMetrics: [],
    queryMetrics: [],
    trafficByChannel: [],
    ...EMPTY_ANALYTICS,
    googleAds: null,
  };
});

export async function loadConnectedMetricsForAuditRun(
  projectId: string,
  auditRunId: string,
  options?: { pageLimit?: number; queryLimit?: number; snapshot?: unknown }
): Promise<ConnectedAuditMetrics> {
  const supabase = getSupabaseAdmin();
  const pageLimit = options?.pageLimit ?? 80;
  const queryLimit = options?.queryLimit ?? 500;

  const statusPromise = loadConnectionStatusCached(projectId);

  let snapshot = options?.snapshot;
  if (snapshot === undefined) {
    const { data: report } = await supabase
      .from('report_exports')
      .select('snapshot')
      .eq('audit_run_id', auditRunId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    snapshot = report?.snapshot;
  }

  const status = await statusPromise;
  const fromSnapshot = metricsFromSnapshot(snapshot, auditRunId, status, pageLimit, queryLimit);
  if (fromSnapshot) return fromSnapshot;

  // Legacy audits without page/query arrays in snapshot — fall back to relational tables.
  const [{ data: metrics }, { data: pageMetrics }, { data: queryMetrics }] = await Promise.all([
    supabase.from('audit_metrics').select('*').eq('audit_run_id', auditRunId).maybeSingle(),
    supabase
      .from('page_metrics')
      .select(PAGE_METRIC_COLUMNS)
      .eq('audit_run_id', auditRunId)
      .order('ga_sessions', { ascending: false })
      .limit(pageLimit),
    supabase
      .from('query_metrics')
      .select(QUERY_METRIC_COLUMNS)
      .eq('audit_run_id', auditRunId)
      .order('impressions', { ascending: false })
      .limit(queryLimit),
  ]);

  return {
    auditRunId,
    ...status,
    metrics: (metrics as AuditMetrics | null) ?? null,
    pageMetrics: (pageMetrics as PageMetric[]) ?? [],
    queryMetrics: (queryMetrics as QueryMetric[]) ?? [],
    trafficByChannel: trafficFromSnapshot(snapshot),
    ...analyticsFromSnapshot(snapshot),
    googleAds: adsFromSnapshot(snapshot),
  };
}

function metricsFromSnapshot(
  snapshot: unknown,
  auditRunId: string,
  status: Awaited<ReturnType<typeof loadConnectionStatus>>,
  pageLimit: number,
  queryLimit: number
): ConnectedAuditMetrics | null {
  if (!isRecord(snapshot)) return null;

  const pageMetrics = Array.isArray(snapshot.pageMetrics)
    ? (snapshot.pageMetrics as PageMetric[]).slice(0, pageLimit)
    : null;
  const queryMetrics = Array.isArray(snapshot.queryMetrics)
    ? (snapshot.queryMetrics as QueryMetric[]).slice(0, queryLimit)
    : null;

  // Require at least one of the heavy arrays so we know this is a modern snapshot.
  if (!pageMetrics && !queryMetrics) return null;

  const metrics = isRecord(snapshot.metrics)
    ? (snapshot.metrics as unknown as AuditMetrics)
    : null;

  return {
    auditRunId,
    ...status,
    metrics,
    pageMetrics: pageMetrics ?? [],
    queryMetrics: queryMetrics ?? [],
    trafficByChannel: trafficFromSnapshot(snapshot),
    ...analyticsFromSnapshot(snapshot),
    googleAds: adsFromSnapshot(snapshot),
  };
}

/**
 * Preferred completed run + connected metrics from snapshot (Dashboard entry).
 * One report_exports.snapshot read — no kitchen-sink / double fetch.
 */
export const loadDashboardMetricsForProject = cache(async function loadDashboardMetricsForProject(
  projectId: string
): Promise<{
  auditRunId: string | null;
  connected: ConnectedAuditMetrics;
  growthBrief: unknown | null;
}> {
  const supabase = getSupabaseAdmin();
  const { data: runs } = await supabase
    .from('audit_runs')
    .select('id, run_type, completed_at')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5);

  const preferred =
    (runs ?? []).find((r) => r.run_type === 'full') ?? (runs ?? [])[0] ?? null;

  if (!preferred?.id) {
    return {
      auditRunId: null,
      connected: await loadConnectedStatusForProject(projectId),
      growthBrief: null,
    };
  }

  const { data: report } = await supabase
    .from('report_exports')
    .select('snapshot')
    .eq('audit_run_id', preferred.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const snapshot = report?.snapshot;
  const connected = await loadConnectedMetricsForAuditRun(projectId, preferred.id, {
    snapshot,
  });
  const growthBrief =
    isRecord(snapshot) && 'growthBrief' in snapshot ? snapshot.growthBrief ?? null : null;

  return {
    auditRunId: preferred.id,
    connected,
    growthBrief,
  };
});
