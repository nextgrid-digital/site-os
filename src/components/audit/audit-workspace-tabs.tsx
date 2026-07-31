'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useAuditTabCache,
  type AuditPrimaryTabSuffix,
} from '@/components/audit/audit-tab-cache';
import { cn } from '@/lib/utils';

const PRIMARY_TABS: { label: string; suffix: AuditPrimaryTabSuffix }[] = [
  { label: 'Evidence', suffix: '' },
  { label: 'Journey', suffix: '/journey' },
  { label: 'Connect', suffix: '/connect' },
  { label: 'Intake', suffix: '/intake' },
];

export function AuditWorkspaceTabs({
  workspaceId,
  domain,
}: {
  /** Canonical id used in URLs (prefer session id). */
  workspaceId: string;
  domain?: string;
}) {
  const pathname = usePathname();
  const tabCache = useAuditTabCache();
  const base = `/audit/${workspaceId}`;

  if (pathname.includes('/upgrade')) return null;

  function isActive(suffix: AuditPrimaryTabSuffix) {
    if (tabCache?.activeSuffix !== undefined && tabCache.activeSuffix !== null) {
      return tabCache.activeSuffix === suffix;
    }
    if (suffix === '') {
      return pathname === base || pathname === `${base}/`;
    }
    return pathname === `${base}${suffix}` || pathname.startsWith(`${base}${suffix}/`);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-zinc-200 pb-4">
      {domain ? (
        <p className="text-xs font-medium tracking-[0.14em] text-zinc-400 uppercase">{domain}</p>
      ) : null}
      <nav
        aria-label="Audit workspace"
        className="flex max-w-full flex-wrap gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1"
      >
        {PRIMARY_TABS.map((tab) => {
          const href = `${base}${tab.suffix}`;
          const active = isActive(tab.suffix);
          const cached = tabCache?.isCached(tab.suffix) ?? false;
          return (
            <Link
              key={tab.label}
              href={href}
              onClick={(event) => {
                if (!tabCache || !cached) return;
                event.preventDefault();
                tabCache.activateTab(tab.suffix);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition',
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
    </div>
  );
}
