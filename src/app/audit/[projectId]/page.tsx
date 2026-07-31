import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/audit/app-shell';
import { AuditReportClient } from '@/components/audit/audit-report-client';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import { normalizeSiteOnlyAnalysis } from '@/lib/audit/normalize-site-only';
import { buildSiteIdentity } from '@/lib/audit/site-identity';
import { loadBrandEvidenceForAuditRun, loadPreviousBrandEvidenceSnapshot } from '@/lib/evidence/persist';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import { loadConnectedMetricsForAuditRun, loadConnectedStatusForProject } from '@/lib/db/connected-metrics';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { getUserPlan } from '@/lib/db/profiles';
import {
  createAuditSession,
  getAuditSession,
  getLatestAuditSessionForProject,
  isAuditSessionUnlocked,
  unlockAuditSession,
  type AuditSession,
} from '@/lib/db/audit-sessions';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { Website } from '@/lib/supabase/types';
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

  const { data: projectRow } = await supabase
    .from('projects')
    .select('full_brief_unlocked_at')
    .eq('id', projectId)
    .maybeSingle();
  const projectUnlocked = Boolean(projectRow?.full_brief_unlocked_at);
  const userPlan = user ? await getUserPlan(user.id) : 'free';
  const showUpgradeBanner = !(userPlan === 'paid' && projectUnlocked);

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

  const siteOnly = normalizeSiteOnlyAnalysis(auditRun?.site_only_analysis ?? null);

  const hasPaidAudit = auditRun?.run_type === 'full' && auditRun?.status === 'completed';
  const hasIntake = Boolean(intake);
  const analyzing =
    !sessionFailed &&
    (status === 'pending' ||
      status === 'teaser_ready' ||
      latestRun?.status === 'running' ||
      (!siteOnly && status !== 'free_ready' && !runFailed));

  let homePage: { title: string | null; meta_description: string | null } | null = null;
  let brandEvidence: BrandEvidenceReportView | null = null;
  let previousBrandEvidence: BrandEvidenceReportView | null = null;
  let connectedMetrics: ConnectedAuditMetrics | null = null;
  const showConnectedTab = userPlan === 'paid' && projectUnlocked;

  if (auditRun?.id && auditRun.status === 'completed') {
    brandEvidence = await loadBrandEvidenceForAuditRun(supabase, auditRun.id);
    previousBrandEvidence = await loadPreviousBrandEvidenceSnapshot(
      supabase,
      projectId,
      auditRun.id
    );
    if (showConnectedTab) {
      connectedMetrics = await loadConnectedMetricsForAuditRun(projectId, auditRun.id);
    }
    const { data: homeRows } = await supabase
      .from('page_metrics')
      .select('title, meta_description, path')
      .eq('audit_run_id', auditRun.id)
      .in('path', ['/', ''])
      .limit(1);
    const home = (homeRows as Array<{ title: string | null; meta_description: string | null }> | null)?.[0];
    if (home) {
      homePage = { title: home.title, meta_description: home.meta_description };
    }
  } else if (showConnectedTab) {
    connectedMetrics = await loadConnectedStatusForProject(projectId);
  }

  if (runFailed && !siteOnly && !brandEvidence) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Brand Evidence Record
        </p>
        <h1 className="text-2xl font-semibold text-zinc-950">{website.domain}</h1>
        <p className="text-sm text-zinc-600">
          The audit did not finish.{' '}
          {errorMessage && errorMessage !== 'invalid_grant'
            ? errorMessage
            : 'Please try again — free audits only need the public website URL.'}
        </p>
        <RerunFreeAuditButton websiteUrl={website.url} />
      </div>
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
      brandEvidence={brandEvidence}
      previousBrandEvidence={previousBrandEvidence}
      connectedMetrics={connectedMetrics}
      hasPaidAudit={hasPaidAudit}
      hasIntake={hasIntake}
      analyzing={analyzing}
      failed={runFailed}
      userInitials={initialsFromEmail(user?.email)}
      signedIn={Boolean(user)}
      siteIdentity={siteIdentity}
      showUpgradeBanner={showUpgradeBanner}
    />
  );
}
