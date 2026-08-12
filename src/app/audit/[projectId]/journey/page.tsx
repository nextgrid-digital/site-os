import { redirect } from 'next/navigation';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

/** Brand/Journey dashboard merged into Dashboard — keep URL as redirect. */
export default async function AuditJourneyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();
  const workspace = await resolveAuditWorkspace(id);
  redirect(`/audit/${workspace.workspaceId}/workflow`);
}
