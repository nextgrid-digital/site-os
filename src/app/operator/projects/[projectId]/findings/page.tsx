import { notFound } from 'next/navigation';
import { FindingsTable } from '@/components/operator/findings-table';
import { OperatorCard } from '@/components/operator/operator-card';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { StatCard } from '@/components/operator/stat-card';
import { getProjectWorkspace } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function FindingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) notFound();

  const findings = workspace.audit?.findings ?? [];
  const high = findings.filter((f) => f.severity === 'high' || f.severity === 'critical').length;

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Findings"
        title={workspace.project.name}
        description="Evidence-first opportunity queue with severity, category, and page path."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total findings" value={findings.length} />
        <StatCard label="High / critical" value={high} tone="priority" />
        <StatCard label="Open" value={findings.filter((f) => f.status === 'open').length} />
        <StatCard
          label="Pages crawled"
          value={workspace.audit?.metrics?.pages_crawled ?? '—'}
        />
      </section>

      <OperatorCard>
        <p className="font-medium text-foreground">Findings queue</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a finding to review evidence and the universal agent prompt.
        </p>
        <div className="mt-4">
          <FindingsTable projectId={projectId} findings={findings} />
        </div>
      </OperatorCard>
    </OperatorShell>
  );
}
