import { notFound } from 'next/navigation';
import { OperatorCard } from '@/components/operator/operator-card';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { Badge } from '@/components/ui/badge';
import { getProjectWorkspace } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function ArchitecturePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) notFound();

  const architecture = workspace.audit?.architecture ?? [];

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Architecture"
        title={workspace.project.name}
        description="Missing ICP, product, solution, and proof pages detected from crawl and operator inputs."
      />

      {!architecture.length ? (
        <OperatorCard>
          <p className="font-medium text-foreground">No architecture recommendations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run an audit to generate page-gap analysis.
          </p>
        </OperatorCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {architecture.map((item) => (
            <OperatorCard key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.rationale}</p>
                </div>
                <Badge variant="secondary">{item.priority}</Badge>
              </div>
              {item.suggested_path ? (
                <p className="mt-3 font-mono text-xs text-muted-foreground">{item.suggested_path}</p>
              ) : null}
            </OperatorCard>
          ))}
        </div>
      )}
    </OperatorShell>
  );
}
