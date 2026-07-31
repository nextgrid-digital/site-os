import { notFound } from 'next/navigation';
import { AuditWorkspacePanel } from '@/components/audit/audit-workspace-panel';
import { ReportView } from '@/components/operator/report-view';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import {
  getProjectLeadReportingSummary,
  getProjectWorkspace,
  isFullBriefUnlocked,
} from '@/lib/db/projects';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { AgentPrompt } from '@/lib/supabase/types';

export default async function AuditGrowthPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;

  const workspace = await getProjectWorkspace(projectId);
  const website = workspace?.project.website ?? null;
  const audit = workspace?.audit ?? null;
  if (!workspace || !website || !audit?.metrics) notFound();

  const { project, intake } = workspace;
  const supabase = getSupabaseAdmin();
  const [{ data: prompts }, leadReporting] = await Promise.all([
    supabase.from('agent_prompts').select('*').eq('audit_run_id', audit.auditRun.id),
    getProjectLeadReportingSummary(projectId),
  ]);

  return (
    <AuditWorkspacePanel
      title="Growth report"
      description="Operator growth brief with findings, pricing, and execution context."
    >
      <ReportView
        project={project}
        website={website}
        metrics={audit.metrics}
        findings={audit.findings}
        prompts={(prompts as AgentPrompt[]) ?? []}
        pricing={audit.pricing}
        architecture={audit.architecture}
        queryMetrics={audit.queryMetrics}
        aeo={audit.aeo}
        operatorNotes={intake}
        auditRun={audit.auditRun}
        growthBrief={(audit.growthBrief as GrowthBrief | null) ?? null}
        fullBriefUnlocked={isFullBriefUnlocked(project)}
        leadReporting={leadReporting}
        workspaceBase={`/audit/${resolved.workspaceId}`}
      />
    </AuditWorkspacePanel>
  );
}
