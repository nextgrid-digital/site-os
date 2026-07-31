'use client';

import { AuditTabCacheProvider, AuditTabPanels } from '@/components/audit/audit-tab-cache';
import { AuditWorkspaceTabs } from '@/components/audit/audit-workspace-tabs';

/**
 * Layout shell: tab chrome + keep-alive panels for primary audit routes.
 */
export function AuditTabKeepAlive({
  workspaceId,
  domain,
  children,
}: {
  workspaceId: string;
  domain?: string;
  children: React.ReactNode;
}) {
  return (
    <AuditTabCacheProvider workspaceId={workspaceId}>
      <AuditWorkspaceTabs workspaceId={workspaceId} domain={domain} />
      <AuditTabPanels>{children}</AuditTabPanels>
    </AuditTabCacheProvider>
  );
}
