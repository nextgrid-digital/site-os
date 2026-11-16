import { redirect } from 'next/navigation';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { loadDashboardMetricsForProject } from '@/lib/db/connected-metrics';
import { dashboardLockReason } from '@/lib/audit/dashboard-lock';

/** Default landing: the Dashboard once unlocked, otherwise the Brief. */
export default async function AuditProjectRootPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();
  const workspace = await resolveAuditWorkspace(id);
  const { connected } = await loadDashboardMetricsForProject(workspace.projectId);
  const locked = dashboardLockReason({
    signedIn: workspace.signedIn,
    gscConnected: connected.gscConnected,
    ga4Connected: connected.ga4Connected,
  });
  redirect(`/audit/${workspace.workspaceId}/${locked ? 'brief' : 'workflow'}`);
}
