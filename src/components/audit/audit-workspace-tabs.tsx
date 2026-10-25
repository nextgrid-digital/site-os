'use client';

import {
  useAuditTabCache,
  type AuditPrimaryTabSuffix,
} from '@/components/audit/audit-tab-cache';
import { AddSiteAuditDialog } from '@/components/audit/add-site-audit-dialog';
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
}: {
  workspaceId: string;
  projectId: string;
  domain?: string;
  websiteUrl: string;
  connection: WorkspaceConnectionStatus;
  navigationDisabled?: boolean;
  signedIn?: boolean;
}) {
  const tabCache = useAuditTabCache();
  const isGuest = !signedIn;
  const loginHref = `/login?next=${encodeURIComponent(`/audit/${workspaceId}`)}`;
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
