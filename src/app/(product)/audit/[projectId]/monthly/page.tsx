import { redirectToCanonicalAuditTab } from '@/lib/audit/canonical-workspace-redirect';

/** SPA shell owns the Monthly panel — empty route match only. */
export default async function AuditMonthlyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  await redirectToCanonicalAuditTab(id, '/monthly');
  return null;
}
