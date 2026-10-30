import { cache } from 'react';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { anonSessionIdsFromCookies, canAccessProject } from '@/lib/db/project-access';
import { createClient } from '@/utils/supabase/server';
import type {
  AeoAnalysisRow,
  AgentPrompt,
  ArchitectureInput,
  AuditRun,
  Finding,
  FindingStatus,
  Ga4Property,
  GoogleAdsAccount,
  GoogleConnection,
  GraphWorkOrder,
  Note,
  Project,
  ProjectOverview,
  ReportExport,
  SearchConsoleProperty,
  Website,
} from '@/lib/supabase/types';
import { extractDomain, normalizeWebsiteUrl } from '@/lib/utils/urls';

export async function createProject(input: { name: string; websiteUrl: string; userId?: string | null }) {
  const supabase = getSupabaseAdmin();
  const url = normalizeWebsiteUrl(input.websiteUrl);
  const domain = extractDomain(url);

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name: input.name.trim(), status: 'active', user_id: input.userId ?? null })
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

/** Find a project this user already owns for a domain, so re-auditing the same
 *  site reuses their own history instead of colliding with another customer's. */
export async function findOwnedProjectByDomain(domain: string, userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: websites } = await supabase.from('websites').select('project_id').eq('domain', domain);
  const projectIds = (websites ?? []).map((w) => w.project_id);
  if (projectIds.length === 0) return null;

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .in('id', projectIds)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return project?.id ?? null;
}

/** Tables holding per-audit results. Moved onto the owner's existing project when a
 *  pre-signup audit duplicates a site they already have. `audit_sessions`, `audit_runs`
 *  and `findings` are required; the rest are best-effort (a unique constraint on the
 *  target may refuse the move, in which case the rows are dropped with the duplicate). */
const REQUIRED_MERGE_TABLES = ['audit_sessions', 'audit_runs', 'findings'] as const;
const OPTIONAL_MERGE_TABLES = [
  'architecture_recommendations',
  'report_exports',
  'graph_entities',
  'graph_relationships',
  'graph_gaps',
  'buyer_paths',
  'graph_work_orders',
  'evidence_records',
  'company_identity_fields',
  'company_descriptions',
  'brand_associations',
  'brand_claims',
  'buyer_question_coverage',
  'content_coverage',
  'technical_observations',
  'brand_contradictions',
  'external_sources',
  'prompt_runs',
  'competitor_observations',
  'historical_changes',
] as const;

async function mergeProjectInto(fromProjectId: string, toProjectId: string) {
  const supabase = getSupabaseAdmin();
  for (const table of REQUIRED_MERGE_TABLES) {
    const { error } = await supabase.from(table).update({ project_id: toProjectId }).eq('project_id', fromProjectId);
    if (error) throw new Error(`Failed to merge ${table}: ${error.message}`);
  }
  for (const table of OPTIONAL_MERGE_TABLES) {
    await supabase.from(table).update({ project_id: toProjectId }).eq('project_id', fromProjectId);
  }
  // Remaining setup rows (website, Google mapping, etc.) cascade away with the duplicate.
  await supabase.from('projects').delete().eq('id', fromProjectId);
}

/** Attach an anonymous (pre-signup) project to the user claiming it. If the user already
 *  owns a project for the same domain, the anonymous audit is merged into that one instead
 *  so a site never shows up twice. Returns the project the user ends up owning. */
export async function claimProjectOwnership(projectId: string, userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: anon } = await supabase.from('projects').select('user_id').eq('id', projectId).maybeSingle();
  if (anon && anon.user_id === null) {
    const { data: site } = await supabase.from('websites').select('domain').eq('project_id', projectId).maybeSingle();
    const existingId = site?.domain ? await findOwnedProjectByDomain(site.domain, userId) : null;
    if (existingId && existingId !== projectId) {
      await mergeProjectInto(projectId, existingId);
      return existingId;
    }
  }

  const { error } = await supabase
    .from('projects')
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .is('user_id', null);
  if (error) throw new Error(error.message);
  return projectId;
}

export class ProjectAccessError extends Error {
  status: number;
  constructor(message = 'Project not found or you do not have access.', status = 404) {
    super(message);
    this.name = 'ProjectAccessError';
    this.status = status;
  }
}

/** Throws unless the project is owned by this user. */
export async function assertProjectOwnership(projectId: string, userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase.from('projects').select('user_id').eq('id', projectId).maybeSingle();
  if (!project || project.user_id !== userId) {
    throw new ProjectAccessError();
  }
}

/** For API routes: resolves the signed-in user (if any) and rejects cross-owner
 *  access. Unowned (pre-signup) projects stay visible to anonymous visitors,
 *  matching the existing free-teaser flow. */
