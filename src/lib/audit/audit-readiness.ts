export type AuditReadiness =
  | 'no_data'
  | 'search_console_only'
  | 'ga4_only'
  | 'full_data';

export type DataAvailabilitySource =
  | 'crawl'
  | 'intake'
  | 'search_console'
  | 'ga4'
  | 'google_ads'
  | 'gemini';

export interface DataAvailability {
  gscConnected: boolean;
  ga4Connected: boolean;
  adsConnected: boolean;
  gscHasData: boolean;
  ga4HasData: boolean;
  adsHasData: boolean;
  gscImpressions: number;
  ga4Sessions: number;
  adsSpend: number;
  basedOn: DataAvailabilitySource[];
}

export const GSC_IMPRESSIONS_THRESHOLD = 50;
export const GA4_SESSIONS_THRESHOLD = 30;

export function detectAuditReadiness(input: {
  gscConnected: boolean;
  ga4Connected: boolean;
  adsConnected?: boolean;
  gscImpressions: number;
  ga4Sessions: number;
  adsSpend?: number;
  hasCrawl: boolean;
  hasIntake: boolean;
  hasGemini: boolean;
}): { readiness: AuditReadiness; dataAvailability: DataAvailability } {
  const gscHasData = input.gscConnected && input.gscImpressions >= GSC_IMPRESSIONS_THRESHOLD;
  const ga4HasData = input.ga4Connected && input.ga4Sessions >= GA4_SESSIONS_THRESHOLD;
  const adsConnected = Boolean(input.adsConnected);
  const adsSpend = input.adsSpend ?? 0;
  const adsHasData = adsConnected && adsSpend > 0;

  let readiness: AuditReadiness;
  if (gscHasData && ga4HasData) {
    readiness = 'full_data';
  } else if (gscHasData) {
    readiness = 'search_console_only';
  } else if (ga4HasData) {
    readiness = 'ga4_only';
  } else {
    readiness = 'no_data';
  }

  const basedOn: DataAvailabilitySource[] = [];
  if (input.hasCrawl) basedOn.push('crawl');
  if (input.hasIntake) basedOn.push('intake');
  if (gscHasData) basedOn.push('search_console');
  if (ga4HasData) basedOn.push('ga4');
  if (adsHasData) basedOn.push('google_ads');
  if (input.hasGemini) basedOn.push('gemini');

  return {
    readiness,
    dataAvailability: {
      gscConnected: input.gscConnected,
      ga4Connected: input.ga4Connected,
      adsConnected,
      gscHasData,
      ga4HasData,
      adsHasData,
      gscImpressions: input.gscImpressions,
      ga4Sessions: input.ga4Sessions,
      adsSpend,
      basedOn,
    },
  };
}

export function readinessLabel(readiness: AuditReadiness): string {
  switch (readiness) {
    case 'full_data':
      return 'Full data';
    case 'search_console_only':
      return 'Search Console only';
    case 'ga4_only':
      return 'GA4 only';
    case 'no_data':
      return 'No data yet';
    default: {
      const _exhaustive: never = readiness;
      return _exhaustive;
    }
  }
}

export function computeConfidenceScore(input: {
  readiness: AuditReadiness;
  pagesCrawled: number;
  intakeFieldCount: number;
  intakeFieldTotal: number;
  aeoCompleted: boolean;
  findingsCount: number;
}): number {
  let score = 25;

  switch (input.readiness) {
    case 'full_data':
      score += 35;
      break;
    case 'search_console_only':
    case 'ga4_only':
      score += 20;
      break;
    case 'no_data':
      score += 5;
      break;
    default: {
      const _exhaustive: never = input.readiness;
      void _exhaustive;
    }
  }

  score += Math.min(20, input.pagesCrawled * 2);
  if (input.intakeFieldTotal > 0) {
    score += Math.round((input.intakeFieldCount / input.intakeFieldTotal) * 15);
  }
  if (input.aeoCompleted) score += 10;
  score += Math.min(10, input.findingsCount);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function countFilledIntakeFields(intake: Record<string, unknown> | null): {
  filled: number;
  total: number;
} {
  const keys = [
    'business_type',
    'primary_offer',
    'secondary_offers',
    'primary_icp',
    'secondary_icps',
    'conversion_goal',
    'trust_proof_assets',
    'site_type',
    'nextgrid_notes',
    'pricing_context',
    'engagement_interest',
    'icp_notes',
    'product_notes',
    'offer_notes',
    'proof_notes',
  ];
  if (!intake) return { filled: 0, total: keys.length };
  const filled = keys.filter((key) => {
    const value = intake[key];
    return typeof value === 'string' && value.trim().length > 0;
  }).length;
  return { filled, total: keys.length };
}
