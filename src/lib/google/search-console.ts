import { google } from 'googleapis';
import type { getAuthorizedClient } from '@/lib/google/oauth';

export interface GscQueryRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDimensionRow {
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export type GscPerformanceBundle = {
  queryRows: GscQueryRow[];
  pageRows: GscPageRow[];
  byCountry: GscDimensionRow[];
  byDevice: GscDimensionRow[];
};

type AuthClient = ReturnType<typeof getAuthorizedClient>;

const GSC_PAGE_SIZE = 25_000;
/** Soft caps so audit snapshots stay bounded without BigQuery. */
const GSC_MAX_QUERY_PAGE_ROWS = 5_000;
const GSC_MAX_DIM_ROWS = 2_500;

export async function listSearchConsoleSites(auth: AuthClient) {
  const webmasters = google.webmasters({ version: 'v3', auth });
  const response = await webmasters.sites.list();
  return (response.data.siteEntry ?? []).map((site) => ({
    siteUrl: site.siteUrl ?? '',
    permissionLevel: site.permissionLevel ?? 'unknown',
  }));
}

async function querySearchAnalyticsPaged(
  auth: AuthClient,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  maxRows: number
): Promise<Array<{ keys?: string[] | null; clicks?: number | null; impressions?: number | null; ctr?: number | null; position?: number | null }>> {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const rows: Array<{
    keys?: string[] | null;
    clicks?: number | null;
    impressions?: number | null;
    ctr?: number | null;
    position?: number | null;
  }> = [];
  let startRow = 0;

  while (rows.length < maxRows) {
    const remaining = maxRows - rows.length;
    const rowLimit = Math.min(GSC_PAGE_SIZE, remaining);
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow,
      },
    });
    const batch = response.data.rows ?? [];
    if (batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < rowLimit) break;
    startRow += batch.length;
  }

  return rows;
}

function toDimRows(
  rows: Array<{
    keys?: string[] | null;
    clicks?: number | null;
    impressions?: number | null;
    ctr?: number | null;
    position?: number | null;
  }>
): GscDimensionRow[] {
  return rows.map((row) => ({
    label: row.keys?.[0] ?? '(not set)',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

/**
 * Search Console performance for the audit window.
 * Pages through the Performance API (no BigQuery) up to soft caps.
 */
export async function fetchSearchConsolePerformance(
  auth: AuthClient,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<GscPerformanceBundle> {
  const [queryRaw, pageRaw, countryRaw, deviceRaw] = await Promise.all([
    querySearchAnalyticsPaged(auth, siteUrl, startDate, endDate, ['query', 'page'], GSC_MAX_QUERY_PAGE_ROWS),
    querySearchAnalyticsPaged(auth, siteUrl, startDate, endDate, ['page'], GSC_MAX_QUERY_PAGE_ROWS),
    querySearchAnalyticsPaged(auth, siteUrl, startDate, endDate, ['country'], GSC_MAX_DIM_ROWS),
    querySearchAnalyticsPaged(auth, siteUrl, startDate, endDate, ['device'], GSC_MAX_DIM_ROWS),
  ]);

  const queryRows: GscQueryRow[] = queryRaw.map((row) => ({
    query: row.keys?.[0] ?? '',
    page: row.keys?.[1] ?? '',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));

  const pageRows: GscPageRow[] = pageRaw.map((row) => ({
    page: row.keys?.[0] ?? '',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));

  return {
    queryRows,
    pageRows,
    byCountry: toDimRows(countryRaw),
    byDevice: toDimRows(deviceRaw),
  };
}
