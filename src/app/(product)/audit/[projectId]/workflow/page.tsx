import { redirect } from 'next/navigation';
import { dashboardLockReason } from '@/lib/audit/dashboard-lock';
import { loadDashboardMetricsForProject } from '@/lib/db/connected-metrics';
import { redirectToCanonicalAuditTab } from '@/lib/audit/canonical-workspace-redirect';

/** SPA shell owns the Dashboard panel — empty route match only. */
export default async function AuditDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  const workspace = await redirectToCanonicalAuditTab(id, '/workflow');
  const { connected } = await loadDashboardMetricsForProject(workspace.projectId);
  const locked = dashboardLockReason({
    signedIn: workspace.signedIn,
    gscConnected: connected.gscConnected,
    ga4Connected: connected.ga4Connected,
  });
  // The Dashboard is locked until the viewer is signed in with Google connected.
  if (locked) redirect(`/audit/${workspace.workspaceId}/brief`);
  return null;
}
