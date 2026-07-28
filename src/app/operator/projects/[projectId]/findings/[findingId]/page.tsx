import { notFound } from 'next/navigation';
import { OperatorCard } from '@/components/operator/operator-card';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { PromptBlock } from '@/components/operator/prompt-block';
import { Badge } from '@/components/ui/badge';
import { getFindingDetail, getProjectOverview } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function FindingDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; findingId: string }>;
}) {
  const { projectId, findingId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const [project, detail] = await Promise.all([
    getProjectOverview(projectId),
    getFindingDetail(projectId, findingId),
  ]);
  if (!project || !detail) notFound();

  const { finding, prompt } = detail;

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Finding detail"
        title={finding.title}
        description={project.name}
        actions={
          <>
            <Badge>{finding.severity}</Badge>
            <Badge variant="outline">{finding.category}</Badge>
            {finding.page_path ? <Badge variant="secondary">{finding.page_path}</Badge> : null}
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <OperatorCard>
          <p className="font-medium text-foreground">Evidence</p>
          <p className="mt-1 text-sm text-muted-foreground">Why this finding was generated</p>
          <div className="mt-4 space-y-3 text-sm text-foreground/90">
            <p>{finding.summary}</p>
            <p className="text-muted-foreground">Buyer moment: {finding.buyer_moment ?? '—'}</p>
            <p className="text-muted-foreground">Estimated value: {finding.estimated_value ?? '—'}</p>
          </div>
        </OperatorCard>

        <OperatorCard className="lg:col-span-2">
          <p className="font-medium text-foreground">Universal agent prompt</p>
          <p className="mt-1 text-sm text-muted-foreground">
            One prompt format for every finding. Copy and execute manually.
          </p>
          <div className="mt-4">
            {prompt ? (
              <PromptBlock prompt={prompt} />
            ) : (
              <p className="text-sm text-muted-foreground">No prompt generated.</p>
            )}
          </div>
        </OperatorCard>
      </div>
    </OperatorShell>
  );
}
