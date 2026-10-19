import { redirectToCanonicalAuditTab } from '@/lib/audit/canonical-workspace-redirect';

/** SPA shell owns the Setup panel — empty route match only. */
export default async function AuditConnectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId: id } = await params;
  await redirectToCanonicalAuditTab(id, '/connect', searchParams);
  return null;
}
