import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import {
  WorkOrdersQueue,
  type WorkOrderQueueItem,
} from '@/components/operator/work-orders-queue';
import { Button } from '@/components/ui/button';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace, getWorkOrdersForAudit } from '@/lib/db/projects';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditWorkOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { projectId: id } = await params;
  const { action } = await searchParams;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;
  const base = `/audit/${resolved.workspaceId}`;

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace?.audit?.auditRun) notFound();

  const workOrders = await getWorkOrdersForAudit(workspace.audit.auditRun.id);
  const brief = workspace.audit.growthBrief as GrowthBrief | null;
  const briefFallbacks: WorkOrderQueueItem[] = (brief?.commercialGraph?.topWorkOrders ?? []).map(
    (w) => ({
      id: null,
      actionType: w.actionType,
      title: w.title,
      summary: w.summary,
      fullPrompt: w.fullPrompt,
      priorityScore: w.priorityScore,
      status: 'open' as const,
      findingId: null,
      source: 'brief' as const,
    })
  );

  const openCount = workOrders.filter((w) => (w.status ?? 'open') === 'open').length;
  const total = workOrders.length || briefFallbacks.length;

  return (
    <AuditWorkspacePanel
      title="Work orders"
      description="What to unblock first to get more leads, sales conversations, and signups."
      actions={
        <>
          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
            {openCount} open · {total} total
          </span>
          <Button size="sm" variant="outline" render={<Link href={`${base}/graph`} />}>
            Lead Map
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`${base}/systems`} />}>
            Page Plays
          </Button>
        </>
      }
    >
      <WorkOrdersQueue
        projectId={projectId}
        workOrders={workOrders}
        briefFallbacks={briefFallbacks}
        filterAction={action ?? null}
        workspaceBase={base}
      />
    </AuditWorkspacePanel>
  );
}
