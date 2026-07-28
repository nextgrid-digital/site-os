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

export async function listSearchConsoleSites(auth: ReturnType<typeof getAuthorizedClient>) {
  const webmasters = google.webmasters({ version: 'v3', auth });
  const response = await webmasters.sites.list();
  return (response.data.siteEntry ?? []).map((site) => ({
    siteUrl: site.siteUrl ?? '',
    permissionLevel: site.permissionLevel ?? 'unknown',
  }));
}

export async function fetchSearchConsolePerformance(
  auth: ReturnType<typeof getAuthorizedClient>,
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const [queryResponse, pageResponse] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: 250,
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 250,
      },
    }),
  ]);

  const queryRows: GscQueryRow[] = (queryResponse.data.rows ?? []).map((row) => ({
    query: row.keys?.[0] ?? '',
    page: row.keys?.[1] ?? '',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));

  const pageRows: GscPageRow[] = (pageResponse.data.rows ?? []).map((row) => ({
    page: row.keys?.[0] ?? '',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));

  return { queryRows, pageRows };
}
