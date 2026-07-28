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

export async function listGa4Properties(auth: ReturnType<typeof getAuthorizedClient>): Promise<Ga4PropertyOption[]> {
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
  auth: ReturnType<typeof getAuthorizedClient>,
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
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
    engagedSessions: Number(row.metricValues?.[1]?.value ?? 0),
    conversions: Number(row.metricValues?.[2]?.value ?? 0),
  }));
}

export async function fetchGa4TrafficByChannel(
  auth: ReturnType<typeof getAuthorizedClient>,
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
    existing.sessions += Number(row.metricValues?.[0]?.value ?? 0);
    existing.engagedSessions += Number(row.metricValues?.[1]?.value ?? 0);
    existing.conversions += Number(row.metricValues?.[2]?.value ?? 0);
    totals.set(channel, existing);
  }

  return Array.from(totals.values()).sort((a, b) => b.sessions - a.sessions);
}
