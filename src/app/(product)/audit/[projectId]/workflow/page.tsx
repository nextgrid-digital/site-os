import { redirectToCanonicalAuditTab } from '@/lib/audit/canonical-workspace-redirect';

/** SPA shell owns the Dashboard panel — empty route match only. */
export default async function AuditDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  await redirectToCanonicalAuditTab(id, '/workflow');
  return null;
}
