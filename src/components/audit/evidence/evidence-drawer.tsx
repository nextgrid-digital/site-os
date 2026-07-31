'use client';

import { ExternalLink, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { ConfidenceIndicator, SourceBadge } from '@/components/audit/evidence/ui';

export type EvidenceDrawerPayload = {
  title: string;
  subtitle?: string;
  body?: string;
  sourceType?: string;
  sourceUrl?: string | null;
  observedAt?: string | null;
  confidence?: number | null;
  meta?: Array<{ label: string; value: string }>;
  lists?: Array<{ label: string; items: string[] }>;
};

export function EvidenceDrawer({
  open,
  onClose,
  payload,
}: {
  open: boolean;
  onClose: () => void;
  payload: EvidenceDrawerPayload | null;
}) {
  if (!open || !payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
      <button
        type="button"
        aria-label="Close evidence drawer"
        className="absolute inset-0 bg-zinc-950/30"
        onClick={onClose}
      />
      <aside className="relative flex max-h-[88vh] w-full flex-col rounded-t-2xl border border-zinc-200 bg-white shadow-xl sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0 sm:border-r-0 sm:border-b-0 lg:max-w-lg">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-200 sm:hidden" />
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.14em] text-zinc-400 uppercase">
              Evidence
            </p>
            <h3 className="mt-1 text-base font-semibold text-zinc-950">{payload.title}</h3>
            {payload.subtitle ? (
              <p className="mt-1 text-xs text-zinc-500">{payload.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {payload.sourceType ? <SourceBadge>{payload.sourceType}</SourceBadge> : null}
            {payload.confidence != null ? <ConfidenceIndicator value={payload.confidence} /> : null}
            {payload.observedAt ? (
              <span className="text-[11px] text-zinc-400">
                Observed {payload.observedAt.slice(0, 10)}
              </span>
            ) : null}
          </div>
          {payload.body ? (
            <p className="whitespace-pre-line text-sm leading-6 text-zinc-700">{payload.body}</p>
          ) : null}
          {payload.sourceUrl ? (
            <a
              href={payload.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-600 underline-offset-2 hover:text-zinc-950 hover:underline"
            >
              <span className="truncate">{payload.sourceUrl}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : null}
          {payload.meta?.length ? (
            <dl className="grid gap-2">
              {payload.meta.map((row) => (
                <div key={row.label} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                  <dt className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-zinc-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {payload.lists?.map((list) => (
            <div key={list.label}>
              <p className="text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                {list.label}
              </p>
              {list.items.length === 0 ? (
                <p className="mt-1 text-xs text-zinc-500">None identified</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {list.items.map((item) => (
                    <li key={item} className="truncate text-sm text-zinc-700">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function DrawerTrigger({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
