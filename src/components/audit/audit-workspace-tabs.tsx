'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  useAuditTabCache,
  type AuditPrimaryTabSuffix,
} from '@/components/audit/audit-tab-cache';
import { RerunFreeAuditButton } from '@/components/audit/rerun-free-audit-button';
import { RerunFullAuditButton } from '@/components/audit/rerun-full-audit-button';
import { cn } from '@/lib/utils';

const PRIMARY_TABS: { label: string; suffix: AuditPrimaryTabSuffix }[] = [
  { label: 'Dashboard', suffix: '/workflow' },
  { label: 'Brief', suffix: '/brief' },
  { label: 'Work', suffix: '/work' },
  { label: 'Leads', suffix: '/leads' },
  { label: 'Monthly', suffix: '/monthly' },
  { label: 'Setup', suffix: '/connect' },
];

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
  workspaceId,
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
  const pathname = usePathname();
  const router = useRouter();
  const tabCache = useAuditTabCache();
  const base = `/audit/${workspaceId}`;
  const [lastAuditLabel, setLastAuditLabel] = useState(() => formatLastAuditLabel(lastAuditAt));

  useEffect(() => {
    setLastAuditLabel(formatLastAuditLabel(lastAuditAt));
    if (!lastAuditAt) return;
    const timer = window.setInterval(() => {
      setLastAuditLabel(formatLastAuditLabel(lastAuditAt));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [lastAuditAt]);

  if (pathname.includes('/upgrade')) return null;

  function isActive(suffix: AuditPrimaryTabSuffix) {
    if (tabCache?.activeSuffix !== undefined && tabCache.activeSuffix !== null) {
      return tabCache.activeSuffix === suffix;
    }
    if (suffix === '/workflow') {
      return (
        pathname === base ||
        pathname === `${base}/` ||
        pathname === `${base}/workflow` ||
        pathname.startsWith(`${base}/workflow/`)
      );
    }
    return pathname === `${base}${suffix}` || pathname.startsWith(`${base}${suffix}/`);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 pb-4">
      {domain ? (
        <p className="text-xs font-medium tracking-[0.14em] text-zinc-400 uppercase">{domain}</p>
      ) : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label="Audit workspace"
          aria-disabled={navigationDisabled}
          className={cn('flex max-w-full flex-wrap gap-1 rounded-xl bg-zinc-50 p-1',
            navigationDisabled && 'pointer-events-none opacity-50'
          )}
        >
          {PRIMARY_TABS.map((tab) => {
            const href = `${base}${tab.suffix}`;
            const active = isActive(tab.suffix);
            const cached = tabCache?.isCached(tab.suffix) ?? false;
            return (
              <Link
                key={tab.label}
                href={href}
                prefetch={!navigationDisabled}
                tabIndex={navigationDisabled ? -1 : undefined}
                onMouseEnter={() => {
                  if (navigationDisabled) return;
                  router.prefetch(href);
                }}
                onClick={(event) => {
                  if (navigationDisabled) {
                    event.preventDefault();
                    return;
                  }
                  if (!tabCache || !cached) return;
                  event.preventDefault();
                  tabCache.activateTab(tab.suffix);
                }}
                className={cn('rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition',
                  active
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-white hover:text-zinc-950'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex max-w-full flex-wrap items-center gap-2 lg:justify-end print:hidden">
          <p className="text-xs font-medium whitespace-nowrap text-zinc-500">{lastAuditLabel}</p>
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
