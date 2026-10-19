'use client';

import {
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import type { ConnectorId, ConnectorStatus } from '@/lib/connectors/types';
import { getConnectorDefinition } from '@/lib/connectors/registry';
import { cn } from '@/lib/utils';
import { CONNECTOR_ICONS } from './constants';
import { formatSync, iconShellClass, signalRows, stateClass, stateLabel } from './connector-utils';

export function SignalIcon({ state }: { state: ConnectorStatus['state'] }) {
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
  onManage,
}: {
  statuses: ConnectorStatus[];
  /** Called from a card's "Manage" action; the parent decides what to focus. */
  onManage?: (connectorId: ConnectorId) => void;
}) {

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statuses.map((status) => {
        const def = getConnectorDefinition(status.connectorId);
        const Icon = CONNECTOR_ICONS[status.connectorId];
        const signals = signalRows(status);
        const manage =
          onManage &&
          status.state !== 'coming_soon' &&
          status.state !== 'connected';

        return (
          <article
            key={status.connectorId}
            className={cn('flex flex-col rounded-[14px] bg-white p-4 shadow-sm',
              status.state === 'coming_soon' && 'opacity-80'
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-full',
                  iconShellClass(status.state)
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-zinc-950">
                    {def.label}
                  </p>
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
                <button
                  type="button"
                  onClick={() => onManage(status.connectorId)}
                  className="mt-2 inline-block font-medium text-zinc-800 underline underline-offset-2"
                >
                  Manage
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
