import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { FindingsTable } from '@/components/operator/findings-table';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditFindingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;
  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) notFound();

  const findings = workspace.audit?.findings ?? [];
  const high = findings.filter((f) => f.severity === 'high' || f.severity === 'critical').length;

  return (
    <AuditWorkspacePanel
      title="Findings"
      description="Evidence-first opportunity queue with severity, category, and page path."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total findings" value={String(findings.length)} />
        <Stat label="High / critical" value={String(high)} />
        <Stat
          label="Open"
          value={String(findings.filter((f) => f.status === 'open').length)}
        />
        <Stat
          label="Pages crawled"
          value={String(workspace.audit?.metrics?.pages_crawled ?? '—')}
        />
      </div>
      <AuditWorkspaceCard>
        <p className="font-medium text-zinc-950">Findings queue</p>
        <p className="mt-1 text-sm text-zinc-500">
          Open a finding to review evidence and the universal agent prompt.
        </p>
        <div className="mt-4">
          <FindingsTable
            projectId={projectId}
            findings={findings}
            detailBase={`/audit/${resolved.workspaceId}/findings`}
          />
        </div>
      </AuditWorkspaceCard>
    </AuditWorkspacePanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">{value}</p>
    </div>
  );
}
