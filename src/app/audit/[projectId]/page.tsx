import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/audit/app-shell';
import { AuditReportClient } from '@/components/audit/audit-report-client';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import { normalizeSiteOnlyAnalysis } from '@/lib/audit/normalize-site-only';
import { buildSiteIdentity } from '@/lib/audit/site-identity';
import {
  createAuditSession,
  getAuditSession,
  getLatestAuditSessionForProject,
  isAuditSessionUnlocked,
  unlockAuditSession,
  type AuditSession,
} from '@/lib/db/audit-sessions';
import { getProjectLeadReportingSummary } from '@/lib/db/projects';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type {
  AgentPrompt,
  ChannelTrafficRow,
  Finding,
  PageMetric,
  QueryMetric,
  Website,
} from '@/lib/supabase/types';
import { createClient } from '@/utils/supabase/server';

function sessionUnlockedForUser(
  session: AuditSession | null,
  user: { id: string; email?: string | null } | null
) {
  if (!user || !isAuditSessionUnlocked(session)) return false;
  if (session?.user_id && session.user_id === user.id) return true;
  if (session?.email && user.email && session.email === user.email) return true;
  return false;
}

function initialsFromEmail(email: string | null | undefined) {
  if (!email) return null;
  const local = email.split('@')[0] || email;
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default async function ClientAuditPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = getSupabaseAdmin();
  const cookieStore = await cookies();
  const authClient = createClient(cookieStore);
  const {
    data: { user },
  } = await authClient.auth.getUser();

  let session: AuditSession | null = await getAuditSession(id);
  let projectId = session?.project_id ?? null;

  if (!session) {
    const { data: project } = await supabase.from('projects').select('id').eq('id', id).maybeSingle();
    if (!project) notFound();
    projectId = project.id;
    session = await getLatestAuditSessionForProject(project.id);
  }

  if (!projectId) notFound();

  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('project_id', projectId)
    .single();
  if (!website) notFound();

  if (!session) {
    session = await createAuditSession({
      projectId,
      websiteUrl: website.url,
      domain: website.domain,
    });
  }

  if (user?.email && !sessionUnlockedForUser(session, user)) {
    session = await unlockAuditSession(session.id, {
      userId: user.id,
      email: user.email,
    });
  }

  if (id !== session.id && session.id) {
    if (!sessionUnlockedForUser(session, user) && id === projectId) {
      redirect(`/audit/${session.id}`);
    }
    if (sessionUnlockedForUser(session, user)) {
      redirect(`/audit/${session.id}`);
    }
  }

  const status = session.status ?? 'pending';
  const sessionFailed = status === 'failed';

  const { data: intake } = await supabase
    .from('client_intake')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  // Prefer newest full completed run when intake exists; else newest completed with site_only.
  const { data: fullCompletedRuns } = intake
    ? await supabase
        .from('audit_runs')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .eq('run_type', 'full')
        .order('created_at', { ascending: false })
        .limit(1)
    : { data: null };

  const { data: completedRuns } = await supabase
    .from('audit_runs')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .not('site_only_analysis', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);

  const { data: latestRun } = await supabase
    .from('audit_runs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const auditRun = fullCompletedRuns?.[0] ?? completedRuns?.[0] ?? latestRun ?? null;
  const runFailed = auditRun?.status === 'failed' || sessionFailed;
  const errorMessage =
    typeof auditRun?.error_message === 'string' && auditRun.error_message
      ? auditRun.error_message
      : sessionFailed
        ? 'The free audit failed before results were ready.'
        : null;

  const findings: Finding[] = auditRun?.status === 'completed'
    ? (((
        await supabase
          .from('findings')
          .select('*')
          .eq('audit_run_id', auditRun.id)
          .order('priority_score', { ascending: false })
      ).data as Finding[] | null) ?? [])
    : [];

  const siteOnly = normalizeSiteOnlyAnalysis(auditRun?.site_only_analysis ?? null);

  let aeo: AeoAnalysis | null = null;
  if (auditRun?.id && auditRun.status === 'completed') {
    const { data: aeoRow } = await supabase
      .from('aeo_analyses')
      .select('analysis, status')
      .eq('audit_run_id', auditRun.id)
      .maybeSingle();
    if (aeoRow?.status === 'completed' && aeoRow.analysis) {
      aeo = aeoRow.analysis as AeoAnalysis;
    }
  }

  const hasPaidAudit = auditRun?.run_type === 'full' && auditRun?.status === 'completed';
  const hasIntake = Boolean(intake);
  const analyzing =
    !runFailed &&
    (status === 'pending' ||
      auditRun?.status === 'running' ||
      (!siteOnly && !runFailed));

  let pageMetrics: PageMetric[] = [];
  let queryMetrics: QueryMetric[] = [];
  let trafficByChannel: ChannelTrafficRow[] = [];
  let googleConnected = false;
  let agentPrompts: AgentPrompt[] = [];
  let homePage: { title: string | null; meta_description: string | null } | null = null;

  if (auditRun?.id && auditRun.status === 'completed') {
    const [{ data: promptsData }, { data: homeRows }] = await Promise.all([
      supabase.from('agent_prompts').select('*').eq('audit_run_id', auditRun.id),
      supabase
        .from('page_metrics')
        .select('title, meta_description, path')
        .eq('audit_run_id', auditRun.id)
        .in('path', ['/', ''])
        .limit(1),
    ]);
    agentPrompts = (promptsData as AgentPrompt[] | null) ?? [];
    const home = (homeRows as Array<{ title: string | null; meta_description: string | null }> | null)?.[0];
    if (home) {
      homePage = { title: home.title, meta_description: home.meta_description };
    } else {
      // Fallback: first page metric if homepage path wasn't stored as /
      const { data: anyHome } = await supabase
        .from('page_metrics')
        .select('title, meta_description, path')
        .eq('audit_run_id', auditRun.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (anyHome) {
        homePage = {
          title: anyHome.title,
          meta_description: anyHome.meta_description,
        };
      }
    }
  }

  if (hasPaidAudit && hasIntake && auditRun?.id) {
    const [pagesRes, queriesRes, leadSummary, googleConn] = await Promise.all([
      supabase.from('page_metrics').select('*').eq('audit_run_id', auditRun.id),
      supabase.from('query_metrics').select('*').eq('audit_run_id', auditRun.id),
      getProjectLeadReportingSummary(projectId),
      supabase
        .from('google_connections')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    pageMetrics = (pagesRes.data as PageMetric[] | null) ?? [];
    queryMetrics = (queriesRes.data as QueryMetric[] | null) ?? [];
    trafficByChannel = leadSummary.trafficByChannel ?? [];
    googleConnected = Boolean(googleConn.data?.id);
  }

  if (runFailed && !siteOnly) {
    return (
      <AppShell userInitials={initialsFromEmail(user?.email)} showSignIn={!user}>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Free audit</p>
          <h1 className="text-2xl font-semibold text-zinc-950">{website.domain}</h1>
          <p className="text-sm text-zinc-600">
            The audit did not finish.{' '}
            {errorMessage && errorMessage !== 'invalid_grant'
              ? errorMessage
              : 'Please try again — free audits only need the public website URL.'}
          </p>
          <RerunFreeAuditButton websiteUrl={website.url} />
        </div>
      </AppShell>
    );
  }

  const siteIdentity = buildSiteIdentity({
    website: website as Website,
    siteOnly,
    homePage,
  });

  return (
    <AuditReportClient
      sessionId={session.id}
      projectId={projectId}
      website={website as Website}
      findings={findings}
      siteOnly={siteOnly}
      aeo={aeo}
      hasPaidAudit={hasPaidAudit}
      hasIntake={hasIntake}
      analyzing={analyzing}
      failed={runFailed}
      userInitials={initialsFromEmail(user?.email)}
      signedIn={Boolean(user)}
      traffic={{
        trafficByChannel,
        pageMetrics,
        queryMetrics,
        googleConnected,
      }}
      agentPrompts={agentPrompts}
      siteIdentity={siteIdentity}
    />
  );
}
