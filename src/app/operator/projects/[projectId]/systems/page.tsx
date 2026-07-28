import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProgrammaticOpportunityCards } from '@/components/operator/report/programmatic-opportunity-cards';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { Button } from '@/components/ui/button';
import { getProjectWorkspace } from '@/lib/db/projects';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { filterLeadFitOpportunities } from '@/lib/reports/presale-labels';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function SystemsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace?.audit) notFound();

  const brief = workspace.audit.growthBrief as GrowthBrief | null;
  const opportunities = filterLeadFitOpportunities(
    brief?.commercialGraph?.topOpportunities ?? []
  );

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Presale GTM"
        title="Page Plays"
        description="Scalable pages that create more buyer conversations and leads — only when they fit this business."
        actions={
          <Button
            render={
              <Link
                href={`/operator/projects/${projectId}/work-orders?action=create_page_system`}
              />
            }
          >
            Fix Queue · page systems
          </Button>
        }
      />

      {opportunities.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          No lead-fit page systems detected yet. Run an audit with intake and/or Search Console
          connected.
        </div>
      ) : (
        <div className="typeset typeset-docs mx-auto max-w-[90ch] space-y-8">
          <ProgrammaticOpportunityCards opportunities={opportunities} />
          <div className="not-typeset">
            <Button
              render={
                <Link
                  href={`/operator/projects/${projectId}/work-orders?action=create_page_system`}
                />
              }
            >
              Execute page plays in Fix Queue
            </Button>
          </div>
        </div>
      )}
    </OperatorShell>
  );
}
