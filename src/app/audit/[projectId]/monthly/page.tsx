import { notFound } from 'next/navigation';
import { AuditWorkspacePanel } from '@/components/audit/audit-workspace-panel';
import { MonthlyReviewPanel } from '@/components/audit/workflow/monthly-review-panel';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import {
  getProjectWorkspace,
  getWorkOrdersForAudit,
  listAuditRuns,
} from '@/lib/db/projects';
import { loadBrandEvidenceForAuditRun } from '@/lib/evidence/persist';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { AgentPrompt, Finding } from '@/lib/supabase/types';
import { buildMonthlyCompare } from '@/lib/workflow/monthly-compare';
import { buildUnifiedWorkItems } from '@/lib/workflow/work-items';

export default async function AuditMonthlyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;
  const base = `/audit/${resolved.workspaceId}`;

  const [workspace, runs] = await Promise.all([
    getProjectWorkspace(projectId),
    listAuditRuns(projectId),
  ]);
  if (!workspace) notFound();

  const completed = runs.filter((r) => r.status === 'completed');
  const current = completed[0] ?? null;
  const previous = completed[1] ?? null;

  if (!current) {
    return (
      <AuditWorkspacePanel
        title="Monthly"
        description="Compare audits over time for retainers and follow-up."
      >
        <div className="rounded-[14px] bg-white px-4 py-10 text-center text-sm text-zinc-500">
          Complete an audit first, then run again next month to compare.
        </div>
      </AuditWorkspacePanel>
    );
  }

  const supabase = getSupabaseAdmin();
  const audit = workspace.audit;
  const [{ data: prompts }, workOrders, evidence] = await Promise.all([
    supabase.from('agent_prompts').select('*').eq('audit_run_id', current.id),
    getWorkOrdersForAudit(current.id),
    loadBrandEvidenceForAuditRun(supabase, current.id),
  ]);

  const promptsByFindingId = new Map(
    ((prompts as AgentPrompt[]) ?? []).map((p) => [p.finding_id, p])
  );
  const workItems = buildUnifiedWorkItems({
    findings: audit?.findings ?? [],
    workOrders,
    promptsByFindingId,
  });
  const pending = workItems.filter((i) => i.status === 'open' || i.status === 'in_progress');

  let previousFindingCount: number | null = null;
  let previousOpenWorkCount: number | null = null;
  if (previous) {
    const [{ data: prevFindings }, prevOrders] = await Promise.all([
      supabase.from('findings').select('id').eq('audit_run_id', previous.id),
      getWorkOrdersForAudit(previous.id),
    ]);
    previousFindingCount = (prevFindings as Finding[] | null)?.length ?? 0;
    previousOpenWorkCount = prevOrders.filter((o) => (o.status ?? 'open') === 'open').length;
  }

  const compare = previous
    ? buildMonthlyCompare({
        historicalChanges: evidence?.historical_changes ?? [],
        openWorkItems: pending,
        currentFindingCount: audit?.findings?.length ?? 0,
        previousFindingCount,
        currentOpenWorkCount: pending.length,
        previousOpenWorkCount,
      })
    : null;

  const formatRun = (createdAt: string, runType: string) =>
    `${new Date(createdAt).toLocaleDateString()} · ${runType}`;

  return (
    <AuditWorkspacePanel
      title="Monthly"
      description="See what got better, what got worse, and what is still open."
    >
      <MonthlyReviewPanel
        workspaceBase={base}
        projectId={projectId}
        currentLabel={formatRun(current.created_at, current.run_type)}
        previousLabel={
          previous ? formatRun(previous.created_at, previous.run_type) : null
        }
        compare={compare}
        hasPrevious={Boolean(previous)}
      />
    </AuditWorkspacePanel>
  );
}
