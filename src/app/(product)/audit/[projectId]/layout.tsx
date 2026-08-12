import { AuditTabKeepAlive } from '@/components/audit/audit-tab-keep-alive';
import { loadDashboardMetricsForProject } from '@/lib/db/connected-metrics';
import {
  getLeadSummaryOnly,
  getPreferredCompletedAuditRunMeta,
} from '@/lib/db/projects';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';

export default async function AuditProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  const workspace = await resolveAuditWorkspace(id);
  const projectId = workspace.projectId;

  // Canonical tab suffix redirects live on each primary page (preserve /brief etc.).
  // Client shell also replaceState's to session workspaceId.

  const [dash, leadSummary, preferredRun] = await Promise.all([
    loadDashboardMetricsForProject(projectId),
    getLeadSummaryOnly(projectId),
    getPreferredCompletedAuditRunMeta(projectId),
  ]);

  const lastAuditAt =
    (typeof preferredRun?.completed_at === 'string' && preferredRun.completed_at) ||
    (typeof preferredRun?.created_at === 'string' && preferredRun.created_at) ||
    null;

  const connected = dash.connected;

  return (
    <>
      <AuditTabKeepAlive
        workspaceId={workspace.workspaceId}
        projectId={projectId}
        domain={workspace.domain}
        websiteUrl={workspace.website.url}
        lastAuditAt={lastAuditAt}
        connection={{
          websiteConnected: Boolean(workspace.website.url),
          gscConnected: connected.gscConnected,
          ga4Connected: connected.ga4Connected,
          adsConnected: connected.adsConnected,
          gscPropertyLabel: connected.gscPropertyLabel,
          ga4PropertyLabel: connected.ga4PropertyLabel,
          adsAccountLabel: connected.adsAccountLabel,
          googleConnected: connected.googleConnected,
        }}
        initial={{
          auditRunId: dash.auditRunId,
          connected: dash.connected,
          growthBrief: dash.growthBrief,
          leadSummary,
        }}
      />
      {/* Primary pages return null; keep slot for redirects / Next segment matching. */}
      {children}
    </>
  );
}
