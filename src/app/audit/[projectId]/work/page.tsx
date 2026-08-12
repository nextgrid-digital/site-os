import { notFound } from 'next/navigation';
import { AuditWorkspacePanel } from '@/components/audit/audit-workspace-panel';
import { WorkItemsQueue } from '@/components/audit/workflow/work-items-queue';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace, getWorkOrdersForAudit } from '@/lib/db/projects';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { AgentPrompt } from '@/lib/supabase/types';
import { buildUnifiedWorkItems } from '@/lib/workflow/work-items';

export default async function AuditWorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { projectId: id } = await params;
  const { filter: rawFilter } = await searchParams;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) notFound();

  const audit = workspace.audit;
  if (!audit?.auditRun) {
    return (
      <AuditWorkspacePanel
        title="Work"
        description="Track issues as work items — status, priority, and next action."
      >
        <div className="rounded-[14px] bg-white px-4 py-10 text-center text-sm text-zinc-500">
          Run an audit first to generate work items.
        </div>
      </AuditWorkspacePanel>
    );
  }

  const supabase = getSupabaseAdmin();
  const [{ data: prompts }, workOrders] = await Promise.all([
    supabase.from('agent_prompts').select('*').eq('audit_run_id', audit.auditRun.id),
    getWorkOrdersForAudit(audit.auditRun.id),
  ]);

  const promptsByFindingId = new Map(
    ((prompts as AgentPrompt[]) ?? []).map((p) => [p.finding_id, p])
  );
  const items = buildUnifiedWorkItems({
    findings: audit.findings ?? [],
    workOrders,
    promptsByFindingId,
  });

  const filter =
    rawFilter === 'open' ||
    rawFilter === 'finding' ||
    rawFilter === 'work_order' ||
    rawFilter === 'all'
      ? rawFilter
      : 'all';

  return (
    <AuditWorkspacePanel
      title="Work"
      description="Each issue becomes a work item: why it matters, recommendation, priority, status, next action."
    >
      <WorkItemsQueue projectId={projectId} items={items} filter={filter} />
    </AuditWorkspacePanel>
  );
}
