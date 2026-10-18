import {
  getAdsInviteStatus,
  getAgencyAdsAccessToken,
  sendAdsInvite,
  type AdsInviteStatus,
} from '@/lib/google/ads';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export type AdsInvite = {
  project_id: string;
  customer_id: string;
  status: AdsInviteStatus;
  invited_at: string;
  checked_at: string | null;
};

export function cleanAdsCustomerId(input: string) {
  return input.replace(/[\s-]/g, '');
}

export async function getAdsInvite(projectId: string): Promise<AdsInvite | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('ads_invites')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as AdsInvite | null) ?? null;
}

/** Sends an MCC invite for this project's Ads account and records it as PENDING. */
export async function createAdsInvite(projectId: string, customerId: string): Promise<AdsInvite> {
  const accessToken = await getAgencyAdsAccessToken();
  if (!accessToken) {
    throw new Error('Google Ads is not configured yet. Ask NextGrid to finish the setup.');
  }
  const cleanId = cleanAdsCustomerId(customerId);
  await sendAdsInvite(accessToken, cleanId);

  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('ads_invites')
    .upsert(
      {
        project_id: projectId,
        customer_id: cleanId,
        status: 'PENDING',
        invited_at: now,
        checked_at: null,
        updated_at: now,
      },
      { onConflict: 'project_id' }
    )
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as AdsInvite;
}

/**
 * Re-checks the invite with Google. When the client has accepted, the linked account is
 * selected for the project if nothing else is selected. Call after Sync, so the account row exists.
 */
export async function refreshAdsInvite(projectId: string): Promise<AdsInvite | null> {
  const invite = await getAdsInvite(projectId);
  if (!invite) return null;

  const accessToken = await getAgencyAdsAccessToken();
  if (!accessToken) return invite;

  const status = await getAdsInviteStatus(accessToken, invite.customer_id);
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('ads_invites')
    .update({ status, checked_at: now, updated_at: now })
    .eq('project_id', projectId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  if (status === 'ACTIVE') {
    const { data: selected } = await supabase
      .from('google_ads_accounts')
      .select('id')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .limit(1)
      .maybeSingle();
    if (!selected) {
      await supabase
        .from('google_ads_accounts')
        .update({ is_selected: true })
        .eq('project_id', projectId)
        .eq('customer_id', invite.customer_id);
    }
  }

  return data as AdsInvite;
}
