import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { ProgrammaticOpportunityCards } from '@/components/operator/report/programmatic-opportunity-cards';
import { Button } from '@/components/ui/button';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace } from '@/lib/db/projects';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { filterLeadFitOpportunities } from '@/lib/reports/presale-labels';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditSystemsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;
  const base = `/audit/${resolved.workspaceId}`;

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace?.audit) notFound();

  const brief = workspace.audit.growthBrief as GrowthBrief | null;
  const opportunities = filterLeadFitOpportunities(
    brief?.commercialGraph?.topOpportunities ?? []
  );

  return (
    <AuditWorkspacePanel
      title="Page Plays"
      description="Scalable pages that create more buyer conversations and leads — only when they fit this business."
      actions={
        <Button render={<Link href={`${base}/work-orders?action=create_page_system`} />}>
          Fix Queue · page systems
        </Button>
      }
    >
      {opportunities.length === 0 ? (
        <AuditWorkspaceCard>
          <p className="text-sm text-zinc-500">
            No lead-fit page systems detected yet. Run an audit with intake and/or Search Console
            connected.
          </p>
        </AuditWorkspaceCard>
      ) : (
        <div className="typeset typeset-docs mx-auto max-w-[90ch] space-y-8 rounded-[14px] border border-zinc-200 bg-white p-6 shadow-sm">
          <ProgrammaticOpportunityCards opportunities={opportunities} />
          <div className="not-typeset">
            <Button render={<Link href={`${base}/work-orders?action=create_page_system`} />}>
              Execute page plays in Fix Queue
            </Button>
          </div>
        </div>
      )}
    </AuditWorkspacePanel>
  );
}
