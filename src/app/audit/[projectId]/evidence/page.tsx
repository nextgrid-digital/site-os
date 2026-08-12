import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { FreeReport } from '@/components/audit/free-report';
import { PaidReport } from '@/components/audit/paid-report';
import { AuditStatusPoller } from '@/components/audit/audit-status-poller';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import { normalizeSiteOnlyAnalysis } from '@/lib/audit/normalize-site-only';
import { buildSiteIdentity } from '@/lib/audit/site-identity';
import { loadBrandEvidenceForAuditRun } from '@/lib/evidence/persist';
import { slimBrandEvidenceForKobbe } from '@/lib/evidence/slim-for-kobbe';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import {
  loadConnectedMetricsForAuditRun,
  loadConnectedStatusForProject,
} from '@/lib/db/connected-metrics';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import {
  isAuditSessionUnlocked,
  unlockAuditSession,
  type AuditSession,
} from '@/lib/db/audit-sessions';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type { Website } from '@/lib/supabase/types';

function sessionUnlockedForUser(
  session: AuditSession | null,
  user: { id: string; email?: string | null } | null
) {
  if (!user || !isAuditSessionUnlocked(session)) return false;
  if (session?.user_id && session.user_id === user.id) return true;
  if (session?.email && user.email && session.email === user.email) return true;
  return false;
}

function EvidenceBodyFallback() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading evidence">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-zinc-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-7 w-2/3 max-w-md rounded-lg bg-zinc-200" />
          <div className="h-4 w-1/2 max-w-sm rounded bg-zinc-200" />
        </div>
      </div>
      <div className="h-48 rounded-2xl bg-white" />
    </div>
  );
}

async function EvidenceReportBody({
  projectId,
  sessionId,
  website,
  auditRunId,
  hasPaidAudit,
  hasIntake,
  analyzing,
  userInitials,
  signedIn,
  siteOnly,
}: {
  projectId: string;
  sessionId: string;
  website: Website;
  auditRunId: string | null;
  hasPaidAudit: boolean;
  hasIntake: boolean;
  analyzing: boolean;
  userInitials: string | null;
  signedIn: boolean;
  siteOnly: ReturnType<typeof normalizeSiteOnlyAnalysis>;
}) {
  const supabase = getSupabaseAdmin();
  let homePage: { title: string | null; meta_description: string | null } | null = null;
  let brandEvidence: BrandEvidenceReportView | null = null;
  let connectedMetrics: ConnectedAuditMetrics | null = null;

  if (auditRunId) {
    const [evidence, metrics, homeRowsResult] = await Promise.all([
      loadBrandEvidenceForAuditRun(supabase, auditRunId),
      loadConnectedMetricsForAuditRun(projectId, auditRunId),
      supabase
        .from('page_metrics')
        .select('title, meta_description, path')
        .eq('audit_run_id', auditRunId)
        .in('path', ['/', ''])
        .limit(1),
    ]);
    brandEvidence = slimBrandEvidenceForKobbe(evidence);
    connectedMetrics = metrics;
    const home = (
      homeRowsResult.data as Array<{ title: string | null; meta_description: string | null }> | null
    )?.[0];
    if (home) {
      homePage = { title: home.title, meta_description: home.meta_description };
    }
  } else {
    connectedMetrics = await loadConnectedStatusForProject(projectId);
  }

  const siteIdentity = buildSiteIdentity({
    website,
    siteOnly,
    homePage,
  });

  const showPaid = hasPaidAudit && hasIntake;
  const report = showPaid ? (
    <PaidReport
      projectId={projectId}
      website={website}
      brandEvidence={brandEvidence}
      connectedMetrics={connectedMetrics}
      siteIdentity={siteIdentity}
      userInitials={userInitials}
      signedIn={signedIn}
      embedded
    />
  ) : (
    <FreeReport
      projectId={projectId}
      sessionId={sessionId}
      website={website}
      brandEvidence={brandEvidence}
      connectedMetrics={connectedMetrics}
      siteIdentity={siteIdentity}
      analyzing={analyzing}
      userInitials={userInitials}
      signedIn={signedIn}
      embedded
    />
  );

  return (
    <>
      {analyzing ? <AuditStatusPoller sessionId={sessionId} /> : null}
      {report}
    </>
  );
}

export default async function ClientAuditPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  const workspace = await resolveAuditWorkspace(id);
  const { projectId, website, user, userInitials, signedIn } = workspace;
  let session = workspace.session;

  if (!session) notFound();

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

  const supabase = getSupabaseAdmin();
  const status = session.status ?? 'pending';
  const sessionFailed = status === 'failed';

  const [intakeResult, completedResult, latestRunResult] = await Promise.all([
    supabase.from('client_intake').select('id').eq('project_id', projectId).maybeSingle(),
    supabase
      .from('audit_runs')
      .select('id, status, run_type, error_message, site_only_analysis, created_at')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .not('site_only_analysis', 'is', null)
      .order('created_at', { ascending: false })
      .limit(2),
    supabase
      .from('audit_runs')
      .select('id, status, run_type, error_message, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const intake = intakeResult.data;
  const completedRuns = completedResult.data ?? [];
  const fullCompleted = completedRuns.find((r) => r.run_type === 'full') ?? null;
  const siteOnlyCompleted = completedRuns[0] ?? null;
  const latestRun = latestRunResult.data;

  const auditRun =
    (intake ? fullCompleted : null) ?? siteOnlyCompleted ?? latestRun ?? null;
  const runFailed = auditRun?.status === 'failed' || sessionFailed;
  const errorMessage =
    typeof auditRun?.error_message === 'string' && auditRun.error_message
      ? auditRun.error_message
      : sessionFailed
        ? 'The free audit failed before results were ready.'
        : null;

  const siteOnlyRaw =
    'site_only_analysis' in (auditRun ?? {})
      ? (auditRun as { site_only_analysis?: unknown }).site_only_analysis
      : null;
  const siteOnly = normalizeSiteOnlyAnalysis(siteOnlyRaw ?? null);

  const hasPaidAudit = auditRun?.run_type === 'full' && auditRun?.status === 'completed';
  const hasIntake = Boolean(intake);
  const analyzing =
    !sessionFailed &&
    (status === 'pending' ||
      status === 'teaser_ready' ||
      latestRun?.status === 'running' ||
      (!siteOnly && status !== 'free_ready' && !runFailed));

  if (runFailed && !siteOnly) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Brand Evidence Record
        </p>
        <h1 className="text-2xl font-semibold text-zinc-950">{website.domain}</h1>
        <p className="text-sm text-zinc-600">
          The audit did not finish.{''}
          {errorMessage && errorMessage !== 'invalid_grant'
            ? errorMessage
            : 'Please try again — free audits only need the public website URL.'}
        </p>
        <RerunFreeAuditButton websiteUrl={website.url} />
      </div>
    );
  }

  const completedAuditId =
    auditRun?.status === 'completed' && typeof auditRun.id === 'string' ? auditRun.id : null;

  return (
    <Suspense fallback={<EvidenceBodyFallback />}>
      <EvidenceReportBody
        projectId={projectId}
        sessionId={session.id}
        website={website as Website}
        auditRunId={completedAuditId}
        hasPaidAudit={hasPaidAudit}
        hasIntake={hasIntake}
        analyzing={analyzing}
        userInitials={userInitials}
        signedIn={signedIn}
        siteOnly={siteOnly}
      />
    </Suspense>
  );
}
