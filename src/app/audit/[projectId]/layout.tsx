import { AppShell } from '@/components/audit/app-shell';
import { AuditTabKeepAlive } from '@/components/audit/audit-tab-keep-alive';
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

  return (
    <AppShell
      userInitials={workspace.userInitials}
      signedIn={workspace.signedIn}
      showSignIn={!workspace.signedIn}
    >
      <AuditTabKeepAlive workspaceId={workspace.workspaceId} domain={workspace.domain}>
        {children}
      </AuditTabKeepAlive>
    </AppShell>
  );
}
