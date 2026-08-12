import { redirectToCanonicalAuditTab } from '@/lib/audit/canonical-workspace-redirect';

/** SPA shell owns the Brief panel — empty route match only. */
export default async function AuditBriefPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  await redirectToCanonicalAuditTab(id, '/brief');
  return null;
}
