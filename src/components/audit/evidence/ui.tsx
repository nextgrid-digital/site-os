'use client';

import type { ReactNode } from 'react';

export function StatusChip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'strong' | 'weak' | 'conflict' | 'empty';
}) {
  const styles =
    tone === 'strong'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'weak'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : tone === 'conflict'
          ? 'border-red-200 bg-red-50 text-red-700'
          : tone === 'empty'
            ? 'border-zinc-200 bg-zinc-50 text-zinc-500'
            : 'border-zinc-200 bg-white text-zinc-700';
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${styles}`}
    >
      {children}
    </span>
  );
}

export function ConfidenceIndicator({ value }: { value: number }) {
  return (
    <span className="tabular-nums text-[11px] text-zinc-500">
      {Math.round(value * 100)}% conf.
    </span>
  );
}

export function SourceBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50/80 px-5 py-8 text-center">
      <p className="text-sm font-medium text-zinc-800">{title}</p>
      {description ? <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-zinc-500">{description}</p> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  caption,
  delta,
}: {
  label: string;
  value: string | number;
  caption?: string;
  delta?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">{value}</p>
      {caption ? <p className="mt-1 text-xs text-zinc-500">{caption}</p> : null}
      {delta ? <p className="mt-1 text-[11px] text-zinc-400">{delta}</p> : null}
    </div>
  );
}

export function SectionTitle({
  title,
  lead,
}: {
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h2>
      {lead ? <p className="mt-1 text-sm text-zinc-500">{lead}</p> : null}
    </div>
  );
}
