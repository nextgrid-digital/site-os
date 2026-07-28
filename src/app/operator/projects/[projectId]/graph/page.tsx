import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BuyerPathMap } from '@/components/operator/report/buyer-path-map';
import { CommercialGraphSection } from '@/components/operator/report/commercial-graph-section';
import { GraphExecutiveMemo } from '@/components/operator/report/graph-executive-memo';
import { RelationshipHealth } from '@/components/operator/report/relationship-health';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { Button } from '@/components/ui/button';
import { getProjectWorkspace } from '@/lib/db/projects';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function GraphPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace?.audit) notFound();

  const brief = workspace.audit.growthBrief as GrowthBrief | null;
  const graph = brief?.commercialGraph ?? null;

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Presale GTM"
        title="Lead Map"
        description="ICPs, offers, pages, proof, CTAs, and missing buyer paths that block leads before the sale."
        actions={
          <Button render={<Link href={`/operator/projects/${projectId}/work-orders`} />}>
            Open Fix Queue
          </Button>
        }
      />

      {!graph ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          No lead map yet. Run an audit to map ICPs, offers, pages, proof, and conversion paths.
        </div>
      ) : (
        <div className="typeset typeset-docs mx-auto max-w-[90ch] space-y-10">
          <GraphExecutiveMemo memo={graph.executiveMemo} />
          <CommercialGraphSection graph={graph} />
          <BuyerPathMap paths={graph.topPaths} />
          <RelationshipHealth health={graph.relationshipHealth} />
          <div className="not-typeset">
            <Button render={<Link href={`/operator/projects/${projectId}/work-orders`} />}>
              Fix lead blockers in Fix Queue
            </Button>
          </div>
        </div>
      )}
    </OperatorShell>
  );
}
