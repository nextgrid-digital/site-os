import { AppShell } from '@/components/audit/app-shell';
import { AuditTabKeepAlive } from '@/components/audit/audit-tab-keep-alive';
import { loadConnectedStatusForProject } from '@/lib/db/connected-metrics';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getSupabaseAdmin } from '@/lib/supabase/server';

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
  const supabase = getSupabaseAdmin();
  const [{ data: latestRun }, connected] = await Promise.all([
    supabase
      .from('audit_runs')
      .select('completed_at, created_at')
      .eq('project_id', workspace.projectId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    connectedPromise,
  ]);

  const lastAuditAt =
    (typeof latestRun?.completed_at === 'string' && latestRun.completed_at) ||
    (typeof latestRun?.created_at === 'string' && latestRun.created_at) ||
    null;

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
      >
        {children}
      </AuditTabKeepAlive>
    </AppShell>
  );
}
