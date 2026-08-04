'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuditTabCache } from '@/components/audit/audit-tab-cache';

interface RerunFullAuditButtonProps {
  projectId: string;
  disabled?: boolean;
}

export function RerunFullAuditButton({ projectId, disabled }: RerunFullAuditButtonProps) {
  const router = useRouter();
  const tabCache = useAuditTabCache();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRerun() {
    if (loading || disabled) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectId}/run-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runType: 'full' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to re-run full audit');
        return;
      }
      tabCache?.invalidateAll();
      router.refresh();
    } catch {
      setError('Failed to re-run full audit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRerun}
        disabled={loading || disabled}
        className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Starting…' : 'Re-run full audit'}
      </button>
      {error ? <p className="max-w-[16rem] text-right text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
