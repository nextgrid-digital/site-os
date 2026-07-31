import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { PromptBlock } from '@/components/operator/prompt-block';
import { Badge } from '@/components/ui/badge';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getFindingDetail, getProjectOverview } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditFindingDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; findingId: string }>;
}) {
  const { projectId: id, findingId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;

  const [project, detail] = await Promise.all([
    getProjectOverview(projectId),
    getFindingDetail(projectId, findingId),
  ]);
  if (!project || !detail) notFound();

  const { finding, prompt } = detail;

  return (
    <AuditWorkspacePanel
      title={finding.title}
      description={project.name}
      actions={
        <>
          <Badge>{finding.severity}</Badge>
          <Badge variant="outline">{finding.category}</Badge>
          {finding.page_path ? <Badge variant="secondary">{finding.page_path}</Badge> : null}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <AuditWorkspaceCard>
          <p className="font-medium text-zinc-950">Evidence</p>
          <p className="mt-1 text-sm text-zinc-500">Why this finding was generated</p>
          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            <p>{finding.summary}</p>
            <p className="text-zinc-500">Buyer moment: {finding.buyer_moment ?? '—'}</p>
            <p className="text-zinc-500">Estimated value: {finding.estimated_value ?? '—'}</p>
          </div>
        </AuditWorkspaceCard>

        <AuditWorkspaceCard className="lg:col-span-2">
          <p className="font-medium text-zinc-950">Universal agent prompt</p>
          <p className="mt-1 text-sm text-zinc-500">
            One prompt format for every finding. Copy and execute manually.
          </p>
          <div className="mt-4">
            {prompt ? (
              <PromptBlock prompt={prompt} />
            ) : (
              <p className="text-sm text-zinc-500">No prompt generated.</p>
            )}
          </div>
        </AuditWorkspaceCard>
      </div>
    </AuditWorkspacePanel>
  );
}
