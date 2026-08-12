'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AtSign,
  BarChart3,
  CheckCircle2,
  Circle,
  Globe2,
  Megaphone,
  Search,
  Video,
} from 'lucide-react';
import type { ConnectorId, ConnectorStatus } from '@/lib/connectors/types';
import { getConnectorDefinition } from '@/lib/connectors/registry';
import { cn } from '@/lib/utils';

const CONNECTOR_ICONS: Record<
  ConnectorId,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  website: Globe2,
  search_console: Search,
  ga4: BarChart3,
  google_ads: Megaphone,
  instagram: AtSign,
  x: AtSign,
  youtube: Video,
  tiktok: Video,
};

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
      return 'bg-emerald-50 text-emerald-800';
    case 'partial':
      return 'bg-amber-50 text-amber-900';
    case 'coming_soon':
      return 'bg-zinc-50 text-zinc-500';
    case 'error':
      return 'bg-red-50 text-red-800';
    case 'disconnected':
      return 'bg-zinc-50 text-zinc-600';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function iconShellClass(state: ConnectorStatus['state']) {
  switch (state) {
    case 'connected':
      return 'bg-emerald-50 text-emerald-700';
    case 'partial':
      return 'bg-amber-50 text-amber-800';
    case 'error':
      return 'bg-red-50 text-red-700';
    case 'coming_soon':
      return 'bg-zinc-100 text-zinc-400';
    case 'disconnected':
      return 'bg-zinc-100 text-zinc-500';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function formatSync(iso: string | null) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
}

function signalRows(status: ConnectorStatus): string[] {
  const def = getConnectorDefinition(status.connectorId);
  if (status.availableSignals.length > 0) {
    return status.availableSignals.slice(0, 4);
  }
  return def.signals.slice(0, 4);
}

function SignalIcon({ state }: { state: ConnectorStatus['state'] }) {
  switch (state) {
    case 'connected':
      return <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" strokeWidth={2} />;
    case 'partial':
      return <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-600" strokeWidth={2} />;
    case 'error':
      return <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-600" strokeWidth={2} />;
    case 'disconnected':
    case 'coming_soon':
      return <Circle className="mt-0.5 size-3.5 shrink-0 text-zinc-300" strokeWidth={2} />;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
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
        const Icon = CONNECTOR_ICONS[status.connectorId];
        const signals = signalRows(status);
        const manage =
          connectHref &&
          status.state !== 'coming_soon' &&
          status.state !== 'connected';

        return (
          <article
            key={status.connectorId}
            className={cn('flex flex-col rounded-[14px] bg-white p-4 shadow-sm',
              status.state === 'coming_soon' && 'opacity-80'
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-full',
                  iconShellClass(status.state)
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-950">{def.label}</p>
                    <p className="mt-0.5 text-[11px] tracking-wide text-zinc-400 uppercase">
                      Phase {def.phase}
                    </p>
                  </div>
                  <span
                    className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                      stateClass(status.state)
                    )}
                  >
                    {stateLabel(status.state)}
                  </span>
                </div>
              </div>
            </div>

            {status.resourceLabel ? (
              <p className="mt-3 truncate text-xs text-zinc-600" title={status.resourceLabel}>
                {status.resourceLabel}
              </p>
            ) : status.message ? (
              <p className="mt-3 text-xs leading-5 text-zinc-500">{status.message}</p>
            ) : (
              <p className="mt-3 text-xs leading-5 text-zinc-400">{def.emptyWhatYouWouldSee}</p>
            )}

            <div className="mt-4 flex-1">
              <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                Signals
              </p>
              <ul className="mt-2 space-y-1.5">
                {signals.map((signal) => (
                  <li key={signal} className="flex items-start gap-2 text-xs leading-4 text-zinc-600">
                    <SignalIcon state={status.state} />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
              {status.partialReason ? (
                <p className="mt-2 text-[11px] leading-4 text-amber-800">{status.partialReason}</p>
              ) : null}
            </div>

            <div className="mt-4 pt-3 text-[11px] text-zinc-400">
              <div className="flex items-center justify-between gap-2">
                <span>Last sync · {formatSync(status.lastSyncAt)}</span>
                {status.usedInAudit ? (
                  <span className="text-zinc-500">In audit</span>
                ) : null}
              </div>
              {manage ? (
                <Link
                  href={connectHref}
                  className="mt-2 inline-block font-medium text-zinc-800 underline underline-offset-2"
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
