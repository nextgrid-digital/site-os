import {
  buildConnectorStatuses,
  isAdsDeveloperTokenConfigured,
  type ConnectorStatus,
} from '@/lib/connectors';
import type { ConnectorId } from '@/lib/connectors/types';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function loadProjectConnectorStatuses(projectId: string): Promise<{
  statuses: ConnectorStatus[];
  websiteUrl: string | null;
  googleConnected: boolean;
  googleScopes: string[];
}> {
  const supabase = getSupabaseAdmin();

  const [
    { data: website },
    { data: connection },
    { data: gsc },
    { data: ga4 },
    { data: ads },
    { data: latestRun },
  ] = await Promise.all([
    supabase.from('websites').select('url').eq('project_id', projectId).maybeSingle(),
    supabase
      .from('google_connections')
      .select('id, scopes')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('search_console_properties')
      .select('id, site_url')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .maybeSingle(),
    supabase
      .from('ga4_properties')
      .select('id, property_id, property_name')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .maybeSingle(),
    supabase
      .from('google_ads_accounts')
      .select('id, customer_id, descriptive_name')
      .eq('project_id', projectId)
      .eq('is_selected', true)
      .maybeSingle(),
    supabase
      .from('audit_runs')
      .select('id, completed_at, data_availability, run_type')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const availability =
    latestRun?.data_availability && typeof latestRun.data_availability === 'object'
      ? (latestRun.data_availability as Record<string, unknown>)
      : null;

  const basedOn = Array.isArray(availability?.basedOn)
    ? (availability.basedOn as string[])
    : [];

  const usedInLatestAudit: Partial<Record<ConnectorId, boolean>> = {
    website: basedOn.includes('crawl') || latestRun?.run_type != null,
    search_console: basedOn.includes('search_console') || Boolean(availability?.gscHasData),
    ga4: basedOn.includes('ga4') || Boolean(availability?.ga4HasData),
    google_ads: basedOn.includes('google_ads') || Boolean(availability?.adsHasData),
  };

  const scopes: string[] = Array.isArray(connection?.scopes) ? connection.scopes : [];

  const statuses = buildConnectorStatuses({
    websiteUrl: website?.url ?? null,
    googleConnected: Boolean(connection),
    googleScopes: scopes,
    gscSelected: Boolean(gsc),
    gscLabel: gsc?.site_url ?? null,
    ga4Selected: Boolean(ga4),
    ga4Label: ga4?.property_name || ga4?.property_id || null,
    adsSelected: Boolean(ads),
    adsLabel: ads?.descriptive_name || ads?.customer_id || null,
    adsDeveloperTokenConfigured: isAdsDeveloperTokenConfigured(),
    lastAuditAt: latestRun?.completed_at ?? null,
    usedInLatestAudit,
    dataFlags: {
      gscHasData: typeof availability?.gscHasData === 'boolean' ? availability.gscHasData : undefined,
      ga4HasData: typeof availability?.ga4HasData === 'boolean' ? availability.ga4HasData : undefined,
      adsHasData: typeof availability?.adsHasData === 'boolean' ? availability.adsHasData : undefined,
      pagesCrawled: undefined,
    },
  });

  return {
    statuses,
    websiteUrl: website?.url ?? null,
    googleConnected: Boolean(connection),
    googleScopes: scopes,
  };
}
