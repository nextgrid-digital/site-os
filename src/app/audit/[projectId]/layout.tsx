import { AppShell } from '@/components/audit/app-shell';
import { AuditTabKeepAlive } from '@/components/audit/audit-tab-keep-alive';
import { loadConnectedStatusForProject } from '@/lib/db/connected-metrics';
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
  // Cached — safe to await after workspace; often already warm from parallel child work.
  const connectedPromise = loadConnectedStatusForProject(workspace.projectId);
  const connected = await connectedPromise;

  return (
    <AppShell
      userInitials={workspace.userInitials}
      signedIn={workspace.signedIn}
      showSignIn={!workspace.signedIn}
    >
      <AuditTabKeepAlive
        workspaceId={workspace.workspaceId}
        projectId={workspace.projectId}
        domain={workspace.domain}
        websiteUrl={workspace.website.url}
        connection={{
          gscConnected: connected.gscConnected,
          ga4Connected: connected.ga4Connected,
          gscPropertyLabel: connected.gscPropertyLabel,
          ga4PropertyLabel: connected.ga4PropertyLabel,
          googleConnected: connected.googleConnected,
        }}
      >
        {children}
      </AuditTabKeepAlive>
    </AppShell>
  );
}
