import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { LeadFunnelSummary } from '@/components/operator/lead-funnel-summary';
import { LeadsTable } from '@/components/operator/leads-table';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectLeadReportingSummary, getProjectOverview, listLeads } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditLeadsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;

  const [project, leads] = await Promise.all([
    getProjectOverview(projectId),
    listLeads(projectId),
  ]);
  if (!project) notFound();
  const reporting = await getProjectLeadReportingSummary(projectId, leads);

  return (
    <AuditWorkspacePanel
      title="Leads"
      description="Track channel attribution, funnel stage, and current status."
    >
      <AuditWorkspaceCard>
        <LeadFunnelSummary
          projectId={projectId}
          reporting={reporting}
          title={`${project.name} lead funnel`}
          description="Cached audit traffic summary plus app-owned lead pipeline."
        />
      </AuditWorkspaceCard>
      <AuditWorkspaceCard>
        <LeadsTable projectId={projectId} initialLeads={leads} />
      </AuditWorkspaceCard>
    </AuditWorkspacePanel>
  );
}
