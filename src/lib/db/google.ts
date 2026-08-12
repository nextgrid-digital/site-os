import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getOperatorEmail } from '@/lib/google/oauth';
import { listGa4Properties } from '@/lib/google/ga4';
import { getAuthorizedClient } from '@/lib/google/oauth';
import { listSearchConsoleSites } from '@/lib/google/search-console';
import {
  isGoogleAdsConfigured,
  listAccessibleAdsCustomers,
} from '@/lib/google/ads';
import { GOOGLE_ADS_SCOPE } from '@/lib/google/oauth';

export async function upsertGoogleConnection(tokens: {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  scope?: string | null;
}) {
  if (!tokens.access_token) throw new Error('Missing access token from Google.');

  const supabase = getSupabaseAdmin();
  const existing = await supabase.from('google_connections').select('id').limit(1).maybeSingle();

  const payload = {
    operator_email: getOperatorEmail(),
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

export async function syncPropertyOptions(projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data: connection } = await supabase
    .from('google_connections')
    .select('*')
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
  const hasAdsScope = scopes.some((s) => s === GOOGLE_ADS_SCOPE || s.includes('adwords'));

  const [gscSites, ga4Properties, adsAccounts] = await Promise.all([
    listSearchConsoleSites(auth),
    listGa4Properties(auth),
    hasAdsScope && isGoogleAdsConfigured()
      ? listAccessibleAdsCustomers(accessToken).catch((error) => {
          console.error('[syncPropertyOptions] Ads list failed', error);
          return [];
        })
      : Promise.resolve([]),
  ]);

  await supabase.from('search_console_properties').delete().eq('project_id', projectId);
  await supabase.from('ga4_properties').delete().eq('project_id', projectId);
  await supabase.from('google_ads_accounts').delete().eq('project_id', projectId);

  if (gscSites.length > 0) {
    await supabase.from('search_console_properties').insert(
      gscSites.map((site) => ({
        project_id: projectId,
        connection_id: connection.id,
        property_url: site.siteUrl,
        site_url: site.siteUrl,
        is_selected: false,
      }))
    );
  }

  if (ga4Properties.length > 0) {
    await supabase.from('ga4_properties').insert(
      ga4Properties.map((property) => ({
        project_id: projectId,
        connection_id: connection.id,
        property_id: property.propertyId,
        property_name: property.propertyName,
        account_name: property.accountName,
        is_selected: false,
      }))
    );
  }

  if (adsAccounts.length > 0) {
    await supabase.from('google_ads_accounts').insert(
      adsAccounts.map((account) => ({
        project_id: projectId,
        connection_id: connection.id,
        customer_id: account.customerId,
        descriptive_name: account.descriptiveName,
        currency_code: account.currencyCode,
        time_zone: account.timeZone,
        is_selected: false,
      }))
    );
  }
}

export async function selectProperties(
  projectId: string,
  gscPropertyId: string | null,
  ga4PropertyId: string | null,
  adsAccountId: string | null = null
) {
  const supabase = getSupabaseAdmin();

  await supabase.from('search_console_properties').update({ is_selected: false }).eq('project_id', projectId);
  await supabase.from('ga4_properties').update({ is_selected: false }).eq('project_id', projectId);
  await supabase.from('google_ads_accounts').update({ is_selected: false }).eq('project_id', projectId);

  if (gscPropertyId) {
    const { error: gscError } = await supabase
      .from('search_console_properties')
      .update({ is_selected: true })
      .eq('id', gscPropertyId);
    if (gscError) throw new Error(gscError.message);
  }

  if (ga4PropertyId) {
    const { error: ga4Error } = await supabase
      .from('ga4_properties')
      .update({ is_selected: true })
      .eq('id', ga4PropertyId);
    if (ga4Error) throw new Error(ga4Error.message);
  }

  if (adsAccountId) {
    const { error: adsError } = await supabase
      .from('google_ads_accounts')
      .update({ is_selected: true })
      .eq('id', adsAccountId);
    if (adsError) throw new Error(adsError.message);
  }
}
