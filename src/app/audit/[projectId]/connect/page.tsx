import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { ConnectFlow } from '@/components/operator/connect-flow';
import { loadProjectConnectorStatuses } from '@/lib/connectors/project-status';
import { getSessionPlan } from '@/lib/db/profiles';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import {
  getGoogleConnection,
  getProjectOverview,
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

  const [project, properties, connection, session, connectorState] = await Promise.all([
    getProjectOverview(projectId),
    listPropertyOptions(projectId),
    getGoogleConnection(),
    getSessionPlan(),
    loadProjectConnectorStatuses(projectId),
  ]);
  if (!project) notFound();

  return (
    <AuditWorkspacePanel
      title="Connect"
      description={
        session.signedIn
          ? 'Connect Google, sync properties, and map Search Console, GA4, and Ads to this project.'
          : 'Sign in to connect Search Console, GA4, and Ads.'
      }
    >
      {!session.signedIn ? (
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sign in to connect acquisition sources.
        </div>
      ) : null}
      {query.connected && session.signedIn ? (
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
          adsAccounts={properties.ads}
          connectorStatuses={connectorState.statuses}
          operatorEmail={connection?.operator_email ?? getOperatorEmail()}
          fullBriefUnlocked
          paidPlan
          workspaceBase={`/audit/${workspace.workspaceId}`}
        />
      </AuditWorkspaceCard>
    </AuditWorkspacePanel>
  );
}
