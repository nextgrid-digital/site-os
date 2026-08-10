import { cache } from 'react';
import { refreshAccessToken } from '@/lib/google/oauth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  AeoAnalysisRow,
  ArchitectureInput,
  AuditRun,
  ChannelTrafficRow,
  Finding,
  Ga4Property,
  GoogleAdsAccount,
  GoogleConnection,
  GraphWorkOrder,
  Lead,
  LeadFunnelSummary,
  LeadStage,
  LeadStatus,
  LeadStatusHistory,
  Note,
  PricingPlan,
  Project,
  ProjectLeadReportingSummary,
  ProjectOverview,
  ReportExport,
  SearchConsoleProperty,
  Website,
} from '@/lib/supabase/types';
import { extractDomain, normalizeWebsiteUrl } from '@/lib/utils/urls';

export async function listProjects(): Promise<Project[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProject(input: { name: string; websiteUrl: string }) {
  const supabase = getSupabaseAdmin();
  const url = normalizeWebsiteUrl(input.websiteUrl);
  const domain = extractDomain(url);

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name: input.name.trim(), status: 'active' })
    .select('*')
    .single();
  if (error || !project) throw new Error(error?.message ?? 'Failed to create project.');

  const { error: websiteError } = await supabase.from('websites').insert({
    project_id: project.id,
    url,
    domain,
  });
  if (websiteError) throw new Error(websiteError.message);

  await supabase.from('architecture_inputs').insert({ project_id: project.id });
  return project as Project;
}

export const getProjectOverview = cache(async (projectId: string): Promise<ProjectOverview | null> => {
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
  if (!project) return null;

  const [
    { data: website },
    { data: latestAudit },
    { data: gsc },
    { data: ga4 },
    { data: ads },
    { data: connection },
  ] = await Promise.all([
      supabase.from('websites').select('*').eq('project_id', projectId).maybeSingle(),
      supabase
        .from('audit_runs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('search_console_properties')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_selected', true)
        .maybeSingle(),
      supabase.from('ga4_properties').select('*').eq('project_id', projectId).eq('is_selected', true).maybeSingle(),
      supabase
        .from('google_ads_accounts')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_selected', true)
        .maybeSingle(),
      supabase.from('google_connections').select('id').limit(1).maybeSingle(),
    ]);

  return {
    ...(project as Project),
    website: (website as Website | null) ?? null,
    latest_audit: (latestAudit as AuditRun | null) ?? null,
    gsc_property: (gsc as SearchConsoleProperty | null) ?? null,
    ga4_property: (ga4 as Ga4Property | null) ?? null,
    ads_account: (ads as GoogleAdsAccount | null) ?? null,
    google_connected: Boolean(connection),
  };
});

export async function updateProjectWebsite(projectId: string, websiteUrl: string) {
  const supabase = getSupabaseAdmin();
  const url = normalizeWebsiteUrl(websiteUrl);
  const domain = extractDomain(url);
  const { error } = await supabase
    .from('websites')
    .upsert({ project_id: projectId, url, domain }, { onConflict: 'project_id' });
  if (error) throw new Error(error.message);
}

export async function saveArchitectureInputs(
  projectId: string,
  input: Partial<
    Pick<
      ArchitectureInput,
      | 'icp_notes'
      | 'product_notes'
      | 'offer_notes'
      | 'proof_notes'
      | 'business_type'
      | 'primary_offer'
      | 'secondary_offers'
      | 'primary_icp'
      | 'secondary_icps'
      | 'conversion_goal'
      | 'trust_proof_assets'
      | 'site_type'
      | 'nextgrid_notes'
      | 'pricing_context'
      | 'engagement_interest'
    >
  >
) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('architecture_inputs')
    .upsert(
      {
        project_id: projectId,
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    );
  if (error) throw new Error(error.message);
}

export const getArchitectureInputs = cache(async (projectId: string) => {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('architecture_inputs').select('*').eq('project_id', projectId).maybeSingle();
  return (data as ArchitectureInput | null) ?? null;
});

export async function listAuditRuns(projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_runs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as AuditRun[]) ?? [];
}

