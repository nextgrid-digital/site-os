'use client';

import { AuditTabCacheProvider, AuditTabPanels } from '@/components/audit/audit-tab-cache';
import {
  AuditWorkspaceTabs,
  type WorkspaceConnectionStatus,
} from '@/components/audit/audit-workspace-tabs';

/**
 * Layout shell: tab chrome + keep-alive panels for primary audit routes.
 */
export function AuditTabKeepAlive({
  workspaceId,
  projectId,
  domain,
  websiteUrl,
  connection,
  children,
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  children: React.ReactNode;
}) {
  return (
    <AuditTabCacheProvider workspaceId={workspaceId}>
      <AuditWorkspaceTabs
        workspaceId={workspaceId}
        projectId={projectId}
        domain={domain}
        websiteUrl={websiteUrl}
        connection={connection}
      />
      <AuditTabPanels>{children}</AuditTabPanels>
    </AuditTabCacheProvider>
  );
}
