'use client';

import { AuditTabCacheProvider, AuditTabPanels } from '@/components/audit/audit-tab-cache';
import {
  AuditWorkspaceTabs,
  type WorkspaceConnectionStatus,
} from '@/components/audit/audit-workspace-tabs';
import { AuditRunProvider, useAuditRun } from '@/components/audit/audit-run-context';
import { AuditRunningPanel } from '@/components/audit/audit-running-panel';

/**
 * Layout shell: tab chrome + keep-alive panels for primary audit routes.
 */
export function AuditTabKeepAlive({
  workspaceId,
  projectId,
  domain,
  websiteUrl,
  connection,
  lastAuditAt = null,
  children,
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  lastAuditAt?: string | null;
  children: React.ReactNode;
}) {
  return (
    <AuditTabCacheProvider workspaceId={workspaceId}>
      <AuditRunProvider>
        <AuditWorkspaceShell
          workspaceId={workspaceId}
          projectId={projectId}
          domain={domain}
          websiteUrl={websiteUrl}
          connection={connection}
          lastAuditAt={lastAuditAt}
        >
          {children}
        </AuditWorkspaceShell>
      </AuditRunProvider>
    </AuditTabCacheProvider>
  );
}

function AuditWorkspaceShell({
  workspaceId,
  projectId,
  domain,
  websiteUrl,
  connection,
  lastAuditAt,
  children,
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  lastAuditAt: string | null;
  children: React.ReactNode;
}) {
  const { running, error } = useAuditRun();
  const showRunningUi = running || Boolean(error);

  return (
    <>
      <AuditWorkspaceTabs
        workspaceId={workspaceId}
        projectId={projectId}
        domain={domain}
        websiteUrl={websiteUrl}
        connection={connection}
        lastAuditAt={lastAuditAt}
        navigationDisabled={showRunningUi}
      />
      {showRunningUi ? <AuditRunningPanel /> : <AuditTabPanels>{children}</AuditTabPanels>}
    </>
  );
}