export const getLatestCompletedAudit = cache(async (projectId: string) => {
  const supabase = getSupabaseAdmin();
  const { data: auditRun } = await supabase
    .from('audit_runs')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!auditRun) return null;

  const [
    { data: metrics },
    { data: findings },
    { data: pricing },
    { data: architecture },
    { data: queryMetrics },
    { data: report },
    { data: aeo },
  ] = await Promise.all([
    supabase.from('audit_metrics').select('*').eq('audit_run_id', auditRun.id).maybeSingle(),
    supabase
      .from('findings')
      .select('*')
      .eq('audit_run_id', auditRun.id)
      .order('priority_score', { ascending: false })
      .limit(100),
    supabase.from('pricing_plans').select('*').eq('audit_run_id', auditRun.id).maybeSingle(),
    supabase.from('architecture_recommendations').select('*').eq('audit_run_id', auditRun.id),
    supabase
      .from('query_metrics')
      .select('*')
      .eq('audit_run_id', auditRun.id)
      .limit(200),
    supabase
      .from('report_exports')
      .select('id, audit_run_id, format, created_at, snapshot')
      .eq('audit_run_id', auditRun.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('aeo_analyses').select('*').eq('audit_run_id', auditRun.id).maybeSingle(),
  ]);

  return {
    auditRun: auditRun as AuditRun,
    metrics,
    findings: (findings as Finding[]) ?? [],
    pricing: (pricing as PricingPlan | null) ?? null,
    architecture: architecture ?? [],
    queryMetrics: queryMetrics ?? [],
    report: (report as ReportExport | null) ?? null,
    aeo: (aeo as AeoAnalysisRow | null) ?? null,
    growthBrief:
      report && typeof report.snapshot === 'object' && report.snapshot && 'growthBrief' in report.snapshot
        ? (report.snapshot as { growthBrief?: unknown }).growthBrief ?? null
        : null,
  };
});

export const getWorkOrdersForAudit = cache(async (auditRunId: string): Promise<GraphWorkOrder[]> => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('graph_work_orders')
    .select('*')
    .eq('audit_run_id', auditRunId)
    .order('priority_score', { ascending: false });
  if (error) {
    // Migrations 007–009 may not be applied yet — fall back to brief snapshot work orders.
    const message = error.message.toLowerCase();
    if (
      message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('could not find the table')
    ) {
      return [];
    }
    throw new Error(error.message);
  }
  return (data as GraphWorkOrder[]) ?? [];
});

export async function updateWorkOrderStatus(
  projectId: string,
  workOrderId: string,
  status: 'open' | 'done' | 'skipped'
): Promise<GraphWorkOrder> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('graph_work_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', workOrderId)
    .eq('project_id', projectId)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Work order not found.');
  return data as GraphWorkOrder;
}

export type ProjectWorkspace = {
  project: ProjectOverview;
  audit: Awaited<ReturnType<typeof getLatestCompletedAudit>>;
  intake: ArchitectureInput | null;
};

export const getProjectWorkspace = cache(async (projectId: string): Promise<ProjectWorkspace | null> => {
  const [project, audit, intake] = await Promise.all([
    getProjectOverview(projectId),
    getLatestCompletedAudit(projectId),
    getArchitectureInputs(projectId),
  ]);
  if (!project) return null;
  return { project, audit, intake };
});

export async function getFindingDetail(projectId: string, findingId: string) {
  const supabase = getSupabaseAdmin();
  const { data: finding } = await supabase
    .from('findings')
    .select('*')
    .eq('id', findingId)
    .eq('project_id', projectId)
    .maybeSingle();
  if (!finding) return null;

  const { data: prompt } = await supabase
    .from('agent_prompts')
    .select('*')
    .eq('finding_id', findingId)
    .maybeSingle();

  return { finding: finding as Finding, prompt };
}

export async function listRecentAuditRuns(limit = 8) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('audit_runs')
    .select('*, projects(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function saveNote(projectId: string, body: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('notes')
    .insert({ project_id: projectId, body })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Note;
}

export async function listNotes(projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return (data as Note[]) ?? [];
}

type LeadDraft = {
  name: string;
  email?: string | null;
  company?: string | null;
  channel?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  stage?: LeadStage;
  status?: LeadStatus;
  value?: number | null;
  notes?: string | null;
};

function normalizeLeadText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeLeadChannel(channel?: string | null) {
  return channel?.trim() || 'direct';
}

async function getProjectConnection(connectionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('google_connections').select('*').eq('id', connectionId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as GoogleConnection | null) ?? null;
}

