import type { ConnectorSyncResult } from '@/lib/connectors/types';
import type { Ga4AnalyticsBundle, Ga4LandingPageRow } from '@/lib/google/ga4';

export function ga4SyncResult(
  landingPages: Ga4LandingPageRow[],
  analytics: Ga4AnalyticsBundle
): ConnectorSyncResult {
  const sessions = landingPages.reduce((sum, row) => sum + row.sessions, 0);
  const hasData = sessions > 0 || Boolean(analytics.overview?.sessions);
  return {
    connectorId: 'ga4',
    outcome: hasData ? 'ok' : 'partial',
    hasData,
    message: hasData
      ? `GA4: ${sessions} landing sessions · ${analytics.events.length} events · ${analytics.keyEvents.length} key events`
      : 'GA4 connected but no sessions in window.',
    payload: {
      landingPageCount: landingPages.length,
      sessions,
      eventCount: analytics.events.length,
      keyEventCount: analytics.keyEvents.length,
      overview: analytics.overview,
    },
  };
}
