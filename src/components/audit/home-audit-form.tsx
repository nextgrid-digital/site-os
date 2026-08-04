'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface HomeAuditFormProps {
  className?: string;
  rowClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  actionsClassName?: string;
  actions?: ReactNode;
  helperClassName?: string;
  errorClassName?: string;
  buttonLabel?: string;
  loadingLabel?: string;
  helperText?: string;
}

export function HomeAuditForm({
  className,
  rowClassName,
  inputClassName,
  buttonClassName,
  actionsClassName,
  actions,
  helperClassName,
  errorClassName,
  buttonLabel = 'Analyze website',
  loadingLabel = 'Starting analysis…',
  helperText = 'Paste any public URL. Free audit adapts to the site type — no login required.',
}: HomeAuditFormProps = {}) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      const sessionId = typeof data.sessionId === 'string' ? data.sessionId : '';
      if (!sessionId) {
        setError('Something went wrong');
        return;
      }

      // Free audit is public — go straight to the report (no login gate).
      router.push(`/audit/${sessionId}`);
    } catch {
      setError('Failed to start audit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className ?? 'space-y-4'}>
      <div className={rowClassName ?? 'flex w-full items-stretch gap-2'}>
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="yourwebsite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          aria-label="Website URL"
          className={
            inputClassName ??
            'min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100'
          }
        />
        <button
          type="submit"
          disabled={loading}
          className={
            buttonClassName ??
            'shrink-0 rounded-xl bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50'
          }
        >
          {loading ? loadingLabel : buttonLabel}
        </button>
      </div>
      {actions ? (
        <div className={actionsClassName ?? 'flex flex-wrap items-center justify-center gap-2'}>
          {actions}
        </div>
      ) : null}
      {error ? (
        <p className={errorClassName ?? 'text-center text-xs text-red-600'}>{error}</p>
      ) : null}
      {helperText ? (
        <p className={helperClassName ?? 'text-center text-xs text-slate-500'}>{helperText}</p>
      ) : null}
    </form>
  );
}
