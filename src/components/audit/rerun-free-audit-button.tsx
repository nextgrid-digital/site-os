'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuditTabCache } from '@/components/audit/audit-tab-cache';
import { GuestAuditWarningDialog } from '@/components/audit/guest-audit-warning';

interface RerunFreeAuditButtonProps {
  websiteUrl: string;
  disabled?: boolean;
  /** Guests get a "you may lose this audit" warning before a new run starts. */
  isGuest?: boolean;
  loginHref?: string;
}

export function RerunFreeAuditButton({
  websiteUrl,
  disabled,
  isGuest = false,
  loginHref = '/login',
}: RerunFreeAuditButtonProps) {
  const router = useRouter();
  const tabCache = useAuditTabCache();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warnOpen, setWarnOpen] = useState(false);

  async function handleRerun() {
    if (loading || disabled) return;
    setWarnOpen(false);
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
      tabCache?.invalidateAll();
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
        onClick={() => (isGuest ? setWarnOpen(true) : void handleRerun())}
        disabled={loading || disabled}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-[13px] font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
        {loading ? 'Starting…' : 'Re-run audit'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <GuestAuditWarningDialog
        open={warnOpen}
        onOpenChange={setWarnOpen}
        loginHref={loginHref}
        onContinue={() => void handleRerun()}
        continueLabel="Re-run anyway"
      />
    </div>
  );
}
