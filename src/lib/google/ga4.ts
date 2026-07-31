import { google } from 'googleapis';
import type { getAuthorizedClient } from '@/lib/google/oauth';

export interface Ga4PropertyOption {
  propertyId: string;
  propertyName: string;
  accountName: string;
}

export interface Ga4LandingPageRow {
  landingPage: string;
  sourceMedium: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
}

export interface Ga4ChannelRow {
  sourceMedium: string;
  channel: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
}

export type Ga4Overview = {
  sessions: number;
  engagedSessions: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversions: number;
  /** Present only when the property returns revenue; otherwise null. */
  totalRevenue: number | null;
};

export type Ga4DailyRow = {
  date: string;
  sessions: number;
  engagedSessions: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversions: number;
  totalRevenue: number;
};

export type Ga4DimensionRow = {
  label: string;
  sessions: number;
  conversions: number;
};

export type Ga4ConversionPeakCell = {
  dayOfWeek: number;
  hour: number;
  conversions: number;
};

export type Ga4FunnelStep = {
  path: string;
  sessions: number;
  conversions: number;
};

export type Ga4AnalyticsBundle = {
  overview: Ga4Overview | null;
  daily: Ga4DailyRow[];
  countries: Ga4DimensionRow[];
  devices: Ga4DimensionRow[];
  browsers: Ga4DimensionRow[];
  events: Ga4DimensionRow[];
  conversionPeak: Ga4ConversionPeakCell[];
  funnelSteps: Ga4FunnelStep[];
};

type AuthClient = ReturnType<typeof getAuthorizedClient>;

function parseSourceMedium(sourceMedium: string) {
  const [source = '', medium = ''] = sourceMedium.split(' / ').map((value) => value.trim().toLowerCase());
  return { source, medium };
}

export function normalizeTrafficChannel(sourceMedium: string) {
  const raw = sourceMedium.trim();
  if (!raw || raw === '(not set)') return 'Unassigned';

  const { source, medium } = parseSourceMedium(raw);
  const text = `${source} ${medium}`.trim();

  if (medium === '(none)' || medium === 'direct') return 'Direct';
  if (medium.includes('organic') || source === 'google' || source === 'bing') return 'Organic Search';
  if (medium.includes('cpc') || medium.includes('ppc') || medium.includes('paid') || medium.includes('display')) {
    return 'Paid Search';
  }
  if (medium.includes('email')) return 'Email';
  if (
    medium.includes('social') ||
    source.includes('linkedin') ||
    source.includes('facebook') ||
    source.includes('instagram') ||
    source.includes('x.com') ||
    source.includes('twitter')
  ) {
    return 'Social';
  }
  if (medium.includes('referral')) return 'Referral';
  return text ? 'Other' : 'Unassigned';
}

function num(value: string | null | undefined) {
  return Number(value ?? 0);
}

/** GA4 date dimension is YYYYMMDD → YYYY-MM-DD */
function formatGa4Date(raw: string) {
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

export async function listGa4Properties(auth: AuthClient): Promise<Ga4PropertyOption[]> {
  const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth });
  const response = await analyticsAdmin.accountSummaries.list({ pageSize: 200 });
  const properties: Ga4PropertyOption[] = [];

  for (const account of response.data.accountSummaries ?? []) {
    for (const property of account.propertySummaries ?? []) {
      const propertyName = property.property ?? '';
      properties.push({
        propertyId: propertyName.replace('properties/', ''),
        propertyName: property.displayName ?? propertyName,
        accountName: account.displayName ?? 'Unknown account',
      });
    }
  }

  return properties;
}

export async function fetchGa4LandingPages(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4LandingPageRow[]> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'landingPage' },
        { name: 'sessionSourceMedium' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'conversions' },
      ],
      limit: '250',
    },
  });

  return (response.data.rows ?? []).map((row) => ({
    landingPage: row.dimensionValues?.[0]?.value ?? '/',
    sourceMedium: row.dimensionValues?.[1]?.value ?? '(not set)',
    sessions: num(row.metricValues?.[0]?.value),
    engagedSessions: num(row.metricValues?.[1]?.value),
    conversions: num(row.metricValues?.[2]?.value),
  }));
}

export async function fetchGa4TrafficByChannel(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4ChannelRow[]> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'conversions' },
      ],
      limit: '100',
    },
  });

  const totals = new Map<string, Ga4ChannelRow>();

  for (const row of response.data.rows ?? []) {
    const sourceMedium = row.dimensionValues?.[0]?.value ?? '(not set)';
    const channel = normalizeTrafficChannel(sourceMedium);
    const existing = totals.get(channel) ?? {
      sourceMedium: channel,
      channel,
      sessions: 0,
      engagedSessions: 0,
      conversions: 0,
    };
    existing.sessions += num(row.metricValues?.[0]?.value);
    existing.engagedSessions += num(row.metricValues?.[1]?.value);
    existing.conversions += num(row.metricValues?.[2]?.value);
    totals.set(channel, existing);
  }

  return Array.from(totals.values()).sort((a, b) => b.sessions - a.sessions);
}

const CORE_METRICS = [
  { name: 'sessions' },
  { name: 'engagedSessions' },
  { name: 'bounceRate' },
  { name: 'averageSessionDuration' },
  { name: 'conversions' },
  { name: 'totalRevenue' },
] as const;

