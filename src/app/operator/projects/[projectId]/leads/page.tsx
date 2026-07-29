import { notFound } from 'next/navigation';
import { LeadFunnelSummary } from '@/components/operator/lead-funnel-summary';
import { LeadsTable } from '@/components/operator/leads-table';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { getProjectLeadReportingSummary, getProjectOverview, listLeads } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const [project, leads] = await Promise.all([
    getProjectOverview(projectId),
    listLeads(projectId),
  ]);
  if (!project) notFound();
  const reporting = await getProjectLeadReportingSummary(projectId, leads);

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Pipeline"
        title="Leads"
        description="Track channel attribution, funnel stage, and current status."
      />
      <LeadFunnelSummary
        projectId={projectId}
        reporting={reporting}
        title={`${project.name} lead funnel`}
        description="Cached audit traffic summary plus app-owned lead pipeline."
      />
      <LeadsTable projectId={projectId} initialLeads={leads} />
    </OperatorShell>
  );
}
