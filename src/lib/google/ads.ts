/**
 * Google Ads API helpers (REST + GAQL).
 *
 * Ads is read through one agency login (the Google account in OPERATOR_EMAIL) and NextGrid's manager
 * account (GOOGLE_ADS_MCC_ID). Every client account is linked under that MCC by an invite
 * the client accepts. Requests send `login-customer-id`. No developer token (sunset 2026-09-09).
 */

import { refreshAccessToken } from '@/lib/google/oauth';

const ADS_API_VERSION = 'v25';
const ADS_BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

export type GoogleAdsAccountOption = {
  customerId: string;
  descriptiveName: string;
  currencyCode: string | null;
  timeZone: string | null;
  /**
   * Manager (MCC) account the client account is reached through. Requests for that
   * account must send it as `login-customer-id`. Null when the account is reached directly.
   */
  loginCustomerId: string | null;
};

export type AdsCampaignRow = {
  campaignId: string;
  campaignName: string;
  status: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
  ctr: number;
};

export type AdsKeywordRow = {
  keywordText: string;
  matchType: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
};

export type AdsLandingPageRow = {
  unexpandedFinalUrl: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
};

export type GoogleAdsBundle = {
  campaigns: AdsCampaignRow[];
  keywords: AdsKeywordRow[];
  landingPages: AdsLandingPageRow[];
};

export type AdsWasteSignal = {
  kind: 'campaign' | 'keyword';
  label: string;
  spend: number;
  clicks: number;
  conversions: number;
  meaning: string;
};

export type AdsLandingMismatch = {
  landingPath: string;
  finalUrl: string;
  spend: number;
  clicks: number;
  conversions: number;
  pageTitle: string | null;
  meaning: string;
};

function adsHeaders(accessToken: string, loginCustomerId: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  if (loginCustomerId) headers['login-customer-id'] = loginCustomerId;
  return headers;
}

