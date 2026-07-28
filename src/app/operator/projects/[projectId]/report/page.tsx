import { notFound } from 'next/navigation';
import { OperatorShell } from '@/components/operator/operator-shell';
import { ReportView } from '@/components/operator/report-view';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { getProjectLeadReportingSummary, getProjectWorkspace, isFullBriefUnlocked } from '@/lib/db/projects';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { AgentPrompt } from '@/lib/supabase/types';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  const website = workspace?.project.website ?? null;
  const audit = workspace?.audit ?? null;
  if (!workspace || !website || !audit?.metrics) notFound();

  const { project, intake } = workspace;
  const supabase = getSupabaseAdmin();
  const { data: prompts } = await supabase
    .from('agent_prompts')
    .select('*')
    .eq('audit_run_id', audit.auditRun.id);
  const leadReporting = await getProjectLeadReportingSummary(projectId);

  return (
    <OperatorShell>
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
      />
    </OperatorShell>
  );
}
