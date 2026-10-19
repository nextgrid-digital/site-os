'use client';

import { useEffect, useState } from 'react';

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
  return `${Math.floor(days / 30)} mo ago`;
}

function formatLastAuditLabel(iso: string | null | undefined) {
  const relative = iso ? formatRelativeAuditAge(iso) : null;
  return relative ? `Last audit: ${relative}` : 'Last audit: not run yet';
}

export function LastAuditLabel({ lastAuditAt }: { lastAuditAt: string | null }) {
  // Re-render every 30s so "3 min ago" keeps moving; the label itself is derived.
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!lastAuditAt) return;
    const timer = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(timer);
  }, [lastAuditAt]);

  return (
    <p className="text-xs font-medium text-muted-foreground" suppressHydrationWarning>
      {formatLastAuditLabel(lastAuditAt)}
    </p>
  );
}
