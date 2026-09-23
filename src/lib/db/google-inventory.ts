import { getSupabaseAdmin } from '@/lib/supabase/server';
import {
  getAuthorizedClient,
  getOperatorEmail,
  GOOGLE_ADS_SCOPE,
} from '@/lib/google/oauth';
import { listGa4Properties } from '@/lib/google/ga4';
import { listSearchConsoleSites } from '@/lib/google/search-console';
import {
  isGoogleAdsConfigured,
  listAccessibleAdsCustomers,
} from '@/lib/google/ads';
import { extractDomain, normalizeWebsiteUrl } from '@/lib/utils/urls';
import type { GoogleConnection } from '@/lib/supabase/types';
import { selectProperties, syncPropertyOptions } from '@/lib/db/google';
import { claimProjectOwnership, createProject, findOwnedProjectByDomain } from '@/lib/db/projects';
import {
  createAuditSession,
  unlockAuditSession,
} from '@/lib/db/audit-sessions';

export type GoogleInventoryGscSite = {
  siteUrl: string;
  permissionLevel?: string | null;
};

export type GoogleInventoryGa4Property = {
  propertyId: string;
  propertyName: string;
  accountName: string;
};

export type GoogleInventoryAdsAccount = {
  customerId: string;
  descriptiveName: string;
  currencyCode?: string | null;
  timeZone?: string | null;
};

export type GoogleConnectionInventory = {
  gsc: GoogleInventoryGscSite[];
  ga4: GoogleInventoryGa4Property[];
  ads: GoogleInventoryAdsAccount[];
};

export type GoogleInventoryCandidate = {
  domain: string;
  websiteUrl: string;
  gscSiteUrl: string;
  ga4Matches: GoogleInventoryGa4Property[];
  adsMatches: GoogleInventoryAdsAccount[];
  alreadyAdded: boolean;
};

function emptyInventory(): GoogleConnectionInventory {
  return { gsc: [], ga4: [], ads: [] };
}

function parseInventory(raw: unknown): GoogleConnectionInventory {
  if (!raw || typeof raw !== 'object') return emptyInventory();
  const record = raw as Record<string, unknown>;
  return {
    gsc: Array.isArray(record.gsc) ? (record.gsc as GoogleInventoryGscSite[]) : [],
    ga4: Array.isArray(record.ga4) ? (record.ga4 as GoogleInventoryGa4Property[]) : [],
    ads: Array.isArray(record.ads) ? (record.ads as GoogleInventoryAdsAccount[]) : [],
  };
}

/** Normalize GSC property URL / sc-domain: to a registrable-ish hostname. */
export function domainFromGscSiteUrl(siteUrl: string): string | null {
  const trimmed = siteUrl.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase().startsWith('sc-domain:')) {
    return trimmed.slice('sc-domain:'.length).replace(/^www\./, '').toLowerCase() || null;
  }
  try {
    return extractDomain(normalizeWebsiteUrl(trimmed)).toLowerCase();
  } catch {
    return null;
  }
}

export function websiteUrlFromGscSiteUrl(siteUrl: string): string {
  const trimmed = siteUrl.trim();
  if (trimmed.toLowerCase().startsWith('sc-domain:')) {
    return `https://${trimmed.slice('sc-domain:'.length).replace(/^www\./, '')}`;
  }
  try {
    return normalizeWebsiteUrl(trimmed);
  } catch {
    return `https://${trimmed.replace(/^www\./, '')}`;
  }
}

function textMentionsDomain(text: string, domain: string): boolean {
  const hay = text.toLowerCase();
  const needle = domain.toLowerCase();
  if (!needle) return false;
  if (hay.includes(needle)) return true;
  const bare = needle.split('.')[0];
  return bare.length >= 4 && hay.includes(bare);
}

/** Most recently updated Google connection among projects this user owns. */
export async function getLatestGoogleConnectionForUser(userId: string): Promise<GoogleConnection | null> {
  const supabase = getSupabaseAdmin();
  const { data: ownedProjects } = await supabase.from('projects').select('id').eq('user_id', userId);
  const projectIds = (ownedProjects ?? []).map((p) => p.id);
  if (projectIds.length === 0) return null;

  const { data } = await supabase
    .from('google_connections')
    .select('*')
    .in('project_id', projectIds)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as GoogleConnection | null) ?? null;
}

