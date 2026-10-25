'use client';

import { useEffect, useState } from 'react';
import { AuditWorkspacePanel } from '@/components/audit/audit-workspace-panel';
import { LastAuditLabel } from '@/components/audit/last-audit-label';
import { AeoScanner, type AeoPanelData } from '@/components/audit/report/aeo/aeo-scanner';
import { JoinedTrafficReport } from '@/components/audit/report/joined/joined-traffic-report';
import {
  useWorkspaceAudit,
  type FreeAuditStatus,
} from '@/components/audit/workspace-audit-store';
import { ClientWorkflowBrief } from '@/components/audit/workflow/client-workflow-brief';
import { MonthlyReviewPanel } from '@/components/audit/workflow/monthly-review-panel';
import { ConnectFlow } from '@/components/workspace/connect-flow';
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

function FreeAuditProgress({
  domain,
  status,
}: {
  domain: string;
  status: FreeAuditStatus | null;
}) {
  if (status === 'failed') {
    return (
      <div className="rounded-xl bg-raised px-6 py-12 text-center shadow-sm">
        <p className="text-base font-semibold text-foreground">The audit didn&apos;t finish</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          We couldn&apos;t complete the audit for {domain}. Run it again from the home page.
        </p>
      </div>
    );
  }
  if (status === 'none') {
    return (
      <div className="rounded-xl bg-raised px-6 py-12 text-center shadow-sm">
        <p className="text-base font-semibold text-foreground">No audit yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Run a free audit for {domain} to get your brief and task list.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-raised px-6 py-12 text-center shadow-sm" role="status">
      <p className="text-base font-semibold text-foreground">Auditing {domain}…</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        We&apos;re crawling the site and writing your brief. This usually takes a minute or two.
        This page updates by itself when it&apos;s ready.
      </p>
    </div>
  );
}

function PanelPulse() {
  return (
    <div className="motion-safe:animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-40 rounded-2xl bg-raised" />
      <div className="h-56 rounded-2xl bg-raised" />
    </div>
  );
}

export function SpaDashboardPanel({
  workspaceId,
  domain,
  websiteUrl,
  lastAuditAt = null,
}: {
  workspaceId: string;
  domain: string;
  websiteUrl: string;
  lastAuditAt?: string | null;
}) {
  const ctx = useWorkspaceAudit();
  const ensureSlice = ctx?.ensureSlice;
  useEffect(() => {
    void ensureSlice?.('dashboard');
  }, [ensureSlice]);

  const connected = ctx?.bundle?.connected ?? null;

  if (!connected && ctx?.sliceLoading.dashboard) return <PanelPulse />;

  return (
    <div className="space-y-3">
      <LastAuditLabel lastAuditAt={lastAuditAt} />
      <JoinedTrafficReport
        projectId={workspaceId}
        connectedMetrics={connected}
        domain={domain || undefined}
        websiteConnected={Boolean(websiteUrl)}
        websiteLabel={domain || null}
      />
    </div>
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

  // No audit run yet: say so, instead of an empty brief that reads as "all caught up".
  if (ctx?.bundle && !ctx.bundle.auditRunId) {
    return (
      <AuditWorkspacePanel
        title="Brief"
        description="Client-ready action memo — plain English, ready to send or discuss."
      >
        <FreeAuditProgress domain={domain} status={ctx.auditStatus} />
      </AuditWorkspacePanel>
    );
  }

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
    currentAt?: string | null;
    previousAt?: string | null;
  } | null;

  if (!monthly && ctx?.sliceLoading.monthly) return <PanelPulse />;

  if (!monthly?.currentLabel) {
    return (
      <AuditWorkspacePanel
        title="Monthly check-in"
        description="Your site's progress, month over month — in plain English."
      >
        <div className="rounded-xl bg-raised px-6 py-12 text-center shadow-sm">
          <p className="text-base font-semibold text-foreground">No audits yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Run your first audit to set a baseline. From then on, each monthly re-run shows what
            got better, what slipped, and what to fix next.
          </p>
        </div>
      </AuditWorkspacePanel>
    );
  }

  return (
    <AuditWorkspacePanel
      title="Monthly check-in"
      description="What got better, what slipped, and what to fix next — compared to your last audit."
    >
      <MonthlyReviewPanel
        projectId={projectId}
        compare={monthly.compare}
        hasPrevious={monthly.hasPrevious}
        currentLabel={monthly.currentLabel}
        previousLabel={monthly.previousLabel}
        currentAt={monthly.currentAt ?? null}
        previousAt={monthly.previousAt ?? null}
      />
    </AuditWorkspacePanel>
  );
}

export function SpaAeoPanel({ domain }: { domain: string }) {
  const ctx = useWorkspaceAudit();
  const ensureSlice = ctx?.ensureSlice;
  useEffect(() => {
    void ensureSlice?.('aeo');
  }, [ensureSlice]);

  const aeo = ctx?.bundle?.aeo as AeoPanelData | null | undefined;
  const title = 'AI answer readiness';
  const description =
    'How easy each page is for AI answer engines to read, trust and quote.';

  if (!aeo && ctx?.sliceLoading.aeo) return <PanelPulse />;

  if (ctx?.bundle && !ctx.bundle.auditRunId) {
    return (
      <AuditWorkspacePanel title={title} description={description}>
        <FreeAuditProgress domain={domain} status={ctx.auditStatus} />
      </AuditWorkspacePanel>
    );
  }

  // Audits from before AEO scanning have a run but no page scans.
  if (!aeo || aeo.pages.length === 0) {
    return (
      <AuditWorkspacePanel title={title} description={description}>
        <div className="rounded-xl bg-raised px-6 py-12 text-center shadow-sm">
          <p className="text-base font-semibold text-foreground">No AEO scan for this audit</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Re-run the audit for {domain || 'this site'} to scan every crawled page for schema,
            direct answers and quotable structure.
          </p>
        </div>
      </AuditWorkspacePanel>
    );
  }

  return (
    <AuditWorkspacePanel title={title} description={description}>
      <AeoScanner
        data={aeo}
        projectId={(ctx?.bundle as { projectId?: string } | null | undefined)?.projectId}
        domain={domain}
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
      setMessage('Google connected. Next, pick which site and accounts to track below.');
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
      description="Connect your Google data in a few minutes so your audit uses real search and visitor numbers."
    >
      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-danger-ink/20 bg-danger-soft px-4 py-3 text-sm text-danger-ink">
          {errorMessage}
        </div>
      ) : null}
      {message ? (
        <div className="mb-4 rounded-xl border border-success-ink/20 bg-success-soft px-4 py-3 text-sm text-success-ink">
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
        viewerSignedIn={Boolean(connect)}
        workspaceBase={workspaceBase}
      />
    </AuditWorkspacePanel>
  );
}

// Re-export type used by seed
export type { ConnectedAuditMetrics };
