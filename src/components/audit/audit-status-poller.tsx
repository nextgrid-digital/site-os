'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInvalidateAuditTab } from '@/components/audit/audit-tab-cache';

/** Lightweight poller — refreshes RSC once when analyzing completes. */
export function AuditStatusPoller({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const invalidateTab = useInvalidateAuditTab();
  const refreshedRef = useRef(false);

  useEffect(() => {
    refreshedRef.current = false;
    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      try {
        const res = await fetch(`/api/audit/${sessionId}/status`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { analyzing?: boolean; ready?: boolean };
        if (cancelled) return;
        if (data.ready || data.analyzing === false) {
          if (!refreshedRef.current) {
            refreshedRef.current = true;
            invalidateTab('');
            invalidateTab('/journey');
            router.refresh();
          }
          return;
        }
      } catch {
        // Retry on next tick.
      }
      if (!cancelled) {
        timer = window.setTimeout(() => {
          void poll();
        }, 4000);
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [sessionId, invalidateTab, router]);

  return null;
}
