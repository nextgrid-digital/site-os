import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { BuyerPathMap } from '@/components/operator/report/buyer-path-map';
import { CommercialGraphSection } from '@/components/operator/report/commercial-graph-section';
import { GraphExecutiveMemo } from '@/components/operator/report/graph-executive-memo';
import { RelationshipHealth } from '@/components/operator/report/relationship-health';
import { Button } from '@/components/ui/button';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace } from '@/lib/db/projects';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditGraphPage({
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
  const graph = brief?.commercialGraph ?? null;

  return (
    <AuditWorkspacePanel
      title="Lead Map"
      description="ICPs, offers, pages, proof, CTAs, and missing buyer paths that block leads before the sale."
      actions={
        <Button render={<Link href={`${base}/work-orders`} />}>Open Fix Queue</Button>
      }
    >
      {!graph ? (
        <AuditWorkspaceCard>
          <p className="text-sm text-zinc-500">
            No lead map yet. Run an audit to map ICPs, offers, pages, proof, and conversion paths.
          </p>
        </AuditWorkspaceCard>
      ) : (
        <div className="typeset typeset-docs mx-auto max-w-[90ch] space-y-10 rounded-[14px] bg-white p-6 shadow-sm">
          <GraphExecutiveMemo memo={graph.executiveMemo} />
          <CommercialGraphSection graph={graph} />
          <BuyerPathMap paths={graph.topPaths} />
          <RelationshipHealth health={graph.relationshipHealth} />
          <div className="not-typeset">
            <Button render={<Link href={`${base}/work-orders`} />}>
              Fix lead blockers in Fix Queue
            </Button>
          </div>
        </div>
      )}
    </AuditWorkspacePanel>
  );
}
