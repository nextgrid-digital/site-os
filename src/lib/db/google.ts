import { getSupabaseAdmin } from '@/lib/supabase/server';
import { listGa4Properties } from '@/lib/google/ga4';
import {
  GOOGLE_ADS_SCOPE,
  GOOGLE_ANALYTICS_SCOPE,
  GOOGLE_SEARCH_CONSOLE_SCOPE,
  getAuthorizedClient,
} from '@/lib/google/oauth';
import { listSearchConsoleSites } from '@/lib/google/search-console';
import { listAgencyAdsAccounts } from '@/lib/google/ads';
import { loadSource, type SourceSyncResult } from '@/lib/google/source-sync';

export async function upsertGoogleConnection(
  projectId: string,
  tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
    scope?: string | null;
  },
  /** Email of the Google account the client signed in with. Stored in `operator_email` (legacy column name). */
  accountEmail: string | null = null
) {
  if (!tokens.access_token) throw new Error('Missing access token from Google.');

  const supabase = getSupabaseAdmin();
  const existing = await supabase
    .from('google_connections')
    .select('id')
    .eq('project_id', projectId)
    .limit(1)
    .maybeSingle();

  const payload = {
    project_id: projectId,
    operator_email: accountEmail ?? '',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    scopes: tokens.scope ? tokens.scope.split(' ') : [],
    updated_at: new Date().toISOString(),
  };

  if (existing.data?.id) {
    const { data, error } = await supabase
      .from('google_connections')
      .update(payload)
      .eq('id', existing.data.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase.from('google_connections').insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export type PropertySyncResult = {
  gsc: SourceSyncResult;
  ga4: SourceSyncResult;
  ads: SourceSyncResult;
};

type SourceRow = { key: string; values: Record<string, string | null> };
type SourceTable = 'search_console_properties' | 'ga4_properties' | 'google_ads_accounts';

/**
 * Replace one source's rows with what Google just returned, keeping the saved
 * selection for properties that still exist. A missing scope clears the source
 * (we can no longer read it); an error leaves the last good list in place.
 */
async function applySourceRows(
  table: SourceTable,
  keyColumn: string,
  projectId: string,
  connectionId: string,
  outcome: { result: SourceSyncResult; rows: SourceRow[] | null }
) {
  const supabase = getSupabaseAdmin();

  if (outcome.result.status === 'missing_scope') {
    await supabase.from(table).delete().eq('project_id', projectId);
    return;
  }
  if (!outcome.rows) return;

  const { data: selectedRows } = await supabase
    .from(table)
    .select(keyColumn)
    .eq('project_id', projectId)
    .eq('is_selected', true);
  const selectedKeys = new Set(
    (selectedRows ?? []).map((row) => String((row as unknown as Record<string, unknown>)[keyColumn]))
  );

  await supabase.from(table).delete().eq('project_id', projectId);
  if (outcome.rows.length === 0) return;

  const { error } = await supabase.from(table).insert(
    outcome.rows.map((row) => ({
      project_id: projectId,
      connection_id: connectionId,
      [keyColumn]: row.key,
      ...row.values,
      is_selected: selectedKeys.has(row.key),
    }))
  );
  if (error) throw new Error(error.message);
}

export async function syncPropertyOptions(projectId: string): Promise<PropertySyncResult> {
  const supabase = getSupabaseAdmin();
  const { data: connection } = await supabase
    .from('google_connections')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!connection) throw new Error('Connect Google before syncing properties.');

  const auth = getAuthorizedClient({
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
    expiry_date: connection.token_expiry ? new Date(connection.token_expiry).getTime() : null,
  });

  // Refresh so Ads REST calls (which use a bearer string) get a live token.
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

  // Each source is independent: one denied or failing source must not block the others.
  const [gsc, ga4, ads] = await Promise.all([
    loadSource({
      label: 'Search Console',
      granted: granted(GOOGLE_SEARCH_CONSOLE_SCOPE),
      load: async () =>
        (await listSearchConsoleSites(auth))
          .filter((site) => site.siteUrl)
          .map((site) => ({ key: site.siteUrl as string, values: { site_url: site.siteUrl ?? null } })),
    }),
    loadSource({
      label: 'GA4',
      granted: granted(GOOGLE_ANALYTICS_SCOPE),
      load: async () =>
        (await listGa4Properties(auth)).map((property) => ({
          key: property.propertyId,
          values: {
            property_id: property.propertyId,
            property_name: property.propertyName ?? null,
            account_name: property.accountName ?? null,
          },
        })),
    }),
    loadSource({
      label: 'Google Ads',
      granted: true,
      load: async () =>
        (await listAgencyAdsAccounts()).map((account) => ({
          key: account.customerId,
          values: {
            customer_id: account.customerId,
            descriptive_name: account.descriptiveName ?? null,
            currency_code: account.currencyCode ?? null,
            time_zone: account.timeZone ?? null,
            login_customer_id: account.loginCustomerId,
          },
        })),
    }),
  ]);

  await applySourceRows('search_console_properties', 'property_url', projectId, connection.id, gsc);
  await applySourceRows('ga4_properties', 'property_id', projectId, connection.id, ga4);
  await applySourceRows('google_ads_accounts', 'customer_id', projectId, connection.id, ads);

  return { gsc: gsc.result, ga4: ga4.result, ads: ads.result };
}

export async function selectProperties(
  projectId: string,
  gscPropertyId: string | null,
  ga4PropertyId: string | null,
  adsAccountId: string | null = null
) {
  const supabase = getSupabaseAdmin();

  // Select the new row first, then clear the rest, so a concurrent read never
  // sees the project with no selected property in between.
  const swap = async (
    table: 'search_console_properties' | 'ga4_properties' | 'google_ads_accounts',
    selectedId: string | null
  ) => {
    if (selectedId) {
      const { error } = await supabase
        .from(table)
        .update({ is_selected: true })
        .eq('id', selectedId);
      if (error) throw new Error(error.message);
    }
    const clear = supabase
      .from(table)
      .update({ is_selected: false })
      .eq('project_id', projectId);
    const { error: clearError } = selectedId
      ? await clear.neq('id', selectedId)
      : await clear;
    if (clearError) throw new Error(clearError.message);
  };

  await swap('search_console_properties', gscPropertyId);
  await swap('ga4_properties', ga4PropertyId);
  await swap('google_ads_accounts', adsAccountId);
}