function num(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function microsToCurrency(micros: number) {
  return micros / 1_000_000;
}

function cleanCustomerId(customerId: string) {
  return customerId.replace(/-/g, '');
}

async function adsFetch(
  path: string,
  accessToken: string,
  loginCustomerId: string | null,
  init?: RequestInit
) {
  const response = await fetch(`${ADS_BASE}${path}`, {
    ...init,
    headers: {
      ...adsHeaders(accessToken, loginCustomerId),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Google Ads API ${response.status}: ${body.slice(0, 400)}`);
  }
  return response;
}

/**
 * NextGrid's Google Ads manager (MCC) account ID, digits only. Every account we read
 * is linked under this MCC. Null when unset, which disables Ads.
 */
export function getNextgridMccId(): string | null {
  const raw = process.env.GOOGLE_ADS_MCC_ID?.trim();
  if (!raw) return null;
  const cleaned = cleanCustomerId(raw);
  return /^\d{10}$/.test(cleaned) ? cleaned : null;
}

/**
 * Access token for the agency login (OPERATOR_EMAIL), from the stored refresh
 * token. Null when GOOGLE_ADS_REFRESH_TOKEN is unset, which disables Ads.
 */
export async function getAgencyAdsAccessToken(): Promise<string | null> {
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN?.trim();
  if (!refreshToken) return null;
  const credentials = await refreshAccessToken(refreshToken);
  if (!credentials.access_token) throw new Error('Google returned no access token for the agency login.');
  return credentials.access_token;
}

/**
 * Client accounts linked under NextGrid's MCC. Direct accounts and other agencies'
 * MCCs are never returned.
 */
export async function listAccessibleAdsCustomers(
  accessToken: string
): Promise<GoogleAdsAccountOption[]> {
  const mccId = getNextgridMccId();
  if (!mccId) return [];

  const clientRows = await searchGoogleAds(
    accessToken,
    mccId,
    `
    SELECT
      customer_client.client_customer,
      customer_client.descriptive_name,
      customer_client.currency_code,
      customer_client.time_zone,
      customer_client.manager,
      customer_client.status
    FROM customer_client
    WHERE customer_client.status = 'ENABLED'
      AND customer_client.manager = FALSE
      AND customer_client.level > 0
    LIMIT 500
    `,
    mccId
  );

  const byId = new Map<string, GoogleAdsAccountOption>();
  for (const row of clientRows) {
    const client = row.customerClient as
      | {
          clientCustomer?: string;
          descriptiveName?: string;
          currencyCode?: string;
          timeZone?: string;
          manager?: boolean;
        }
      | undefined;
    const rawId = client?.clientCustomer
      ? cleanCustomerId(client.clientCustomer.replace('customers/', ''))
      : '';
    if (!rawId || client?.manager) continue;
    byId.set(rawId, {
      customerId: rawId,
      descriptiveName: client?.descriptiveName || `Account ${rawId}`,
      currencyCode: client?.currencyCode ?? null,
      timeZone: client?.timeZone ?? null,
      loginCustomerId: mccId,
    });
  }
  return [...byId.values()];
}

/** Client accounts under our MCC, read with the agency login. Empty when Ads is not configured. */
export async function listAgencyAdsAccounts(): Promise<GoogleAdsAccountOption[]> {
  const token = await getAgencyAdsAccessToken();
  if (!token) return [];
  return listAccessibleAdsCustomers(token);
}

export type AdsInviteStatus = 'PENDING' | 'ACTIVE' | 'REFUSED' | 'INACTIVE' | 'NOT_FOUND';

function requireMccId() {
  const mccId = getNextgridMccId();
  if (!mccId) throw new Error('Google Ads is not configured: GOOGLE_ADS_MCC_ID is missing.');
  return mccId;
}

/**
 * Invites a client account to our MCC. The manager creates the link as PENDING, and
 * the client accepts it once in Google Ads → Access and security → Managers.
 */
export async function sendAdsInvite(accessToken: string, customerId: string) {
  const mccId = requireMccId();
  await adsFetch(`/customers/${mccId}/customerClientLinks:mutate`, accessToken, mccId, {
    method: 'POST',
    body: JSON.stringify({
      operations: [
        { create: { clientCustomer: `customers/${cleanCustomerId(customerId)}`, status: 'PENDING' } },
      ],
    }),
  });
}

/** Current link status for a client account under our MCC. NOT_FOUND when no link exists. */
export async function getAdsInviteStatus(accessToken: string, customerId: string): Promise<AdsInviteStatus> {
  const mccId = requireMccId();
  const target = `customers/${cleanCustomerId(customerId)}`;
  const rows = await searchGoogleAds(
    accessToken,
    mccId,
    `
    SELECT
      customer_client_link.client_customer,
      customer_client_link.status
    FROM customer_client_link
    `,
    mccId
  );
  for (const row of rows) {
    const link = row.customerClientLink as { clientCustomer?: string; status?: string } | undefined;
    if (link?.clientCustomer === target && link.status) return link.status as AdsInviteStatus;
  }
  return 'NOT_FOUND';
}

type AdsSearchRow = Record<string, unknown>;

async function searchGoogleAds(
  accessToken: string,
  customerId: string,
  query: string,
  loginCustomerId: string | null = null
): Promise<AdsSearchRow[]> {
  const response = await adsFetch(
    `/customers/${cleanCustomerId(customerId)}/googleAds:search`,
    accessToken,
    loginCustomerId,
    {
      method: 'POST',
      body: JSON.stringify({ query: query.trim() }),
    }
  );
  const json = (await response.json()) as { results?: AdsSearchRow[] };
  return json.results ?? [];
}

function dateDaysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function fetchGoogleAdsBundle(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null = null,
  startDate?: string,
  endDate?: string
): Promise<GoogleAdsBundle> {
  const start = startDate ?? dateDaysAgo(28);
  const end = endDate ?? dateDaysAgo(0);
  const cleanId = cleanCustomerId(customerId);

  const [campaignRows, keywordRows, landingRows] = await Promise.all([
    searchGoogleAds(
      accessToken,
      cleanId,
      `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr
      FROM campaign
      WHERE segments.date BETWEEN '${start}' AND '${end}'
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `,
      loginCustomerId
    ),
    searchGoogleAds(
      accessToken,
      cleanId,
      `
      SELECT
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM keyword_view
      WHERE segments.date BETWEEN '${start}' AND '${end}'
        AND ad_group_criterion.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 80
    `,
      loginCustomerId
    ),
    searchGoogleAds(
      accessToken,
      cleanId,
      `
      SELECT
        landing_page_view.unexpanded_final_url,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM landing_page_view
      WHERE segments.date BETWEEN '${start}' AND '${end}'
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `,
      loginCustomerId
    ),
  ]);

  const campaigns: AdsCampaignRow[] = campaignRows.map((row) => {
    const campaign = row.campaign as { id?: string | number; name?: string; status?: string };
    const metrics = row.metrics as Record<string, unknown>;
    return {
      campaignId: String(campaign?.id ?? ''),
      campaignName: String(campaign?.name ?? 'Campaign'),
      status: String(campaign?.status ?? ''),
      impressions: num(metrics?.impressions),
      clicks: num(metrics?.clicks),
      costMicros: num(metrics?.costMicros ?? metrics?.cost_micros),
      conversions: num(metrics?.conversions),
      ctr: num(metrics?.ctr),
    };
  });

  const keywords: AdsKeywordRow[] = keywordRows.map((row) => {
    const criterion = row.adGroupCriterion as {
      keyword?: { text?: string; matchType?: string };
    };
    const campaign = row.campaign as { name?: string };
    const metrics = row.metrics as Record<string, unknown>;
    return {
      keywordText: String(criterion?.keyword?.text ?? ''),
      matchType: String(criterion?.keyword?.matchType ?? ''),
      campaignName: String(campaign?.name ?? ''),
      impressions: num(metrics?.impressions),
      clicks: num(metrics?.clicks),
      costMicros: num(metrics?.costMicros ?? metrics?.cost_micros),
      conversions: num(metrics?.conversions),
    };
  });

  const landingPages: AdsLandingPageRow[] = landingRows.map((row) => {
    const lp = row.landingPageView as { unexpandedFinalUrl?: string };
    const metrics = row.metrics as Record<string, unknown>;
    return {
      unexpandedFinalUrl: String(lp?.unexpandedFinalUrl ?? ''),
      impressions: num(metrics?.impressions),
      clicks: num(metrics?.clicks),
      costMicros: num(metrics?.costMicros ?? metrics?.cost_micros),
      conversions: num(metrics?.conversions),
    };
  });

  return { campaigns, keywords, landingPages };
}

/** High spend with weak/no conversions. */
export function deriveAdsWasteSignals(bundle: GoogleAdsBundle): AdsWasteSignal[] {
  const signals: AdsWasteSignal[] = [];

  for (const c of bundle.campaigns) {
    const spend = microsToCurrency(c.costMicros);
    if (spend < 20) continue;
    if (c.conversions > 0 && spend / c.conversions < 80) continue;
    signals.push({
      kind: 'campaign',
      label: c.campaignName,
      spend,
      clicks: c.clicks,
      conversions: c.conversions,
      meaning:
        c.conversions <= 0
          ? `Spent ~${spend.toFixed(0)} with no conversions.`
          : `High spend (~${spend.toFixed(0)}) relative to ${c.conversions} conversion(s).`,
    });
  }

  for (const k of bundle.keywords) {
    const spend = microsToCurrency(k.costMicros);
    if (spend < 15 || k.conversions > 0) continue;
    signals.push({
      kind: 'keyword',
      label: k.keywordText || '(empty keyword)',
      spend,
      clicks: k.clicks,
      conversions: k.conversions,
      meaning: `Keyword spend ~${spend.toFixed(0)} with no conversions.`,
    });
  }

  return signals.sort((a, b) => b.spend - a.spend).slice(0, 12);
}

export function deriveAdsLandingMismatches(
  bundle: GoogleAdsBundle,
  pages: Array<{ path: string; title: string | null; h1: string | null }>
): AdsLandingMismatch[] {
  const byPath = new Map(pages.map((p) => [normalizeLandingPath(p.path), p]));
  const mismatches: AdsLandingMismatch[] = [];

  for (const row of bundle.landingPages) {
    const spend = microsToCurrency(row.costMicros);
    if (spend < 10 && row.clicks < 5) continue;
    const path = normalizeLandingPath(row.unexpandedFinalUrl);
    const page = byPath.get(path);
    const weakCopy =
      !page ||
      !page.title ||
      page.title.length < 20 ||
      !page.h1;

    if (row.conversions <= 0 || weakCopy) {
      mismatches.push({
        landingPath: path,
        finalUrl: row.unexpandedFinalUrl,
        spend,
        clicks: row.clicks,
        conversions: row.conversions,
        pageTitle: page?.title ?? null,
        meaning: !page
          ? 'Ad lands on a URL not found in the crawl — check the destination.'
          : row.conversions <= 0
            ? 'Traffic arrives but conversions are flat — intent may not match the page.'
            : 'Landing page copy looks weak vs ad spend — tighten title/H1 to match intent.',
      });
    }
  }

  return mismatches.sort((a, b) => b.spend - a.spend).slice(0, 12);
}

export function normalizeLandingPath(urlOrPath: string) {
  try {
    if (urlOrPath.startsWith('http')) {
      const u = new URL(urlOrPath);
      return (u.pathname || '/').replace(/\/$/, '') || '/';
    }
  } catch {
    // fall through
  }
  const path = urlOrPath.split('?')[0] || '/';
  return path.replace(/\/$/, '') || '/';
}

export function adsBundleHasData(bundle: GoogleAdsBundle) {
  return (
    bundle.campaigns.some((c) => c.impressions > 0 || c.clicks > 0 || c.costMicros > 0) ||
    bundle.keywords.some((k) => k.impressions > 0 || k.clicks > 0) ||
    bundle.landingPages.some((l) => l.impressions > 0 || l.clicks > 0)
  );
}

export function totalAdsSpend(bundle: GoogleAdsBundle) {
  return microsToCurrency(bundle.campaigns.reduce((sum, c) => sum + c.costMicros, 0));
}

export function totalAdsConversions(bundle: GoogleAdsBundle) {
  return bundle.campaigns.reduce((sum, c) => sum + c.conversions, 0);
}
