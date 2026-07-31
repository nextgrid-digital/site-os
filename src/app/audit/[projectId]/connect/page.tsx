import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { ConnectFlow } from '@/components/operator/connect-flow';
import { getSessionPlan } from '@/lib/db/profiles';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import {
  getGoogleConnection,
  getProjectOverview,
  isFullBriefUnlocked,
  listPropertyOptions,
} from '@/lib/db/projects';
import { getOperatorEmail } from '@/lib/google/oauth';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditConnectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ connected?: string; upgrade?: string }>;
}) {
  const { projectId: id } = await params;
  const query = await searchParams;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await resolveAuditWorkspace(id);
  const projectId = workspace.projectId;

  const [project, properties, connection, session] = await Promise.all([
    getProjectOverview(projectId),
    listPropertyOptions(projectId),
    getGoogleConnection(),
    getSessionPlan(),
  ]);
  if (!project) notFound();

  const unlocked = isFullBriefUnlocked(project);
  const paidReady = session.isPaid;

  return (
    <AuditWorkspacePanel
      title="Connect"
      description={
        !paidReady
          ? 'A paid Site-OS plan is required before connecting Search Console and GA4.'
          : unlocked
            ? 'Connect Google, sync properties, and save the Search Console + GA4 mapping.'
            : 'Unlock full audit access to connect Search Console and GA4.'
      }
    >
      {!paidReady || query.upgrade === '1' ? (
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {session.signedIn
            ? 'This account is on the free plan. Upgrade to paid to unlock Google connections.'
            : 'Sign in with a paid account to connect Search Console and GA4.'}
        </div>
      ) : null}
      {query.connected && unlocked && paidReady ? (
        <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Google account connected. Sync and select properties below.
        </div>
      ) : null}
      <AuditWorkspaceCard>
        <ConnectFlow
          projectId={projectId}
          googleConnected={Boolean(connection)}
          gscProperties={properties.gsc}
          ga4Properties={properties.ga4}
          operatorEmail={connection?.operator_email ?? getOperatorEmail()}
          fullBriefUnlocked={unlocked && paidReady}
          paidPlan={paidReady}
          workspaceBase={`/audit/${workspace.workspaceId}`}
        />
      </AuditWorkspaceCard>
    </AuditWorkspacePanel>
  );
}
