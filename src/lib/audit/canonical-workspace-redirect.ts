import { redirect } from 'next/navigation';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import type { AuditPrimaryTabSuffix } from '@/components/audit/audit-tab-cache';

/**
 * Ensure primary tab URLs use the session workspace id (not project UUID).
 * Layout also redirects non-canonical ids to /workflow; pages preserve tab suffix.
 */
export async function redirectToCanonicalAuditTab(
  id: string,
  suffix: AuditPrimaryTabSuffix
) {
  const workspace = await resolveAuditWorkspace(id);
  if (id !== workspace.workspaceId) {
    redirect(`/audit/${workspace.workspaceId}${suffix}`);
  }
  return workspace;
}
