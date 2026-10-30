'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import type { AdsInvite } from '@/lib/db/ads-invites';

const fieldClass =
  'h-9 pointer-coarse:h-11 w-full rounded-md border border-field bg-raised px-3 text-sm text-foreground outline-none focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-foreground/15';
const buttonClass =
  'inline-flex h-9 pointer-coarse:h-11 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50';

function statusText(invite: AdsInvite | null) {
  if (!invite) return 'Enter the client’s Google Ads ID and we’ll send them an invite.';
  switch (invite.status) {
    case 'PENDING':
      return `Invite sent to ${invite.customer_id}. Waiting for the client to accept it in Google Ads under Access and security → Managers.`;
    case 'ACTIVE':
      return `Linked to ${invite.customer_id}. Click Sync to load the account.`;
    default:
      return `The invite for ${invite.customer_id} was declined or removed. Enter the ID again to send a new one.`;
  }
}

/** Sends the client an MCC invite for their Google Ads account and shows its status. */
export function AdsInvitePanel({ projectId }: { projectId: string }) {
  const [invite, setInvite] = useState<AdsInvite | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}/ads-invite`)
      .then((response) => response.json())
      .then((data: { invite?: AdsInvite | null; error?: string }) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setInvite(data.invite ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the Google Ads invite status.');
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function sendInvite() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/ads-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const data = (await response.json()) as { invite?: AdsInvite; error?: string };
      if (!response.ok || !data.invite) {
        setError(data.error ?? 'Could not send the invite.');
        return;
      }
      setInvite(data.invite);
      setCustomerId('');
    } catch {
      setError('Could not send the invite. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="ads-invite" className="text-xs font-medium text-foreground/70">
        Client&apos;s Google Ads account ID
      </Label>
      <div className="flex gap-2">
        <input
          id="ads-invite"
          className={fieldClass}
          placeholder="123-456-7890"
          inputMode="numeric"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
        />
        <button
          type="button"
          onClick={sendInvite}
          disabled={busy || customerId.trim() === ''}
          className={buttonClass}
        >
          {busy ? 'Sending…' : 'Send invite'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{statusText(invite)}</p>
      {error ? <p className="text-xs text-danger-ink">{error}</p> : null}
    </div>
  );
}
