import { notFound } from 'next/navigation';
import { JoinedTrafficReport } from '@/components/audit/report/joined/joined-traffic-report';
import {
  loadConnectedMetricsForAuditRun,
  loadConnectedStatusForProject,
} from '@/lib/db/connected-metrics';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectLeadReportingSummary, getProjectWorkspace } from '@/lib/db/projects';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;
  const supabase = getSupabaseAdmin();

  const [workspace, runsResult, leadReporting] = await Promise.all([
    getProjectWorkspace(projectId),
    supabase
      .from('audit_runs')
      .select('id, status, run_type, completed_at')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5),
    getProjectLeadReportingSummary(projectId),
  ]);
  if (!workspace) notFound();

  const runs = runsResult.data ?? [];
  const preferred = runs.find((r) => r.run_type === 'full') ?? runs[0] ?? null;

  const connectedMetrics = preferred?.id
    ? await loadConnectedMetricsForAuditRun(projectId, preferred.id)
    : await loadConnectedStatusForProject(projectId);

  const websiteUrl = workspace.project.website?.url ?? null;
  const websiteLabel =
    workspace.project.website?.domain ?? resolved.domain ?? null;

  return (
    <JoinedTrafficReport
      projectId={resolved.workspaceId}
      connectedMetrics={connectedMetrics}
      leadSummary={leadReporting.leadSummary}
      domain={websiteLabel ?? undefined}
      websiteConnected={Boolean(websiteUrl)}
      websiteLabel={websiteLabel}
    />
  );
}
