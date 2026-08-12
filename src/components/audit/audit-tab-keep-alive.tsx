'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AuditSpaTabProvider, useAuditTabCache } from '@/components/audit/audit-tab-cache';
import {
  AuditWorkspaceTabs,
  type WorkspaceConnectionStatus,
} from '@/components/audit/audit-workspace-tabs';
import { AuditRunProvider, useAuditRun } from '@/components/audit/audit-run-context';
import { AuditRunningPanel } from '@/components/audit/audit-running-panel';
import {
  WorkspaceAuditProvider,
  type WorkspaceAuditBundle,
} from '@/components/audit/workspace-audit-store';
import {
  SpaBriefPanel,
  SpaConnectPanel,
  SpaDashboardPanel,
  SpaLeadsPanel,
  SpaMonthlyPanel,
  SpaWorkPanel,
} from '@/components/audit/spa-tab-panels';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { AuditPrimaryTabSuffix } from '@/components/audit/audit-tab-cache';

export type AuditShellInitial = {
  auditRunId: string | null;
  connected: ConnectedAuditMetrics;
  growthBrief: unknown | null;
  leadSummary: unknown | null;
};

/**
 * SPA workspace shell — owns all primary panels; tab clicks never router.push.
 */
export function AuditTabKeepAlive({
  workspaceId,
  projectId,
  domain,
  websiteUrl,
  connection,
  lastAuditAt = null,
  initial,
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  lastAuditAt?: string | null;
  initial?: AuditShellInitial | null;
  /** Ignored — shell owns panels; child RSC pages are empty placeholders. */
  children?: ReactNode;
}) {
  const storeInitial: Partial<WorkspaceAuditBundle> | null = initial
    ? {
        projectId,
        auditRunId: initial.auditRunId,
        connected: initial.connected,
        growthBrief: initial.growthBrief,
        leadSummary: initial.leadSummary,
      }
    : null;

  return (
    <AuditSpaTabProvider workspaceId={workspaceId}>
      <WorkspaceAuditProvider projectId={projectId} initial={storeInitial}>
        <AuditRunProvider>
          <AuditWorkspaceShell
            workspaceId={workspaceId}
            projectId={projectId}
            domain={domain}
            websiteUrl={websiteUrl}
            connection={connection}
            lastAuditAt={lastAuditAt}
          />
        </AuditRunProvider>
      </WorkspaceAuditProvider>
    </AuditSpaTabProvider>
  );
}

function AuditWorkspaceShell({
  workspaceId,
  projectId,
  domain,
  websiteUrl,
  connection,
  lastAuditAt,
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  lastAuditAt: string | null;
}) {
  const { running, error } = useAuditRun();
  const showRunningUi = running || Boolean(error);
  const tab = useAuditTabCache();
  const active = (tab?.activeSuffix ?? '/workflow') as AuditPrimaryTabSuffix;
  const [mounted, setMounted] = useState<Set<AuditPrimaryTabSuffix>>(
    () => new Set([active])
  );

  useEffect(() => {
    setMounted((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  const base = `/audit/${workspaceId}`;

  return (
    <>
      <AuditWorkspaceTabs
        workspaceId={workspaceId}
        projectId={projectId}
        domain={domain}
        websiteUrl={websiteUrl}
        connection={connection}
        lastAuditAt={lastAuditAt}
        navigationDisabled={showRunningUi}
      />
      {showRunningUi ? (
        <AuditRunningPanel />
      ) : (
        <div>
          {mounted.has('/workflow') ? (
            <div
              hidden={active !== '/workflow'}
              {...(active !== '/workflow' ? { inert: true } : {})}
            >
              <SpaDashboardPanel
                workspaceId={workspaceId}
                domain={domain ?? ''}
                websiteUrl={websiteUrl}
              />
            </div>
          ) : null}
          {mounted.has('/brief') ? (
            <div hidden={active !== '/brief'} {...(active !== '/brief' ? { inert: true } : {})}>
              <SpaBriefPanel domain={domain ?? ''} workspaceBase={base} />
            </div>
          ) : null}
          {mounted.has('/work') ? (
            <div hidden={active !== '/work'} {...(active !== '/work' ? { inert: true } : {})}>
              <SpaWorkPanel projectId={projectId} />
            </div>
          ) : null}
          {mounted.has('/leads') ? (
            <div hidden={active !== '/leads'} {...(active !== '/leads' ? { inert: true } : {})}>
              <SpaLeadsPanel projectId={projectId} workspaceId={workspaceId} />
            </div>
          ) : null}
          {mounted.has('/monthly') ? (
            <div
              hidden={active !== '/monthly'}
              {...(active !== '/monthly' ? { inert: true } : {})}
            >
              <SpaMonthlyPanel projectId={projectId} workspaceBase={base} />
            </div>
          ) : null}
          {mounted.has('/connect') ? (
            <div
              hidden={active !== '/connect'}
              {...(active !== '/connect' ? { inert: true } : {})}
            >
              <SpaConnectPanel projectId={projectId} workspaceBase={base} />
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
