import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import {
  WorkOrdersQueue,
  type WorkOrderQueueItem,
} from '@/components/operator/work-orders-queue';
import { Button } from '@/components/ui/button';
import { getProjectWorkspace, getWorkOrdersForAudit } from '@/lib/db/projects';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function WorkOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { projectId } = await params;
  const { action } = await searchParams;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace?.audit?.auditRun) notFound();

  const workOrders = await getWorkOrdersForAudit(workspace.audit.auditRun.id);
  const brief = workspace.audit.growthBrief as GrowthBrief | null;
  const briefFallbacks: WorkOrderQueueItem[] = (brief?.commercialGraph?.topWorkOrders ?? []).map(
    (w, index) => ({
      id: null,
      actionType: w.actionType,
      title: w.title,
      summary: w.summary,
      fullPrompt: w.fullPrompt,
      priorityScore: w.priorityScore,
      status: 'open' as const,
      findingId: null,
      source: 'brief' as const,
      // stable key via title+index in client
      ...(index === -1 ? {} : {}),
    })
  );

  const openCount = workOrders.filter((w) => (w.status ?? 'open') === 'open').length;

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Presale GTM"
        title="Fix Queue"
        description="What to unblock first to get more leads, sales conversations, and signups."
        actions={
          <div className="flex flex-wrap gap-2">
            <BadgeCount openCount={openCount} total={workOrders.length || briefFallbacks.length} />
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/operator/projects/${projectId}/graph`} />}
            >
              Lead Map
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/operator/projects/${projectId}/systems`} />}
            >
              Page Plays
            </Button>
          </div>
        }
      />
      <WorkOrdersQueue
        projectId={projectId}
        workOrders={workOrders}
        briefFallbacks={briefFallbacks}
        filterAction={action ?? null}
      />
    </OperatorShell>
  );
}

function BadgeCount({ openCount, total }: { openCount: number; total: number }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
      {openCount} open · {total} total
    </span>
  );
}
