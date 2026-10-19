'use client';

import { useEffect, useState } from 'react';
import { AuditWorkspacePanel } from '@/components/audit/audit-workspace-panel';
import { JoinedTrafficReport } from '@/components/audit/report/joined/joined-traffic-report';
import { useWorkspaceAudit } from '@/components/audit/workspace-audit-store';
import { ClientWorkflowBrief } from '@/components/audit/workflow/client-workflow-brief';
import { MonthlyReviewPanel } from '@/components/audit/workflow/monthly-review-panel';
import { ConnectFlow } from '@/components/operator/connect-flow';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import type {
  Ga4Property,
  GoogleAdsAccount,
  SearchConsoleProperty,
} from '@/lib/supabase/types';
import type { ConnectorStatus } from '@/lib/connectors/types';
import type { ConnectionStatus } from '@/lib/google/connection-status';
import type { WorkItemView } from '@/lib/workflow/work-items';
import type { MonthlyCompareSection } from '@/lib/workflow/monthly-compare';

function PanelPulse() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-40 rounded-2xl bg-white" />
      <div className="h-56 rounded-2xl bg-white" />
    </div>
  );
}

export function SpaDashboardPanel({
  workspaceId,
  domain,
  websiteUrl,
}: {
  workspaceId: string;
  domain: string;
  websiteUrl: string;
}) {
  const ctx = useWorkspaceAudit();
  const ensureSlice = ctx?.ensureSlice;
  useEffect(() => {
    void ensureSlice?.('dashboard');
  }, [ensureSlice]);

  const connected = ctx?.bundle?.connected ?? null;

  if (!connected && ctx?.sliceLoading.dashboard) return <PanelPulse />;

  return (
    <JoinedTrafficReport
      projectId={workspaceId}
      connectedMetrics={connected}
      domain={domain || undefined}
      websiteConnected={Boolean(websiteUrl)}
      websiteLabel={domain || null}
    />
  );
}

export function SpaBriefPanel({
  domain,
  workspaceBase,
}: {
  domain: string;
  workspaceBase: string;
}) {
  const ctx = useWorkspaceAudit();
  const ensureSlice = ctx?.ensureSlice;
  useEffect(() => {
    void ensureSlice?.('brief');
  }, [ensureSlice]);

  if (!ctx?.bundle?.brief && ctx?.sliceLoading.brief) return <PanelPulse />;

  const briefPayload = ctx?.bundle?.brief as {
    growthBrief: GrowthBrief | null;
    pending: WorkItemView[];
    monthly: MonthlyCompareSection | null;
  } | null;

  return (
    <AuditWorkspacePanel
      title="Brief"
      description="Client-ready action memo — plain English, ready to send or discuss."
    >
      <ClientWorkflowBrief
        domain={domain}
        brief={(briefPayload?.growthBrief as GrowthBrief | null) ?? null}
        pending={briefPayload?.pending ?? []}
        monthly={briefPayload?.monthly ?? null}
        workspaceBase={workspaceBase}
      />
    </AuditWorkspacePanel>
  );
}

export function SpaMonthlyPanel({ projectId }: { projectId: string }) {
  const ctx = useWorkspaceAudit();
  const ensureSlice = ctx?.ensureSlice;
  useEffect(() => {
    void ensureSlice?.('monthly');
  }, [ensureSlice]);

  const monthly = ctx?.bundle?.monthly as {
    compare: MonthlyCompareSection | null;
    hasPrevious: boolean;
    currentLabel: string | null;
    previousLabel: string | null;
  } | null;

  if (!monthly && ctx?.sliceLoading.monthly) return <PanelPulse />;

  if (!monthly?.currentLabel) {
    return (
      <AuditWorkspacePanel
        title="Monthly"
        description="Compare audits over time for retainers and follow-up."
      >
        <div className="rounded-[14px] bg-white px-4 py-10 text-center text-sm text-zinc-500">
          Complete an audit first, then run again next month to compare.
        </div>
      </AuditWorkspacePanel>
    );
  }

  return (
    <AuditWorkspacePanel
      title="Monthly"
      description="See what got better, what got worse, and what is still open."
    >
      <MonthlyReviewPanel
        projectId={projectId}
        compare={monthly.compare}
        hasPrevious={monthly.hasPrevious}
        currentLabel={monthly.currentLabel}
        previousLabel={monthly.previousLabel}
      />
    </AuditWorkspacePanel>
  );
}

export function SpaConnectPanel({
  projectId,
  workspaceBase,
}: {
  projectId: string;
  workspaceBase: string;
}) {
  const ctx = useWorkspaceAudit();
  const ensureSlice = ctx?.ensureSlice;
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void ensureSlice?.('connect');
  }, [ensureSlice]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setMessage('Google account connected. Sync and select properties below.');
    }
    const error = params.get('error');
    if (error) {
      setErrorMessage(error);
    }
  }, []);

  const connect = ctx?.bundle?.connect as {
    googleConnected: boolean;
    gscProperties: SearchConsoleProperty[];
    ga4Properties: Ga4Property[];
    adsAccounts: GoogleAdsAccount[];
    connectorStatuses: ConnectorStatus[];
    operatorEmail: string | null;
    connectedEmail: string | null;
    tokenExpiry: string | null;
    lastSyncedAt: string | null;
    scopes: string[];
    missingFeatures: { key: string; label: string }[];
    connectionStatus: ConnectionStatus;
    clientAccessConfirmedAt: string | null;
  } | null;

  if (!connect && ctx?.sliceLoading.connect) return <PanelPulse />;

  return (
    <AuditWorkspacePanel
      title="Setup"
      description="Connect Google, sync properties, and map Search Console, GA4, and Ads — then run the audit from Dashboard."
    >
      {errorMessage ? (
        <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </div>
      ) : null}
      {message ? (
        <div className="mb-4 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </div>
      ) : null}
      <ConnectFlow
        projectId={projectId}
        googleConnected={connect?.googleConnected ?? false}
        gscProperties={connect?.gscProperties ?? []}
        ga4Properties={connect?.ga4Properties ?? []}
        adsAccounts={connect?.adsAccounts ?? []}
        connectorStatuses={connect?.connectorStatuses ?? []}
        operatorEmail={connect?.operatorEmail ?? null}
        connectedEmail={connect?.connectedEmail ?? null}
        tokenExpiry={connect?.tokenExpiry ?? null}
        lastSyncedAt={connect?.lastSyncedAt ?? null}
        scopes={connect?.scopes ?? []}
        missingFeatures={connect?.missingFeatures ?? []}
        connectionStatus={connect?.connectionStatus ?? 'not_granted'}
        clientAccessConfirmedAt={connect?.clientAccessConfirmedAt ?? null}
        workspaceBase={workspaceBase}
      />
    </AuditWorkspacePanel>
  );
}

// Re-export type used by seed
export type { ConnectedAuditMetrics };