/** Attach a copy of the user's own most recent connection to a project that
 *  doesn't have one yet — used when adding a site from inventory, since that
 *  project was never taken through its own OAuth round trip. */
export async function attachUserConnectionToProject(projectId: string, userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('google_connections')
    .select('id')
    .eq('project_id', projectId)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const source = await getLatestGoogleConnectionForUser(userId);
  if (!source) throw new Error('Connect Google before adding a site from inventory.');

  const { data: inserted, error } = await supabase
    .from('google_connections')
    .insert({
      project_id: projectId,
      operator_email: source.operator_email,
      access_token: source.access_token,
      refresh_token: source.refresh_token,
      token_expiry: source.token_expiry,
      scopes: source.scopes,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return inserted.id;
}

/**
 * List every GSC / GA4 / Ads property visible to this user's own connected
 * Google account and cache it on their connection row.
 */
export async function syncGoogleConnectionInventory(userId: string): Promise<{
  connectionId: string;
  inventory: GoogleConnectionInventory;
  syncedAt: string;
}> {
  const supabase = getSupabaseAdmin();
  const connection = await getLatestGoogleConnectionForUser(userId);
  if (!connection) {
    throw new Error('Connect Google before syncing inventory.');
  }

  const auth = getAuthorizedClient({
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
    expiry_date: connection.token_expiry ? new Date(connection.token_expiry).getTime() : null,
  });

  const tokenResponse = await auth.getAccessToken();
  const accessToken =
    typeof tokenResponse === 'string'
      ? tokenResponse
      : tokenResponse?.token ?? connection.access_token;
  if (accessToken && accessToken !== connection.access_token) {
    await supabase
      .from('google_connections')
      .update({
        access_token: accessToken,
        token_expiry: auth.credentials.expiry_date
          ? new Date(auth.credentials.expiry_date).toISOString()
          : connection.token_expiry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);
  }

  const scopes: string[] = Array.isArray(connection.scopes) ? connection.scopes : [];
  const hasAdsScope = scopes.some((s) => s === GOOGLE_ADS_SCOPE || s.includes('adwords'));

  const [gscSites, ga4Properties, adsAccounts] = await Promise.all([
    listSearchConsoleSites(auth),
    listGa4Properties(auth),
    hasAdsScope && isGoogleAdsConfigured()
      ? listAccessibleAdsCustomers(accessToken).catch((error) => {
          console.error('[syncGoogleConnectionInventory] Ads list failed', error);
          return [];
        })
      : Promise.resolve([]),
  ]);

  const inventory: GoogleConnectionInventory = {
    gsc: gscSites.map((site) => ({
      siteUrl: site.siteUrl,
      permissionLevel: site.permissionLevel ?? null,
    })),
    ga4: ga4Properties.map((property) => ({
      propertyId: property.propertyId,
      propertyName: property.propertyName,
      accountName: property.accountName,
    })),
    ads: adsAccounts.map((account) => ({
      customerId: account.customerId,
      descriptiveName: account.descriptiveName,
      currencyCode: account.currencyCode ?? null,
      timeZone: account.timeZone ?? null,
    })),
  };

  const syncedAt = new Date().toISOString();
  const { error } = await supabase
    .from('google_connections')
    .update({
      inventory,
      inventory_synced_at: syncedAt,
      operator_email: connection.operator_email || getOperatorEmail(),
      updated_at: syncedAt,
    })
    .eq('id', connection.id);
  if (error) throw new Error(error.message);

  return { connectionId: connection.id, inventory, syncedAt };
}

export async function getStoredGoogleInventory(userId: string): Promise<{
  connected: boolean;
  operatorEmail: string;
  inventory: GoogleConnectionInventory;
  syncedAt: string | null;
} | null> {
  const connection = await getLatestGoogleConnectionForUser(userId);
  if (!connection) {
    return {
      connected: false,
      operatorEmail: getOperatorEmail(),
      inventory: emptyInventory(),
      syncedAt: null,
    };
  }

  return {
    connected: true,
    operatorEmail: connection.operator_email || getOperatorEmail(),
    inventory: parseInventory(connection.inventory),
    syncedAt: connection.inventory_synced_at ?? null,
  };
}

export async function listGoogleInventoryCandidates(
  userId: string,
  existingDomains: string[] = [],
  preloaded?: Awaited<ReturnType<typeof getStoredGoogleInventory>> | null
): Promise<GoogleInventoryCandidate[]> {
  const stored = preloaded ?? (await getStoredGoogleInventory(userId));
  if (!stored?.connected) return [];

  const existing = new Set(
    existingDomains.map((d) => d.replace(/^www\./, '').toLowerCase()).filter(Boolean)
  );
  const { inventory } = stored;
  const byDomain = new Map<string, GoogleInventoryCandidate>();

  for (const site of inventory.gsc) {
    const domain = domainFromGscSiteUrl(site.siteUrl);
    if (!domain) continue;
    if (byDomain.has(domain)) continue;
    byDomain.set(domain, {
      domain,
      websiteUrl: websiteUrlFromGscSiteUrl(site.siteUrl),
      gscSiteUrl: site.siteUrl,
      ga4Matches: inventory.ga4.filter(
        (p) =>
          textMentionsDomain(p.propertyName, domain) ||
          textMentionsDomain(p.accountName, domain)
      ),
      adsMatches: inventory.ads.filter((a) =>
        textMentionsDomain(a.descriptiveName, domain)
      ),
      alreadyAdded: existing.has(domain),
    });
  }

  return [...byDomain.values()].sort((a, b) => a.domain.localeCompare(b.domain));
}

/**
 * Create (or reuse) a site from a GSC inventory candidate, map matching properties, unlock session.
 */
export async function addSiteFromGoogleInventory(input: {
  gscSiteUrl: string;
  userId: string;
  email: string;
  ga4PropertyId?: string | null;
  adsCustomerId?: string | null;
}): Promise<{ sessionId: string; projectId: string; domain: string }> {
  const websiteUrl = websiteUrlFromGscSiteUrl(input.gscSiteUrl);
  const domain = extractDomain(websiteUrl);
  const supabase = getSupabaseAdmin();

  const ownedProjectId = await findOwnedProjectByDomain(domain, input.userId);

  let projectId: string;
  if (ownedProjectId) {
    projectId = ownedProjectId;
  } else {
    const project = await createProject({ name: domain, websiteUrl, userId: input.userId });
    projectId = project.id;
  }
  await claimProjectOwnership(projectId, input.userId);
  await attachUserConnectionToProject(projectId, input.userId);

  await syncPropertyOptions(projectId);

  const [{ data: gscRows }, { data: ga4Rows }, { data: adsRows }, stored] = await Promise.all([
    supabase
      .from('search_console_properties')
      .select('id, site_url, property_url')
      .eq('project_id', projectId),
    supabase.from('ga4_properties').select('id, property_id').eq('project_id', projectId),
    supabase.from('google_ads_accounts').select('id, customer_id').eq('project_id', projectId),
    getStoredGoogleInventory(input.userId),
  ]);

  const gscMatch =
    (gscRows ?? []).find(
      (row) => row.site_url === input.gscSiteUrl || row.property_url === input.gscSiteUrl
    ) ?? null;

  const ga4Hint =
    input.ga4PropertyId ??
    stored?.inventory.ga4.find(
      (p) =>
        textMentionsDomain(p.propertyName, domain) || textMentionsDomain(p.accountName, domain)
    )?.propertyId ??
    null;
  const adsHint =
    input.adsCustomerId ??
    stored?.inventory.ads.find((a) => textMentionsDomain(a.descriptiveName, domain))
      ?.customerId ??
    null;

  const ga4Match =
    (ga4Rows ?? []).find((row) => (ga4Hint ? row.property_id === ga4Hint : false)) ?? null;
  const adsMatch =
    (adsRows ?? []).find((row) => (adsHint ? row.customer_id === adsHint : false)) ?? null;

  await selectProperties(
    projectId,
    gscMatch?.id ?? null,
    ga4Match?.id ?? null,
    adsMatch?.id ?? null
  );

  const session = await createAuditSession({ projectId, websiteUrl, domain });
  await unlockAuditSession(session.id, {
    userId: input.userId,
    email: input.email,
  });

  return { sessionId: session.id, projectId, domain };
}
