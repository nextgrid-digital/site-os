import { cache } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  Ga4ConversionPeakCell,
  Ga4DailyRow,
  Ga4DimensionRow,
  Ga4FunnelStep,
  Ga4Overview,
} from '@/lib/google/ga4';
import type {
  AdsCampaignRow,
  AdsKeywordRow,
  AdsLandingMismatch,
  AdsLandingPageRow,
  AdsWasteSignal,
} from '@/lib/google/ads';
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
  ga4Events: Ga4DimensionRow[];
  ga4ConversionPeak: Ga4ConversionPeakCell[];
  ga4FunnelSteps: Ga4FunnelStep[];
  googleAds: ConnectedAdsMetrics | null;
};

const EMPTY_ANALYTICS = {
  ga4Overview: null as Ga4Overview | null,
  ga4Daily: [] as Ga4DailyRow[],
  ga4Countries: [] as Ga4DimensionRow[],
  ga4Devices: [] as Ga4DimensionRow[],
  ga4Browsers: [] as Ga4DimensionRow[],
  ga4Events: [] as Ga4DimensionRow[],
  ga4ConversionPeak: [] as Ga4ConversionPeakCell[],
  ga4FunnelSteps: [] as Ga4FunnelStep[],
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
  return (snapshot.trafficByChannel as ChannelTrafficRow[]).slice(0, 40);
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
      ? (snapshot.ga4Countries as Ga4DimensionRow[]).slice(0, 40)
      : [],
    ga4Devices: Array.isArray(snapshot.ga4Devices)
      ? (snapshot.ga4Devices as Ga4DimensionRow[]).slice(0, 20)
      : [],
    ga4Browsers: Array.isArray(snapshot.ga4Browsers)
      ? (snapshot.ga4Browsers as Ga4DimensionRow[]).slice(0, 20)
      : [],
    ga4Events: Array.isArray(snapshot.ga4Events)
      ? (snapshot.ga4Events as Ga4DimensionRow[]).slice(0, 40)
      : [],
    ga4ConversionPeak: Array.isArray(snapshot.ga4ConversionPeak)
      ? (snapshot.ga4ConversionPeak as Ga4ConversionPeakCell[])
      : [],
    ga4FunnelSteps: Array.isArray(snapshot.ga4FunnelSteps)
      ? (snapshot.ga4FunnelSteps as Ga4FunnelStep[]).slice(0, 12)
      : [],
  };
}

function adsFromSnapshot(snapshot: unknown): ConnectedAdsMetrics | null {
  if (!isRecord(snapshot)) return null;
  const fromConnectors =
    isRecord(snapshot.connectors) && isRecord(snapshot.connectors.google_ads)
      ? snapshot.connectors.google_ads
      : null;
  const raw = isRecord(snapshot.googleAds)
    ? snapshot.googleAds
    : fromConnectors;
  if (!raw || !isRecord(raw)) return null;

  return {
    campaigns: Array.isArray(raw.campaigns) ? (raw.campaigns as AdsCampaignRow[]).slice(0, 50) : [],
    keywords: Array.isArray(raw.keywords) ? (raw.keywords as AdsKeywordRow[]).slice(0, 80) : [],
    landingPages: Array.isArray(raw.landingPages)
      ? (raw.landingPages as AdsLandingPageRow[]).slice(0, 50)
      : [],
    wasteSignals: Array.isArray(raw.wasteSignals)
      ? (raw.wasteSignals as AdsWasteSignal[]).slice(0, 12)
      : [],
    landingMismatches: Array.isArray(raw.landingMismatches)
      ? (raw.landingMismatches as AdsLandingMismatch[]).slice(0, 12)
      : [],
    spend: typeof raw.spend === 'number' ? raw.spend : 0,
    conversions: typeof raw.conversions === 'number' ? raw.conversions : 0,
  };
}

async function loadConnectionStatus(projectId: string) {
  const supabase = getSupabaseAdmin();
  const [{ data: gsc }, { data: ga4 }, { data: ads }] = await Promise.all([
    supabase
      .from('search_console_properties')
      .select('id, site_url')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('ga4_properties')
      .select('id, property_id, property_name')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('google_ads_accounts')
      .select('id, customer_id, descriptive_name')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .limit(1)
      .maybeSingle(),
  ]);

  const gscConnected = Boolean(gsc);
  const ga4Connected = Boolean(ga4);
  const adsConnected = Boolean(ads);
  return {
    gscConnected,
    ga4Connected,
    adsConnected,
    googleConnected: gscConnected || ga4Connected || adsConnected,
    gscPropertyLabel: gsc?.site_url ?? null,
    ga4PropertyLabel: ga4?.property_name || ga4?.property_id || null,
    adsAccountLabel: ads?.descriptive_name || ads?.customer_id || null,
  };
}

/** Connection status only — used when there is no completed audit run yet. */
export const loadConnectedStatusForProject = cache(async function loadConnectedStatusForProject(
  projectId: string
): Promise<ConnectedAuditMetrics> {
  const status = await loadConnectionStatus(projectId);
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
  options?: { pageLimit?: number; queryLimit?: number }
): Promise<ConnectedAuditMetrics> {
  const supabase = getSupabaseAdmin();
  const pageLimit = options?.pageLimit ?? 80;
  const queryLimit = options?.queryLimit ?? 150;

  const [
    { data: metrics },
    { data: pageMetrics },
    { data: queryMetrics },
    { data: report },
    status,
  ] = await Promise.all([
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
    supabase
      .from('report_exports')
      .select('snapshot')
      .eq('audit_run_id', auditRunId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    loadConnectionStatus(projectId),
  ]);

  const snapshot = report?.snapshot;
  const googleAds = adsFromSnapshot(snapshot);

  return {
    auditRunId,
    ...status,
    metrics: (metrics as AuditMetrics | null) ?? null,
    pageMetrics: (pageMetrics as PageMetric[]) ?? [],
    queryMetrics: (queryMetrics as QueryMetric[]) ?? [],
    trafficByChannel: trafficFromSnapshot(snapshot),
    ...analyticsFromSnapshot(snapshot),
    googleAds,
  };
}
