'use client';

import { useEffect, useState } from 'react';
import {
  useAuditTabCache,
  type AuditPrimaryTabSuffix,
} from '@/components/audit/audit-tab-cache';
import { AddSiteAuditDialog } from '@/components/audit/add-site-audit-dialog';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import { RerunFullAuditButton } from '@/components/audit/rerun-full-audit-button';
import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DASHBOARD_LOCK_MESSAGE, type DashboardLock } from '@/lib/audit/dashboard-lock';
import { cn } from '@/lib/utils';
import { LockIcon } from '@/components/icons';

const PRIMARY_TABS: {
  id: string;
  label: string;
  suffix: AuditPrimaryTabSuffix;
}[] = [
  { id: 'workflow', label: 'Dashboard', suffix: '/workflow' },
  { id: 'brief', label: 'Brief', suffix: '/brief' },
  { id: 'monthly', label: 'Monthly', suffix: '/monthly' },
  { id: 'aeo', label: 'AEO', suffix: '/aeo' },
  { id: 'connect', label: 'Setup', suffix: '/connect' },
];

function suffixToId(suffix: AuditPrimaryTabSuffix): string {
  return suffix.slice(1);
}

function idToSuffix(id: string): AuditPrimaryTabSuffix | null {
  const match = PRIMARY_TABS.find((tab) => tab.id === id);
  return match?.suffix ?? null;
}

export type WorkspaceConnectionStatus = {
  gscConnected: boolean;
  ga4Connected: boolean;
  adsConnected: boolean;
  gscPropertyLabel: string | null;
  ga4PropertyLabel: string | null;
  adsAccountLabel: string | null;
  websiteConnected: boolean;
  googleConnected: boolean;
};

export function AuditWorkspaceTabs({
  workspaceId,
  projectId,
  domain,
  websiteUrl,
  connection,
  navigationDisabled = false,
  signedIn = false,
  dashboardLock = null,
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  navigationDisabled?: boolean;
  signedIn?: boolean;
  dashboardLock?: DashboardLock;
}) {
  const [lockTipOpen, setLockTipOpen] = useState(false);
  const tabCache = useAuditTabCache();
  const isGuest = !signedIn;
  const loginHref = `/login?next=${encodeURIComponent(`/audit/${workspaceId}`)}`;
  useEffect(() => {
    if (!lockTipOpen) return;
    const t = window.setTimeout(() => setLockTipOpen(false), 4000);
    return () => window.clearTimeout(t);
  }, [lockTipOpen]);
  const activeId = suffixToId(tabCache?.activeSuffix ?? '/workflow');

  return (
    <div className="mb-6 flex flex-col gap-3 pb-4">
      {domain ? (
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {domain}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          variant="pill"
          value={activeId}
         
          onValueChange={(id) => {
            if (navigationDisabled || !tabCache) return;
            if (id === 'workflow' && dashboardLock) {
              setLockTipOpen(true);
              return;
            }
            const suffix = idToSuffix(id);
            if (!suffix) return;
            tabCache.setTab(suffix);
          }}
        >
          <TabsList
            aria-label="Audit workspace"
            className={cn(
              'max-w-full flex-wrap rounded-xl bg-muted shadow-sm',
              navigationDisabled && 'pointer-events-none opacity-50'
            )}
          >
            {PRIMARY_TABS.map((tab) => {
              const locked = tab.id === 'workflow' && dashboardLock !== null;
              const trigger = (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={navigationDisabled}
                  indicatorClassName="bg-foreground"
                  className={cn(
                    activeId === tab.id
                      ? 'text-background'
                      : 'text-muted-foreground hover:text-foreground',
                    locked && 'gap-1.5 cursor-not-allowed'
                  )}
                >
                  {locked ? <LockIcon className="size-3.5" aria-hidden /> : null}
                  {tab.label}
                  {locked ? <span className="sr-only"> (locked)</span> : null}
                </TabsTrigger>
              );
              if (!locked || !dashboardLock) return trigger;
              return (
                <TooltipProvider key={tab.id}>
                  <Tooltip
                    open={lockTipOpen}
                    onOpenChange={(open, details) => {
                      // Our own click handler opens it; ignore Base UI closing it on press.
                      if (details.reason === 'trigger-press') return;
                      setLockTipOpen(open);
                    }}
                  >
                    <TooltipTrigger render={<span className="inline-flex" />}>
                      {trigger}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64 text-left leading-5">
                      {DASHBOARD_LOCK_MESSAGE[dashboardLock]}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex max-w-full flex-wrap items-center gap-2 lg:justify-end print:hidden">
          {connection.googleConnected ? (
            <RerunFullAuditButton projectId={projectId} />
          ) : (
            <RerunFreeAuditButton
              websiteUrl={websiteUrl}
              disabled={navigationDisabled}
              isGuest={isGuest}
              loginHref={loginHref}
            />
          )}
          <AddSiteAuditDialog
            triggerLabel="Audit another site"
            triggerClassName="inline-flex h-8 pointer-coarse:h-11 items-center gap-1 rounded-lg border border-line-strong bg-raised px-2.5 text-[13px] font-medium text-foreground/90 transition hover:bg-muted"
            title="Run a new audit"
            description="Paste any public URL to start a fresh free audit."
            submitLabel="Run audit"
            isGuest={isGuest}
            loginHref={loginHref}
          />
        </div>
      </div>
    </div>
  );
}
