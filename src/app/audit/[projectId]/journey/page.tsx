import { notFound } from 'next/navigation';
import { JoinedTrafficReport } from '@/components/audit/report/joined/joined-traffic-report';
import {
  loadConnectedMetricsForAuditRun,
  loadConnectedStatusForProject,
} from '@/lib/db/connected-metrics';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditJourneyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await resolveAuditWorkspace(id);
  const projectId = workspace.projectId;
  const supabase = getSupabaseAdmin();

  const { data: runs } = await supabase
    .from('audit_runs')
    .select('id, status, run_type, completed_at')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5);

  const preferred =
    runs?.find((r) => r.run_type === 'full') ?? runs?.[0] ?? null;

  const connectedMetrics = preferred?.id
    ? await loadConnectedMetricsForAuditRun(projectId, preferred.id)
    : await loadConnectedStatusForProject(projectId);

  return (
    <JoinedTrafficReport
      projectId={workspace.workspaceId}
      connectedMetrics={connectedMetrics}
      domain={workspace.domain}
    />
  );
}
