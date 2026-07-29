'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RerunFreeAuditButtonProps {
  websiteUrl: string;
  disabled?: boolean;
}

export function RerunFreeAuditButton({ websiteUrl, disabled }: RerunFreeAuditButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRerun() {
    if (loading || disabled) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to re-run audit');
        return;
      }
      const sessionId = typeof data.sessionId === 'string' ? data.sessionId : '';
      if (!sessionId) {
        setError('Failed to start audit');
        return;
      }
      router.push(`/audit/${sessionId}`);
      router.refresh();
    } catch {
      setError('Failed to re-run audit');
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
        className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Starting…' : 'Re-run audit'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
