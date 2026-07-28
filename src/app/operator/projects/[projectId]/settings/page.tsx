import { notFound } from 'next/navigation';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { SettingsForm } from '@/components/operator/settings-form';
import { getProjectWorkspace, listNotes } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const [workspace, notes] = await Promise.all([
    getProjectWorkspace(projectId),
    listNotes(projectId),
  ]);
  if (!workspace) notFound();

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Settings"
        title={workspace.project.name}
        description="Website URL, architecture inputs, and operator notes."
      />
      <SettingsForm
        projectId={projectId}
        website={workspace.project.website}
        architectureInput={workspace.intake}
        notes={notes}
      />
    </OperatorShell>
  );
}
