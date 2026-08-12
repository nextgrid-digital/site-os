import { redirectToCanonicalAuditTab } from '@/lib/audit/canonical-workspace-redirect';

/** SPA shell owns the Leads panel — empty route match only. */
export default async function AuditLeadsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  await redirectToCanonicalAuditTab(id, '/leads');
  return null;
}
