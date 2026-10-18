import { redirect } from 'next/navigation';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import type { AuditPrimaryTabSuffix } from '@/components/audit/audit-tab-cache';

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

function toQueryString(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : value ? [value] : []) {
      query.append(key, item);
    }
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

/**
 * The URL id can be a project UUID or an audit session id. Tabs and the SPA
 * shell only use the session id, so a project-id URL gets redirected to the
 * session URL for the same tab. Query params are carried over, because
 * producers like the Google OAuth callback put `?connected=1` / `?error=…`
 * on these URLs and the panel reads them after the redirect.
 */
export async function redirectToCanonicalAuditTab(
  id: string,
  suffix: AuditPrimaryTabSuffix,
  searchParams?: SearchParamsInput
) {
  const workspace = await resolveAuditWorkspace(id);

  if (id !== workspace.workspaceId) {
    const query = searchParams ? toQueryString(await searchParams) : '';
    redirect(`/audit/${workspace.workspaceId}${suffix}${query}`);
  }
  return workspace;
}
