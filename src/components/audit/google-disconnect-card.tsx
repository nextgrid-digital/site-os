'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface GoogleDisconnectCardProps {
  connectedEmail: string;
  projectCount: number;
  sources: { gsc: boolean; ga4: boolean; ads: boolean };
}

export function GoogleDisconnectCard({ connectedEmail, projectCount, sources }: GoogleDisconnectCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const labels = [
    sources.ga4 && 'Google Analytics 4',
    sources.gsc && 'Search Console',
    sources.ads && 'Google Ads',
  ].filter(Boolean) as string[];

  async function disconnect() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/account/google', { method: 'DELETE' });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Disconnect failed.');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed.');
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm space-y-3 border-t pt-6">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Google account</h2>
        <p className="text-sm text-muted-foreground">
          {connectedEmail ? `${connectedEmail} is connected` : 'Connected'}
          {labels.length ? ` for ${labels.join(', ')}` : ''}, across {projectCount}{' '}
          {projectCount === 1 ? 'site' : 'sites'}.
        </p>
      </div>
      {confirming ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            This revokes OpenAEX&rsquo;s access and removes saved GA4, Search Console and Ads
            selections. Your audits stay. You can reconnect any time.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => void disconnect()}>
              {busy ? 'Disconnecting…' : 'Yes, disconnect'}
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
          Disconnect Google
        </Button>
      )}
      {error ? <p className="text-xs text-danger-ink">{error}</p> : null}
    </div>
  );
}
