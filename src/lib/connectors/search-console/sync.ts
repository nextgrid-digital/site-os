import type { ConnectorSyncResult } from '@/lib/connectors/types';
import type { GscPageRow, GscQueryRow } from '@/lib/google/search-console';

export function searchConsoleSyncResult(data: {
  queryRows: GscQueryRow[];
  pageRows: GscPageRow[];
  byCountry?: unknown[];
  byDevice?: unknown[];
}): ConnectorSyncResult {
  const impressions = data.pageRows.reduce((sum, row) => sum + row.impressions, 0);
  const hasData = impressions > 0 || data.queryRows.length > 0;
  return {
    connectorId: 'search_console',
    outcome: hasData ? 'ok' : 'partial',
    hasData,
    message: hasData
      ? `Search Console: ${data.queryRows.length} queries, ${impressions} impressions.`
      : 'Search Console connected but no data in window.',
    payload: {
      queryCount: data.queryRows.length,
      pageCount: data.pageRows.length,
      countryCount: data.byCountry?.length ?? 0,
      deviceCount: data.byDevice?.length ?? 0,
      impressions,
    },
  };
}
