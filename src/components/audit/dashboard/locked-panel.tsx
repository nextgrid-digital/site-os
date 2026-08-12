'use client';

import Link from 'next/link';

interface LockedPanelProps {
  title: string;
  description?: string;
  projectId: string;
  ctaLabel?: string;
}

export function LockedPanel({
  title,
  description = 'Connect Google Search Console and Analytics to include live traffic for this site.',
  projectId,
  ctaLabel = 'Connect Google',
}: LockedPanelProps) {
  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl bg-zinc-50/80 px-4 py-8 text-center">
      <p className="text-sm font-medium text-zinc-800">{title}</p>
      <p className="max-w-xs text-xs leading-5 text-zinc-500">{description}</p>
      <Link
        href={`/audit/${projectId}/settings`}
        className="rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
