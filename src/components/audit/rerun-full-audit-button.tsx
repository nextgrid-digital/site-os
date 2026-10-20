'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuditTabCache } from '@/components/audit/audit-tab-cache';
import { useOptionalAuditRun } from '@/components/audit/audit-run-context';

interface RerunFullAuditButtonProps {
  projectId: string;
  disabled?: boolean;
}

type Phase = 'idle' | 'starting' | 'running';

type StatusPayload = {
  runStatus?: string | null;
  analyzing?: boolean;
  error?: string;
};

const POLL_MS = 3500;
const MAX_POLLS = 120;

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function RerunFullAuditButton({ projectId, disabled }: RerunFullAuditButtonProps) {
  const router = useRouter();
  const tabCache = useAuditTabCache();
  const auditRun = useOptionalAuditRun();
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  async function pollUntilDone() {
    let sawRunning = false;

    for (let i = 0; i < MAX_POLLS; i++) {
      if (cancelledRef.current) return 'cancelled' as const;

      const res = await fetch(`/api/audit/${projectId}/status`, { cache: 'no-store' });
      const data = (await res.json().catch(() => ({}))) as StatusPayload;
      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to check audit status'
        );
      }

      const runStatus = data.runStatus ?? null;
      if (runStatus === 'running') sawRunning = true;

      if (sawRunning && runStatus === 'failed') {
        return 'failed' as const;
      }

      if (sawRunning && runStatus === 'completed') {
        return 'completed' as const;
      }

      if (sawRunning && data.analyzing === false && runStatus !== 'running') {
        return runStatus === 'failed' ? ('failed' as const) : ('completed' as const);
      }

      await sleep(POLL_MS);
    }

    throw new Error('Audit is taking longer than expected. Refresh to check status.');
  }

  async function handleRerun() {
    if (phase !== 'idle' || disabled) return;
    setPhase('starting');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectId}/run-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runType: 'full' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof data.error === 'string' ? data.error : 'Failed to re-run full audit';
        setError(message);
        setPhase('idle');
        return;
      }

      setPhase('running');
      auditRun?.startRunning();

      const result = await pollUntilDone();
      if (cancelledRef.current || result === 'cancelled') return;

      if (result === 'failed') {
        const message = 'Full audit failed. Check Setup connections and try again.';
        setError(message);
        auditRun?.stopRunning(message);
        setPhase('idle');
        tabCache?.invalidateAll();
        router.refresh();
        return;
      }

      auditRun?.stopRunning(null);
      tabCache?.invalidateAll();
      // Land on the Dashboard tab so the fresh results are visible right away.
      if (tabCache) {
        tabCache.setTab('/workflow');
      } else {
        router.push(`/audit/${projectId}/workflow`);
      }
      router.refresh();
      setPhase('idle');
    } catch (err) {
      if (cancelledRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to re-run full audit';
      setError(message);
      auditRun?.stopRunning(message);
      setPhase('idle');
    }
  }

  const busy = phase !== 'idle' || Boolean(auditRun?.running);
  const label =
    phase === 'starting' ? 'Starting…' : phase === 'running' || auditRun?.running ? 'Running…' : 'Re-run full audit';

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => {
          void handleRerun();
        }}
        disabled={busy || disabled}
        className="inline-flex h-8 pointer-coarse:h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw className={`size-3 ${busy ? 'animate-spin' : ''}`} strokeWidth={2} />
        {label}
      </button>
      {error && !auditRun?.running ? (
        <p className="max-w-[16rem] text-right text-xs text-danger-ink">{error}</p>
      ) : null}
    </div>
  );
}
