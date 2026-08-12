'use client';

import { useEffect, useState } from 'react';
import {
  useAuditTabCache,
  type AuditPrimaryTabSuffix,
} from '@/components/audit/audit-tab-cache';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import { RerunFullAuditButton } from '@/components/audit/rerun-full-audit-button';
import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs';
import { cn } from '@/lib/utils';

const PRIMARY_TABS: {
  id: string;
  label: string;
  suffix: AuditPrimaryTabSuffix;
}[] = [
  { id: 'workflow', label: 'Dashboard', suffix: '/workflow' },
  { id: 'brief', label: 'Brief', suffix: '/brief' },
  { id: 'work', label: 'Work', suffix: '/work' },
  { id: 'leads', label: 'Leads', suffix: '/leads' },
  { id: 'monthly', label: 'Monthly', suffix: '/monthly' },
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

function formatRelativeAuditAge(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} mo ago`;
}

function formatLastAuditLabel(iso: string | null | undefined) {
  if (!iso) return 'Last Audit: not run yet';
  const relative = formatRelativeAuditAge(iso);
  if (!relative) return 'Last Audit: not run yet';
  return `Last Audit: ${relative}`;
}

export function AuditWorkspaceTabs({
  workspaceId: _workspaceId,
  projectId,
  domain,
  websiteUrl,
  connection,
  lastAuditAt = null,
  navigationDisabled = false,
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  lastAuditAt?: string | null;
  navigationDisabled?: boolean;
}) {
  const tabCache = useAuditTabCache();
  const [lastAuditLabel, setLastAuditLabel] = useState(() => formatLastAuditLabel(lastAuditAt));
  const activeId = suffixToId(tabCache?.activeSuffix ?? '/workflow');

  useEffect(() => {
    setLastAuditLabel(formatLastAuditLabel(lastAuditAt));
    if (!lastAuditAt) return;
    const timer = window.setInterval(() => {
      setLastAuditLabel(formatLastAuditLabel(lastAuditAt));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [lastAuditAt]);

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
            const suffix = idToSuffix(id);
            if (!suffix) return;
            tabCache.setTab(suffix);
          }}
        >
          <TabsList
            aria-label="Audit workspace"
            className={cn(
              'max-w-full flex-wrap rounded-xl bg-muted',
              navigationDisabled && 'pointer-events-none opacity-50'
            )}
          >
            {PRIMARY_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={navigationDisabled}
                indicatorClassName="bg-foreground"
                className={cn(
                  activeId === tab.id
                    ? 'text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex max-w-full flex-wrap items-center gap-2 lg:justify-end print:hidden">
          <p className="text-xs font-medium whitespace-nowrap text-muted-foreground">
            {lastAuditLabel}
          </p>
          {connection.googleConnected ? (
            <RerunFullAuditButton projectId={projectId} />
          ) : (
            <RerunFreeAuditButton websiteUrl={websiteUrl} disabled={navigationDisabled} />
          )}
        </div>
      </div>
    </div>
  );
}