export async function fetchGa4Overview(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4Overview | null> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  try {
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [...CORE_METRICS],
      },
    });
    const row = response.data.rows?.[0];
    if (!row) return null;
    const totalRevenue = num(row.metricValues?.[5]?.value);
    return {
      sessions: num(row.metricValues?.[0]?.value),
      engagedSessions: num(row.metricValues?.[1]?.value),
      bounceRate: num(row.metricValues?.[2]?.value),
      averageSessionDuration: num(row.metricValues?.[3]?.value),
      conversions: num(row.metricValues?.[4]?.value),
      totalRevenue: totalRevenue > 0 ? totalRevenue : null,
    };
  } catch {
    // Retry without revenue (some properties reject totalRevenue).
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
        ],
      },
    });
    const row = response.data.rows?.[0];
    if (!row) return null;
    return {
      sessions: num(row.metricValues?.[0]?.value),
      engagedSessions: num(row.metricValues?.[1]?.value),
      bounceRate: num(row.metricValues?.[2]?.value),
      averageSessionDuration: num(row.metricValues?.[3]?.value),
      conversions: num(row.metricValues?.[4]?.value),
      totalRevenue: null,
    };
  }
}

export async function fetchGa4DailySeries(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4DailyRow[]> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  async function run(includeRevenue: boolean) {
    return analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: includeRevenue
          ? [...CORE_METRICS]
          : [
              { name: 'sessions' },
              { name: 'engagedSessions' },
              { name: 'bounceRate' },
              { name: 'averageSessionDuration' },
              { name: 'conversions' },
            ],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
        limit: '90',
      },
    });
  }

  let response;
  let withRevenue = true;
  try {
    response = await run(true);
  } catch {
    withRevenue = false;
    response = await run(false);
  }

  return (response.data.rows ?? []).map((row) => ({
    date: formatGa4Date(row.dimensionValues?.[0]?.value ?? ''),
    sessions: num(row.metricValues?.[0]?.value),
    engagedSessions: num(row.metricValues?.[1]?.value),
    bounceRate: num(row.metricValues?.[2]?.value),
    averageSessionDuration: num(row.metricValues?.[3]?.value),
    conversions: num(row.metricValues?.[4]?.value),
    totalRevenue: withRevenue ? num(row.metricValues?.[5]?.value) : 0,
  }));
}

export async function fetchGa4ByDimension(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string,
  dimension: 'country' | 'deviceCategory' | 'browser' | 'eventName'
): Promise<Ga4DimensionRow[]> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: dimension }],
      metrics: [{ name: 'sessions' }, { name: 'conversions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '25',
    },
  });

  return (response.data.rows ?? [])
    .map((row) => ({
      label: row.dimensionValues?.[0]?.value || '(not set)',
      sessions: num(row.metricValues?.[0]?.value),
      conversions: num(row.metricValues?.[1]?.value),
    }))
    .filter((row) => row.label !== '(not set)' || row.sessions > 0);
}

export async function fetchGa4ConversionPeak(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4ConversionPeakCell[]> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'dayOfWeek' }, { name: 'hour' }],
      metrics: [{ name: 'conversions' }],
      limit: '200',
    },
  });

  return (response.data.rows ?? []).map((row) => ({
    dayOfWeek: Number(row.dimensionValues?.[0]?.value ?? 0),
    hour: Number(row.dimensionValues?.[1]?.value ?? 0),
    conversions: num(row.metricValues?.[0]?.value),
  }));
}

export async function fetchGa4PathFunnel(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4FunnelStep[]> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'sessions' }, { name: 'conversions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '15',
    },
  });

  const rows = (response.data.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || '/',
    sessions: num(row.metricValues?.[0]?.value),
    conversions: num(row.metricValues?.[1]?.value),
  }));

  if (rows.length === 0) return [];

  // Prefer a conversion-bearing path as the final step when available.
  const topBySessions = rows.slice(0, 3);
  const conversionPath = rows.find((r) => r.conversions > 0 && !topBySessions.some((t) => t.path === r.path));
  const steps = [...topBySessions];
  if (conversionPath && steps.length >= 2) {
    steps[steps.length - 1] = conversionPath;
  }
  return steps.slice(0, 3);
}

/**
 * Fetch the extended analytics bundle used by the Evidence long-scroll.
 * Individual report failures degrade to empty arrays / null overview.
 */
export async function fetchGa4AnalyticsBundle(
  auth: AuthClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4AnalyticsBundle> {
  const empty: Ga4AnalyticsBundle = {
    overview: null,
    daily: [],
    countries: [],
    devices: [],
    browsers: [],
    events: [],
    conversionPeak: [],
    funnelSteps: [],
  };

  const settled = await Promise.allSettled([
    fetchGa4Overview(auth, propertyId, startDate, endDate),
    fetchGa4DailySeries(auth, propertyId, startDate, endDate),
    fetchGa4ByDimension(auth, propertyId, startDate, endDate, 'country'),
    fetchGa4ByDimension(auth, propertyId, startDate, endDate, 'deviceCategory'),
    fetchGa4ByDimension(auth, propertyId, startDate, endDate, 'browser'),
    fetchGa4ByDimension(auth, propertyId, startDate, endDate, 'eventName'),
    fetchGa4ConversionPeak(auth, propertyId, startDate, endDate),
    fetchGa4PathFunnel(auth, propertyId, startDate, endDate),
  ]);

  const pick = <T,>(index: number, fallback: T): T => {
    const result = settled[index];
    if (result?.status === 'fulfilled') return result.value as T;
    if (result?.status === 'rejected') {
      console.error(`[ga4] report ${index} failed`, result.reason);
    }
    return fallback;
  };

  return {
    overview: pick(0, empty.overview),
    daily: pick(1, empty.daily),
    countries: pick(2, empty.countries),
    devices: pick(3, empty.devices),
    browsers: pick(4, empty.browsers),
    events: pick(5, empty.events),
    conversionPeak: pick(6, empty.conversionPeak),
    funnelSteps: pick(7, empty.funnelSteps),
  };
}