async function getFreshAccessToken(connectionId: string) {
  const supabase = getSupabaseAdmin();
  const connection = await getProjectConnection(connectionId);
  if (!connection) return null;

  const expiry = connection.token_expiry ? new Date(connection.token_expiry).getTime() : 0;
  const isExpired = expiry > 0 && expiry < Date.now() + 60_000;
  if (!isExpired || !connection.refresh_token) return connection.access_token;

  try {
    const refreshed = await refreshAccessToken(connection.refresh_token);
    await supabase
      .from('google_connections')
      .update({
        access_token: refreshed.access_token,
        token_expiry: refreshed.expiry_date ? new Date(refreshed.expiry_date).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);
    return refreshed.access_token ?? connection.access_token;
  } catch {
    // Token revoked or expired (common in Testing mode) — return null so callers degrade gracefully.
    return null;
  }
}

function summarizeLeads(leads: Lead[]): LeadFunnelSummary {
  const byChannel = new Map<string, { count: number; openCount: number; closedCount: number; totalValue: number }>();
  const byStage = new Map<LeadStage, number>([
    ['new', 0],
    ['qualified', 0],
    ['proposal', 0],
    ['won', 0],
    ['lost', 0],
  ]);
  const byStatus = new Map<LeadStatus, number>([
    ['open', 0],
    ['follow_up', 0],
    ['stalled', 0],
    ['closed', 0],
  ]);

  let openLeads = 0;
  let closedLeads = 0;
  let totalValue = 0;

  for (const lead of leads) {
    const channel = lead.channel || 'direct';
    const existing = byChannel.get(channel) ?? { count: 0, openCount: 0, closedCount: 0, totalValue: 0 };
    existing.count += 1;
    existing.totalValue += lead.value ?? 0;
    if (lead.status === 'closed') {
      existing.closedCount += 1;
      closedLeads += 1;
    } else {
      existing.openCount += 1;
      openLeads += 1;
    }
    byChannel.set(channel, existing);

    byStage.set(lead.stage, (byStage.get(lead.stage) ?? 0) + 1);
    byStatus.set(lead.status, (byStatus.get(lead.status) ?? 0) + 1);
    totalValue += lead.value ?? 0;
  }

  return {
    byChannel: Array.from(byChannel.entries())
      .map(([channel, value]) => ({ channel, ...value }))
      .sort((a, b) => b.count - a.count),
    byStage: Array.from(byStage.entries()).map(([stage, count]) => ({ stage, count })),
    byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })),
    totalLeads: leads.length,
    openLeads,
    closedLeads,
    totalValue,
  };
}

async function getLatestTrafficByChannelSnapshot(projectId: string): Promise<ChannelTrafficRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('report_exports')
    .select('snapshot')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const snapshot = data?.snapshot;
  if (
    snapshot &&
    typeof snapshot === 'object' &&
    'trafficByChannel' in snapshot &&
    Array.isArray((snapshot as { trafficByChannel?: unknown }).trafficByChannel)
  ) {
    return ((snapshot as { trafficByChannel?: unknown }).trafficByChannel as ChannelTrafficRow[]) ?? [];
  }

  return [];
}

function isMissingRelationError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('schema cache') ||
    normalized.includes('does not exist') ||
    normalized.includes('could not find the table')
  );
}

export async function listLeads(projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) {
    // Migration 010 may not be applied yet — keep overview/report usable.
    if (isMissingRelationError(error.message)) return [];
    throw new Error(error.message);
  }
  return (data as Lead[]) ?? [];
}

export async function createLead(projectId: string, input: LeadDraft) {
  const supabase = getSupabaseAdmin();
  const payload = {
    project_id: projectId,
    name: input.name.trim(),
    email: normalizeLeadText(input.email),
    company: normalizeLeadText(input.company),
    channel: normalizeLeadChannel(input.channel),
    source: normalizeLeadText(input.source),
    medium: normalizeLeadText(input.medium),
    campaign: normalizeLeadText(input.campaign),
    stage: input.stage ?? 'new',
    status: input.status ?? 'open',
    value: input.value ?? null,
    notes: normalizeLeadText(input.notes),
  };
  const { data, error } = await supabase.from('leads').insert(payload).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to create lead.');

  await supabase.from('lead_status_history').insert({
    lead_id: data.id,
    project_id: projectId,
    from_stage: null,
    to_stage: data.stage,
    from_status: null,
    to_status: data.status,
  });

  return data as Lead;
}

