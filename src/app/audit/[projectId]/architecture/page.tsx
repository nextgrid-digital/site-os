import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { Badge } from '@/components/ui/badge';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditArchitecturePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const workspace = await getProjectWorkspace(resolved.projectId);
  if (!workspace) notFound();

  const architecture = workspace.audit?.architecture ?? [];

  return (
    <AuditWorkspacePanel
      title="Architecture"
      description="Missing ICP, product, solution, and proof pages detected from crawl and operator inputs."
    >
      {!architecture.length ? (
        <AuditWorkspaceCard>
          <p className="font-medium text-zinc-950">No architecture recommendations yet</p>
          <p className="mt-1 text-sm text-zinc-500">Run an audit to generate page-gap analysis.</p>
        </AuditWorkspaceCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {architecture.map((item) => (
            <AuditWorkspaceCard key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.rationale}</p>
                </div>
                <Badge variant="secondary">{item.priority}</Badge>
              </div>
              {item.suggested_path ? (
                <p className="mt-3 font-mono text-xs text-zinc-500">{item.suggested_path}</p>
              ) : null}
            </AuditWorkspaceCard>
          ))}
        </div>
      )}
    </AuditWorkspacePanel>
  );
}
