import { getSupabaseAdmin } from '@/lib/supabase/server';
import {
  getAuthorizedClient,
  GOOGLE_ADS_SCOPE,
  GOOGLE_ANALYTICS_SCOPE,
  GOOGLE_SEARCH_CONSOLE_SCOPE,
} from '@/lib/google/oauth';
import { listGa4Properties } from '@/lib/google/ga4';
import { listSearchConsoleSites } from '@/lib/google/search-console';
import { listAccessibleAdsCustomers } from '@/lib/google/ads';
import {
  loadSource,
  type SourceOutcome,
  type SourceSyncResult,
} from '@/lib/google/source-sync';
import { extractDomain, normalizeWebsiteUrl } from '@/lib/utils/urls';
import type { GoogleConnection } from '@/lib/supabase/types';

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

/**
 * List every GSC / GA4 / Ads property visible to this user's own connected
 * Google account and cache it on their connection row.
 */
export async function syncGoogleConnectionInventory(userId: string): Promise<{
  connectionId: string;
  inventory: GoogleConnectionInventory;
  syncedAt: string;
  sources: { gsc: SourceSyncResult; ga4: SourceSyncResult; ads: SourceSyncResult };
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
  const granted = (scope: string) => scopes.includes(scope);
  const previous = (connection as GoogleConnection & { inventory?: GoogleConnectionInventory | null })
    .inventory;

  // Each source stands alone, as in the property sync: one denied or failing API
  // must not blank the others.
  const [gsc, ga4, ads] = await Promise.all([
    loadSource({
      label: 'Search Console',
      granted: granted(GOOGLE_SEARCH_CONSOLE_SCOPE),
      load: async () =>
        (await listSearchConsoleSites(auth)).map((site) => ({
          siteUrl: site.siteUrl,
          permissionLevel: site.permissionLevel ?? null,
        })),
    }),
    loadSource({
      label: 'GA4',
      granted: granted(GOOGLE_ANALYTICS_SCOPE),
      load: async () =>
        (await listGa4Properties(auth)).map((property) => ({
          propertyId: property.propertyId,
          propertyName: property.propertyName,
          accountName: property.accountName,
        })),
    }),
    loadSource({
      label: 'Google Ads',
      granted: granted(GOOGLE_ADS_SCOPE),
      load: async () =>
        (await listAccessibleAdsCustomers(accessToken)).map((account) => ({
          customerId: account.customerId,
          descriptiveName: account.descriptiveName,
          currencyCode: account.currencyCode ?? null,
          timeZone: account.timeZone ?? null,
        })),
    }),
  ]);

  const inventory: GoogleConnectionInventory = {
    gsc: keepOrClear(gsc, previous?.gsc),
    ga4: keepOrClear(ga4, previous?.ga4),
    ads: keepOrClear(ads, previous?.ads),
  };

  const syncedAt = new Date().toISOString();
  const { error } = await supabase
    .from('google_connections')
    .update({
      inventory,
      inventory_synced_at: syncedAt,
      updated_at: syncedAt,
    })
    .eq('id', connection.id);
  if (error) throw new Error(error.message);

  return {
    connectionId: connection.id,
    inventory,
    syncedAt,
    sources: { gsc: gsc.result, ga4: ga4.result, ads: ads.result },
  };
}

/** Fresh rows when the call worked; cleared when unticked; otherwise keep the last list. */
function keepOrClear<T>(outcome: SourceOutcome<T>, previousRows: T[] | undefined): T[] {
  if (outcome.rows) return outcome.rows;
  return outcome.result.status === 'missing_scope' ? [] : (previousRows ?? []);
}
