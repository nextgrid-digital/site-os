/**
 * Google Ads API helpers (REST + GAQL).
 * Requires GOOGLE_ADS_DEVELOPER_TOKEN and OAuth scope adwords.
 */

const ADS_API_VERSION = 'v25';
const ADS_BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

export type GoogleAdsAccountOption = {
  customerId: string;
  descriptiveName: string;
  currencyCode: string | null;
  timeZone: string | null;
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

function developerToken() {
  const token = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  if (!token) throw new Error('Missing GOOGLE_ADS_DEVELOPER_TOKEN.');
  return token;
}

function loginCustomerId() {
  const raw = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.trim();
  if (!raw) return null;
  return raw.replace(/-/g, '');
}

function adsHeaders(accessToken: string): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken(),
    'Content-Type': 'application/json',
  };
  const loginId = loginCustomerId();
  if (loginId) headers['login-customer-id'] = loginId;
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

async function adsFetch(path: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(`${ADS_BASE}${path}`, {
    ...init,
    headers: {
      ...adsHeaders(accessToken),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Google Ads API ${response.status}: ${body.slice(0, 400)}`);
  }
  return response;
}

export function isGoogleAdsConfigured() {
  return Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim());
}

export async function listAccessibleAdsCustomers(
  accessToken: string
): Promise<GoogleAdsAccountOption[]> {
  if (!isGoogleAdsConfigured()) return [];

  const listRes = await adsFetch('/customers:listAccessibleCustomers', accessToken, {
    method: 'get',
  });
  const listJson = (await listRes.json()) as { resourceNames?: string[] };
  const rootIds = (listJson.resourceNames ?? [])
    .map((name) => name.replace('customers/', '').replace(/-/g, ''))
    .filter(Boolean);

  const byId = new Map<string, GoogleAdsAccountOption>();

  for (const customerId of rootIds.slice(0, 40)) {
    let isManager = false;
    let managerLabel: GoogleAdsAccountOption | null = null;
    try {
      const rows = await searchGoogleAds(accessToken, customerId, `
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.manager
        FROM customer
        LIMIT 1
      `);
      const customer = rows[0]?.customer as
        | {
            id?: string | number;
            descriptiveName?: string;
            currencyCode?: string;
            timeZone?: string;
            manager?: boolean;
          }
        | undefined;
      isManager = Boolean(customer?.manager);
      const option: GoogleAdsAccountOption = {
        customerId,
        descriptiveName: customer?.descriptiveName
          ? isManager
            ? `${customer.descriptiveName} (MCC)`
            : customer.descriptiveName
          : `Account ${customerId}`,
        currencyCode: customer?.currencyCode ?? null,
        timeZone: customer?.timeZone ?? null,
      };
      if (isManager) managerLabel = option;
      else byId.set(customerId, option);
    } catch {
      // Inaccessible root — skip (do not offer unusable accounts).
      continue;
    }

    if (!isManager) continue;

    let clientCount = 0;
    try {
      const clientRows = await searchGoogleAds(
        accessToken,
        customerId,
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
        LIMIT 100
      `
      );
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
        const rawId = client?.clientCustomer?.replace('customers/', '').replace(/-/g, '');
        if (!rawId || client?.manager) continue;
        clientCount += 1;
        byId.set(rawId, {
          customerId: rawId,
          descriptiveName: client?.descriptiveName || `Account ${rawId}`,
          currencyCode: client?.currencyCode ?? null,
          timeZone: client?.timeZone ?? null,
        });
      }
    } catch (error) {
      console.error('[listAccessibleAdsCustomers] customer_client expand failed', customerId, error);
    }

    // Keep MCC visible so Setup is not empty when no clients are linked yet.
    if (clientCount === 0 && managerLabel) {
      byId.set(customerId, managerLabel);
    }
  }

  return [...byId.values()];
}

type AdsSearchRow = Record<string, unknown>;

async function searchGoogleAds(
  accessToken: string,
  customerId: string,
  query: string
): Promise<AdsSearchRow[]> {
  const cleanId = customerId.replace(/-/g, '');
  const response = await adsFetch(`/customers/${cleanId}/googleAds:search`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ query: query.trim() }),
  });
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
  startDate?: string,
  endDate?: string
): Promise<GoogleAdsBundle> {
  const start = startDate ?? dateDaysAgo(28);
  const end = endDate ?? dateDaysAgo(0);
  const cleanId = customerId.replace(/-/g, '');

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
    `
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
    `
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
    `
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
