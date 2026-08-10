import type { ConnectorSyncResult } from '@/lib/connectors/types';
import {
  adsBundleHasData,
  deriveAdsLandingMismatches,
  deriveAdsWasteSignals,
  totalAdsConversions,
  totalAdsSpend,
  type GoogleAdsBundle,
} from '@/lib/google/ads';

export function googleAdsSyncResult(
  bundle: GoogleAdsBundle,
  crawlPages: Array<{ path: string; title: string | null; h1: string | null }>
): ConnectorSyncResult {
  const hasData = adsBundleHasData(bundle);
  const waste = deriveAdsWasteSignals(bundle);
  const mismatches = deriveAdsLandingMismatches(bundle, crawlPages);
  return {
    connectorId: 'google_ads',
    outcome: hasData ? 'ok' : 'partial',
    hasData,
    message: hasData
      ? `Ads spend ~${totalAdsSpend(bundle).toFixed(0)}, conversions ${totalAdsConversions(bundle)}.`
      : 'Ads account mapped but no campaign data in window.',
    payload: {
      ...bundle,
      spend: totalAdsSpend(bundle),
      conversions: totalAdsConversions(bundle),
      wasteSignals: waste,
      landingMismatches: mismatches,
    },
  };
}
