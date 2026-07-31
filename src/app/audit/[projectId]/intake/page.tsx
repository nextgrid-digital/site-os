import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { SettingsForm } from '@/components/operator/settings-form';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace, listNotes } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditIntakePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;

  const [workspace, notes] = await Promise.all([
    getProjectWorkspace(projectId),
    listNotes(projectId),
  ]);
  if (!workspace) notFound();

  return (
    <AuditWorkspacePanel
      title="Intake"
      description="Website URL, architecture inputs, and operator notes."
    >
      <AuditWorkspaceCard>
        <SettingsForm
          projectId={projectId}
          website={workspace.project.website}
          architectureInput={workspace.intake}
          notes={notes}
        />
      </AuditWorkspaceCard>
    </AuditWorkspacePanel>
  );
}
