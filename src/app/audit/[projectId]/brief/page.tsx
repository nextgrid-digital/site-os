import { notFound } from 'next/navigation';
import { AuditWorkspacePanel } from '@/components/audit/audit-workspace-panel';
import { ClientWorkflowBrief } from '@/components/audit/workflow/client-workflow-brief';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import {
  getProjectWorkspace,
  getWorkOrdersForAudit,
  listAuditRuns,
} from '@/lib/db/projects';
import { loadBrandEvidenceForAuditRun } from '@/lib/evidence/persist';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { AgentPrompt, Finding } from '@/lib/supabase/types';
import { buildMonthlyCompare } from '@/lib/workflow/monthly-compare';
import { buildUnifiedWorkItems } from '@/lib/workflow/work-items';

export default async function AuditBriefPage({
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
  if (!workspace?.project.website) notFound();

  const audit = workspace.audit;
  const brief = (audit?.growthBrief as GrowthBrief | null) ?? null;
  const completed = runs.filter((r) => r.status === 'completed');
  const previous = completed[1] ?? null;

  const supabase = getSupabaseAdmin();
  let prompts: AgentPrompt[] = [];
  let previousFindings: Finding[] = [];
  let previousOpenWork = 0;

  if (audit?.auditRun) {
    const [{ data: promptRows }, workOrders] = await Promise.all([
      supabase.from('agent_prompts').select('*').eq('audit_run_id', audit.auditRun.id),
      getWorkOrdersForAudit(audit.auditRun.id),
    ]);
    prompts = (promptRows as AgentPrompt[]) ?? [];

    const promptsByFindingId = new Map(prompts.map((p) => [p.finding_id, p]));
    const workItems = buildUnifiedWorkItems({
      findings: audit.findings ?? [],
      workOrders,
      promptsByFindingId,
    });
    const pending = workItems.filter((i) => i.status === 'open' || i.status === 'in_progress');

    if (previous) {
      const [{ data: prevFindings }, prevOrders, evidence] = await Promise.all([
        supabase
          .from('findings')
          .select('*')
          .eq('audit_run_id', previous.id)
          .order('priority_score', { ascending: false }),
        getWorkOrdersForAudit(previous.id),
        loadBrandEvidenceForAuditRun(supabase, audit.auditRun.id),
      ]);
      previousFindings = (prevFindings as Finding[]) ?? [];
      previousOpenWork = prevOrders.filter((o) => (o.status ?? 'open') === 'open').length;

      const monthly = buildMonthlyCompare({
        historicalChanges: evidence?.historical_changes ?? [],
        openWorkItems: pending,
        currentFindingCount: audit.findings?.length ?? 0,
        previousFindingCount: previousFindings.length,
        currentOpenWorkCount: pending.length,
        previousOpenWorkCount: previousOpenWork,
      });

      return (
        <AuditWorkspacePanel
          title="Brief"
          description="Client-ready action memo — plain English, ready to send or discuss."
        >
          <ClientWorkflowBrief
            domain={workspace.project.website.domain}
            brief={brief}
            pending={pending}
            monthly={monthly}
            workspaceBase={base}
          />
        </AuditWorkspacePanel>
      );
    }

    return (
      <AuditWorkspacePanel
        title="Brief"
        description="Client-ready action memo — plain English, ready to send or discuss."
      >
        <ClientWorkflowBrief
          domain={workspace.project.website.domain}
          brief={brief}
          pending={pending}
          monthly={null}
          workspaceBase={base}
        />
      </AuditWorkspacePanel>
    );
  }

  return (
    <AuditWorkspacePanel
      title="Brief"
      description="Client-ready action memo — plain English, ready to send or discuss."
    >
      <ClientWorkflowBrief
        domain={workspace.project.website.domain}
        brief={null}
        pending={[]}
        monthly={null}
        workspaceBase={base}
      />
    </AuditWorkspacePanel>
  );
}