export async function updateLead(projectId: string, leadId: string, input: Partial<LeadDraft>) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from('leads')
    .select('*')
    .eq('project_id', projectId)
    .eq('id', leadId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (!existing) throw new Error('Lead not found.');

  const nextStage = input.stage ?? (existing.stage as LeadStage);
  const nextStatus = input.status ?? (existing.status as LeadStatus);
  const updatePayload = {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.email !== undefined ? { email: normalizeLeadText(input.email) } : {}),
    ...(input.company !== undefined ? { company: normalizeLeadText(input.company) } : {}),
    ...(input.channel !== undefined ? { channel: normalizeLeadChannel(input.channel) } : {}),
    ...(input.source !== undefined ? { source: normalizeLeadText(input.source) } : {}),
    ...(input.medium !== undefined ? { medium: normalizeLeadText(input.medium) } : {}),
    ...(input.campaign !== undefined ? { campaign: normalizeLeadText(input.campaign) } : {}),
    ...(input.stage !== undefined ? { stage: nextStage } : {}),
    ...(input.status !== undefined ? { status: nextStatus } : {}),
    ...(input.value !== undefined ? { value: input.value } : {}),
    ...(input.notes !== undefined ? { notes: normalizeLeadText(input.notes) } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('leads')
    .update(updatePayload)
    .eq('project_id', projectId)
    .eq('id', leadId)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update lead.');

  if (existing.stage !== nextStage || existing.status !== nextStatus) {
    await supabase.from('lead_status_history').insert({
      lead_id: leadId,
      project_id: projectId,
      from_stage: existing.stage,
      to_stage: nextStage,
      from_status: existing.status,
      to_status: nextStatus,
    });
  }

  return data as Lead;
}

export async function listLeadStatusHistory(projectId: string, leadId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('lead_status_history')
    .select('*')
    .eq('project_id', projectId)
    .eq('lead_id', leadId)
    .order('changed_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as LeadStatusHistory[]) ?? [];
}

export const getProjectLeadReportingSummary = cache(
  async (projectId: string, preloadedLeads?: Lead[]): Promise<ProjectLeadReportingSummary> => {
    const [trafficByChannel, leads] = await Promise.all([
      getLatestTrafficByChannelSnapshot(projectId),
      preloadedLeads ? Promise.resolve(preloadedLeads) : listLeads(projectId),
    ]);

    return {
      trafficByChannel,
      leadSummary: summarizeLeads(leads),
    };
  }
);

export const getGoogleConnection = cache(async (): Promise<GoogleConnection | null> => {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('google_connections')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as GoogleConnection | null) ?? null;
});

export const listPropertyOptions = cache(async (projectId: string) => {
  const supabase = getSupabaseAdmin();
  const [{ data: gsc }, { data: ga4 }, { data: ads }] = await Promise.all([
    supabase.from('search_console_properties').select('*').eq('project_id', projectId),
    supabase.from('ga4_properties').select('*').eq('project_id', projectId),
    supabase.from('google_ads_accounts').select('*').eq('project_id', projectId),
  ]);
  return {
    gsc: (gsc as SearchConsoleProperty[]) ?? [],
    ga4: (ga4 as Ga4Property[]) ?? [],
    ads: (ads as GoogleAdsAccount[]) ?? [],
  };
});

/** Site-OS is fully free: full audit / connect access is always unlocked. */
export function isFullBriefUnlocked(_project: Pick<Project, 'full_brief_unlocked_at'>) {
  return true;
}

export class SiteDeleteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SiteDeleteError';
    this.status = status;
  }
}

/**
 * Remove a site from the signed-in user's dashboard.
 * Deletes their unlocked audit_sessions for the project; if no unlocked
 * sessions remain for anyone, deletes the project (cascade).
 */
export async function deleteProjectForUser(userId: string, projectId: string) {
  const supabase = getSupabaseAdmin();

  const { data: owned, error: ownedError } = await supabase
    .from('audit_sessions')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .not('full_unlocked_at', 'is', null)
    .limit(1);

  if (ownedError) throw new Error(ownedError.message);
  if (!owned?.length) {
    throw new SiteDeleteError('Site not found or you do not have access.', 404);
  }

  const { error: deleteSessionsError } = await supabase
    .from('audit_sessions')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (deleteSessionsError) throw new Error(deleteSessionsError.message);

  const { data: remaining, error: remainingError } = await supabase
    .from('audit_sessions')
    .select('id')
    .eq('project_id', projectId)
    .not('full_unlocked_at', 'is', null)
    .not('user_id', 'is', null)
    .limit(1);

  if (remainingError) throw new Error(remainingError.message);

  if (!remaining?.length) {
    const { error: deleteProjectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    if (deleteProjectError) throw new Error(deleteProjectError.message);
    return { deletedProject: true as const };
  }

  return { deletedProject: false as const };
}

export async function unlockFullBrief(projectId: string) {
  const supabase = getSupabaseAdmin();
  const unlockedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('projects')
    .update({ full_brief_unlocked_at: unlockedAt, updated_at: unlockedAt })
    .eq('id', projectId)
    .is('full_brief_unlocked_at', null)
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (data) return data as Project;

  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (!existing) throw new Error('Project not found.');
  return existing as Project;
}