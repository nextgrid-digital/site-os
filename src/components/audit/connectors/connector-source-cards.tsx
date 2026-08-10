'use client';

import Link from 'next/link';
import type { ConnectorStatus } from '@/lib/connectors/types';
import { getConnectorDefinition } from '@/lib/connectors/registry';
import { cn } from '@/lib/utils';

function stateLabel(state: ConnectorStatus['state']) {
  switch (state) {
    case 'connected':
      return 'Connected';
    case 'partial':
      return 'Partial';
    case 'disconnected':
      return 'Not connected';
    case 'error':
      return 'Error';
    case 'coming_soon':
      return 'Coming soon';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function stateClass(state: ConnectorStatus['state']) {
  switch (state) {
    case 'connected':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900';
    case 'partial':
      return 'border-amber-200 bg-amber-50 text-amber-950';
    case 'coming_soon':
      return 'border-zinc-200 bg-zinc-50 text-zinc-500';
    case 'error':
      return 'border-red-200 bg-red-50 text-red-900';
    case 'disconnected':
      return 'border-zinc-200 bg-white text-zinc-600';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function formatSync(iso: string | null) {
  if (!iso) return 'Never synced in an audit';
  try {
    return `Last audit ${new Date(iso).toLocaleString()}`;
  } catch {
    return 'Last sync unknown';
  }
}

export function ConnectorSourceCards({
  statuses,
  connectHref,
}: {
  statuses: ConnectorStatus[];
  connectHref?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statuses.map((status) => {
        const def = getConnectorDefinition(status.connectorId);
        return (
          <article
            key={status.connectorId}
            className="flex flex-col rounded-[14px] border border-zinc-200 bg-white p-4 shadow-none"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-950">{def.label}</p>
                <p className="mt-0.5 text-[11px] tracking-wide text-zinc-400 uppercase">
                  Phase {def.phase}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  stateClass(status.state)
                )}
              >
                {stateLabel(status.state)}
              </span>
            </div>

            {status.resourceLabel ? (
              <p className="mt-2 truncate text-xs text-zinc-600" title={status.resourceLabel}>
                {status.resourceLabel}
              </p>
            ) : null}

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {status.message ||
                (status.state === 'coming_soon'
                  ? def.emptyWhatYouWouldSee
                  : status.availableSignals.slice(0, 3).join(' · ') || def.emptyWhatYouWouldSee)}
            </p>

            {status.partialReason ? (
              <p className="mt-2 text-[11px] leading-4 text-amber-800">{status.partialReason}</p>
            ) : null}

            <div className="mt-auto flex flex-col gap-1 pt-3 text-[11px] text-zinc-400">
              <span>{formatSync(status.lastSyncAt)}</span>
              <span>
                {status.usedInAudit ? 'Used in latest audit' : 'Not used in latest audit'}
              </span>
              {connectHref && status.state !== 'coming_soon' && status.state !== 'connected' ? (
                <Link
                  href={connectHref}
                  className="mt-1 font-medium text-zinc-800 underline underline-offset-2"
                >
                  Manage on Connect
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
