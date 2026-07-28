import { notFound } from 'next/navigation';
import { ConnectFlow } from '@/components/operator/connect-flow';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import {
  getGoogleConnection,
  getProjectOverview,
  isFullBriefUnlocked,
  listPropertyOptions,
} from '@/lib/db/projects';
import { getOperatorEmail } from '@/lib/google/oauth';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function ConnectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ connected?: string }>;
}) {
  const { projectId } = await params;
  const query = await searchParams;
  if (!hasSupabaseConfig()) notFound();

  const [project, properties, connection] = await Promise.all([
    getProjectOverview(projectId),
    listPropertyOptions(projectId),
    getGoogleConnection(),
  ]);
  if (!project) notFound();

  const unlocked = isFullBriefUnlocked(project);

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Connect"
        title={project.name}
        description={
          unlocked
            ? 'Connect Google, sync properties, and save the Search Console + GA4 mapping.'
            : 'Unlock full audit access to connect Search Console and GA4.'
        }
      />
      {query.connected && unlocked ? (
        <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Google account connected. Sync and select properties below.
        </div>
      ) : null}
      <ConnectFlow
        projectId={projectId}
        googleConnected={Boolean(connection)}
        gscProperties={properties.gsc}
        ga4Properties={properties.ga4}
        operatorEmail={connection?.operator_email ?? getOperatorEmail()}
        fullBriefUnlocked={unlocked}
      />
    </OperatorShell>
  );
}
