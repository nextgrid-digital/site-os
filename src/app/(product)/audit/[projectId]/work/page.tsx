import { redirectToCanonicalAuditTab } from '@/lib/audit/canonical-workspace-redirect';

/** SPA shell owns the Work panel — empty route match only. */
export default async function AuditWorkPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  await redirectToCanonicalAuditTab(id, '/work');
  return null;
}
