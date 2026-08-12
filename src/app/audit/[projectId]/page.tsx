import { redirect } from 'next/navigation';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

/** Default landing is the connected Dashboard aggregator. */
export default async function AuditProjectRootPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();
  const workspace = await resolveAuditWorkspace(id);
  redirect(`/audit/${workspace.workspaceId}/workflow`);
}