export async function requireProjectAccess(projectId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const auth = createClient(cookieStore);
  const {
    data: { user },
  } = await auth.auth.getUser();

  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .maybeSingle();
  if (!project) throw new ProjectAccessError();
  const allowed = await canAccessProject(
    project,
    user?.id ?? null,
    anonSessionIdsFromCookies(cookieStore)
  );
  if (!allowed) throw new ProjectAccessError();
  return user?.id ?? null;
}

/** Strict version of requireProjectAccess: the project must exist and be owned
 *  by the signed-in caller. Use for anything that touches paid/connected data. */
export async function requireProjectOwner(projectId: string): Promise<string> {
  const userId = await requireProjectAccess(projectId);
  if (!userId) throw new ProjectAccessError('Sign in required.', 401);
  return userId;
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
      supabase.from('google_connections').select('id').eq('project_id', projectId).limit(1).maybeSingle(),
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

export async function updateFindingWorkflow(
  projectId: string,
  findingId: string,
  input: { status?: FindingStatus; nextAction?: string | null }
): Promise<Finding> {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (input.nextAction !== undefined) patch.next_action = input.nextAction;
  if (Object.keys(patch).length === 0) {
    throw new Error('No finding updates provided.');
  }
  const { data, error } = await supabase
    .from('findings')
    .update(patch)
    .eq('id', findingId)
    .eq('project_id', projectId)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Finding not found.');
  return data as Finding;
}

export const getProjectWorkspace = cache(async (projectId: string): Promise<ProjectWorkspace | null> => {
  const [project, audit, intake] = await Promise.all([
    getProjectOverview(projectId),
    getLatestCompletedAudit(projectId),
    getArchitectureInputs(projectId),
  ]);
  if (!project) return null;
  return { project, audit, intake };
});

/** Lean work bundle — findings + work orders + prompts for one run (no metrics/snapshot). */
export const getAuditWorkBundle = cache(async function getAuditWorkBundle(auditRunId: string) {
  const supabase = getSupabaseAdmin();
  const [{ data: findings }, workOrders, { data: prompts }] = await Promise.all([
    supabase
      .from('findings')
      .select('*')
      .eq('audit_run_id', auditRunId)
      .order('priority_score', { ascending: false })
      .limit(100),
    getWorkOrdersForAudit(auditRunId),
    supabase.from('agent_prompts').select('*').eq('audit_run_id', auditRunId),
  ]);

  return {
    findings: (findings as Finding[]) ?? [],
    workOrders,
    prompts: (prompts as AgentPrompt[]) ?? [],
  };
});

/** Growth brief only from latest report export for a run. */
export const getGrowthBriefForAuditRun = cache(async function getGrowthBriefForAuditRun(
  auditRunId: string
) {
  const supabase = getSupabaseAdmin();
  const { data: report } = await supabase
    .from('report_exports')
    .select('snapshot')
    .eq('audit_run_id', auditRunId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const snapshot = report?.snapshot;
  if (
    snapshot &&
    typeof snapshot === 'object' &&
    snapshot !== null &&
    'growthBrief' in snapshot
  ) {
    return (snapshot as { growthBrief?: unknown }).growthBrief ?? null;
  }
  return null;
});

/** Preferred completed audit run id for a project (full preferred). */
export const getPreferredCompletedAuditRunId = cache(async function getPreferredCompletedAuditRunId(
  projectId: string
): Promise<string | null> {
  const meta = await getPreferredCompletedAuditRunMeta(projectId);
  return meta?.id ?? null;
});

/** Preferred completed run with timestamps — layout last-audit label. */
export const getPreferredCompletedAuditRunMeta = cache(
  async function getPreferredCompletedAuditRunMeta(projectId: string): Promise<{
    id: string;
    completed_at: string | null;
    created_at: string | null;
  } | null> {
    const supabase = getSupabaseAdmin();
    const { data: runs } = await supabase
      .from('audit_runs')
      .select('id, run_type, completed_at, created_at')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);
    const preferred =
      (runs ?? []).find((r) => r.run_type === 'full') ?? (runs ?? [])[0] ?? null;
    if (!preferred?.id) return null;
    return {
      id: preferred.id,
      completed_at: preferred.completed_at ?? null,
      created_at: preferred.created_at ?? null,
    };
  }
);

export type ProjectWorkspace = {
  project: ProjectOverview;
  audit: Awaited<ReturnType<typeof getLatestCompletedAudit>>;
  intake: ArchitectureInput | null;
};

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

export const getGoogleConnection = cache(async (projectId: string): Promise<GoogleConnection | null> => {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('google_connections')
    .select('*')
    .eq('project_id', projectId)
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

/** Client self-reports that they've granted our Google account access —
 *  distinct from the admin's verified OAuth connection, this just tells
 *  admins who's ready to have their full audit run. */
export async function confirmClientAccess(projectId: string) {
  const supabase = getSupabaseAdmin();
  const confirmedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('projects')
    .update({ client_access_confirmed_at: confirmedAt, updated_at: confirmedAt })
    .eq('id', projectId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}
