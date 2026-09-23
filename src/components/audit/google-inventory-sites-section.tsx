'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Link2, RefreshCw } from 'lucide-react';
import type { GoogleInventoryCandidate } from '@/lib/db/google-inventory';
import { ClientGoogleInviteCard } from '@/components/audit/client-google-invite-card';

type InventoryState = {
  connected: boolean;
  operatorEmail: string | null;
  syncedAt: string | null;
  candidates: GoogleInventoryCandidate[];
};

export function GoogleInventorySitesSection({
  initial,
  projectId,
}: {
  initial: InventoryState;
  projectId: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [addingDomain, setAddingDomain] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const available = state.candidates.filter((c) => !c.alreadyAdded);

  async function refreshInventory() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/google/sync-inventory', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.error === 'string' ? data.error : 'Sync failed.');
        return;
      }
      setState({
        connected: true,
        operatorEmail: data.operatorEmail ?? state.operatorEmail,
        syncedAt: data.syncedAt ?? null,
        candidates: Array.isArray(data.candidates) ? data.candidates : [],
      });
      setMessage('Google access refreshed.');
      router.refresh();
    } catch {
      setMessage('Sync failed.');
    } finally {
      setLoading(false);
    }
  }

  async function addSite(candidate: GoogleInventoryCandidate) {
    setAddingDomain(candidate.domain);
    setMessage(null);
    try {
      const res = await fetch('/api/google/add-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gscSiteUrl: candidate.gscSiteUrl,
          ga4PropertyId: candidate.ga4Matches[0]?.propertyId ?? null,
          adsCustomerId: candidate.adsMatches[0]?.customerId ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.error === 'string' ? data.error : 'Could not add site.');
        return;
      }
      const sessionId = typeof data.sessionId === 'string' ? data.sessionId : '';
      if (sessionId) {
        router.push(`/audit/${sessionId}/connect`);
        return;
      }
      router.refresh();
    } catch {
      setMessage('Could not add site.');
    } finally {
      setAddingDomain(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Available from Google</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Properties where {state.operatorEmail ?? 'your agency Google account'} already has
            access. Add a site in one click.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.connected ? (
            <button
              type="button"
              onClick={() => void refreshInventory()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
              Refresh Google access
            </button>
          ) : projectId ? (
            <a
              href={`/api/google/oauth/start?returnTo=/app&projectId=${projectId}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <Link2 className="size-3.5" strokeWidth={2} />
              Connect Google
            </a>
          ) : (
            <button
              disabled
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-200 px-3 text-sm font-medium text-zinc-500 opacity-50"
            >
              <Link2 className="size-3.5" strokeWidth={2} />
              Add a site first
            </button>
          )}
        </div>
      </div>

      {message ? <p className="text-sm text-zinc-500">{message}</p> : null}

      {!state.connected ? (
        <div className="rounded-[14px] bg-white px-4 py-8 text-center text-sm text-zinc-500 shadow-sm">
          Connect the agency Google account once. Client properties appear here after they grant
          access.
        </div>
      ) : available.length === 0 ? (
        <div className="rounded-[14px] bg-white px-4 py-8 text-center text-sm text-zinc-500 shadow-sm">
          {state.candidates.length > 0
            ? 'All visible Search Console sites are already on Your sites.'
            : 'No Search Console sites yet. Ask clients to add access, then refresh.'}
          {state.syncedAt ? (
            <span className="mt-1 block text-xs text-zinc-400">
              Last synced {new Date(state.syncedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-[14px] bg-white shadow-sm">
          {available.map((candidate) => (
            <li
              key={candidate.gscSiteUrl}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-950">{candidate.domain}</p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">{candidate.gscSiteUrl}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    GSC
                  </span>
                  {candidate.ga4Matches.length > 0 ? (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                      GA4 · {candidate.ga4Matches.length}
                    </span>
                  ) : null}
                  {candidate.adsMatches.length > 0 ? (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                      Ads · {candidate.adsMatches.length}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void addSite(candidate)}
                disabled={addingDomain === candidate.domain}
                className="inline-flex h-9 shrink-0 items-center rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {addingDomain === candidate.domain ? 'Adding…' : 'Add site'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ClientGoogleInviteCard operatorEmail={state.operatorEmail} />
    </section>
  );
}
