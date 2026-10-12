'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Link2, RefreshCw, Save } from 'lucide-react';
import { useInvalidateAuditTab } from '@/components/audit/audit-tab-cache';
import { ClientGoogleInviteCard } from '@/components/audit/client-google-invite-card';
import { ConnectorSourceCards } from '@/components/audit/connectors/connector-source-cards';
import { Label } from '@/components/ui/label';
import {
  ADMIN_STATUS_COPY,
  CLIENT_STATUS_COPY,
  type ConnectionStatus,
} from '@/lib/google/connection-status';
import type { ConnectorStatus } from '@/lib/connectors/types';
import type { Ga4Property, GoogleAdsAccount, SearchConsoleProperty } from '@/lib/supabase/types';

const fieldClass =
  'h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400';

const primaryBtnClass =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-zinc-950 px-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50';

const outlineBtnClass =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50';

function formatDate(value: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString();
}

export function ConnectFlow({
  projectId,
  googleConnected,
  gscProperties,
  ga4Properties,
  adsAccounts = [],
  connectorStatuses = [],
  operatorEmail,
  tokenExpiry = null,
  lastSyncedAt = null,
  scopes = [],
  isAdminView = false,
  plan = 'free',
  connectionStatus = 'not_granted',
  clientAccessConfirmedAt = null,
  workspaceBase,
}: {
  projectId: string;
  googleConnected: boolean;
  gscProperties: SearchConsoleProperty[];
  ga4Properties: Ga4Property[];
  adsAccounts?: GoogleAdsAccount[];
  connectorStatuses?: ConnectorStatus[];
  operatorEmail?: string | null;
  tokenExpiry?: string | null;
  lastSyncedAt?: string | null;
  scopes?: string[];
  /** True when the viewer is an admin managing this client's connection, not the client themselves. */
  isAdminView?: boolean;
  plan?: 'free' | 'paid';
  connectionStatus?: ConnectionStatus;
  clientAccessConfirmedAt?: string | null;
  workspaceBase?: string;
}) {
  const router = useRouter();
  const invalidateTab = useInvalidateAuditTab();
  const [selectedGsc, setSelectedGsc] = useState(
    gscProperties.find((property) => property.is_selected)?.id ?? ''
  );
  const [selectedGa4, setSelectedGa4] = useState(
    ga4Properties.find((property) => property.is_selected)?.id ?? ''
  );
  const [selectedAds, setSelectedAds] = useState(
    adsAccounts.find((account) => account.is_selected)?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mappingSaved, setMappingSaved] = useState(false);
  const reportHref = workspaceBase ? `${workspaceBase}/brief` : `/audit/${projectId}/brief`;
  const connectHref = workspaceBase ? `${workspaceBase}/connect` : `/audit/${projectId}/connect`;

  async function syncProperties() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/projects/${projectId}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync' }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? 'Failed to sync properties.');
      return;
    }

    const gscCount = data.properties?.gsc?.length ?? 0;
    const ga4Count = data.properties?.ga4?.length ?? 0;
    const adsCount = data.properties?.ads?.length ?? 0;
    invalidateTab('/connect');
    invalidateTab('/workflow');
    invalidateTab('/brief');
    invalidateTab('/work');
    invalidateTab('/monthly');
    router.refresh();

    if (gscCount === 0 && ga4Count === 0 && adsCount === 0) {
      setMessage(
        'Synced, but Google returned 0 Search Console sites, 0 GA4 properties, and 0 Ads accounts. Confirm access, then sync again.'
      );
      return;
    }

    setMessage(
      `Synced ${gscCount} Search Console, ${ga4Count} GA4, and ${adsCount} Ads account(s).`
    );
  }

  async function saveMapping() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/projects/${projectId}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gscPropertyId: selectedGsc,
        ga4PropertyId: selectedGa4,
        adsAccountId: selectedAds,
      }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error ?? 'Failed to save mapping.');
      return;
    }
    invalidateTab('/connect');
    invalidateTab('/workflow');
    invalidateTab('/brief');
    invalidateTab('/work');
    invalidateTab('/monthly');
    router.refresh();
    setMappingSaved(true);
    setMessage('Property mapping saved.');
  }

  if (!isAdminView && plan === 'free') {
    return (
      <div className="space-y-4">
        <section className="rounded-[14px] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-950">Free crawl audit</h3>
          <p className="mt-1 text-sm leading-5 text-zinc-500">
            Your free audit only crawls your public site — no Google account needed.
          </p>
        </section>
        <section className="rounded-[14px] border border-zinc-200/80 bg-zinc-50 p-5">
          <h3 className="text-sm font-semibold text-zinc-950">Want the full audit?</h3>
          <p className="mt-1 text-sm leading-5 text-zinc-500">
            Upgrade for a full audit built from your real Search Console, GA4, and Ads data — we
            run it using our own agency account once you grant access, so you never have to share
            your Google login.
          </p>
          <a href="/pricing" className={`${primaryBtnClass} mt-4`}>
            Upgrade — $700
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isAdminView && plan === 'paid' ? (
        <section className="rounded-[14px] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${
                connectionStatus === 'needs_refresh' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {connectionStatus === 'needs_refresh' ? (
                <AlertTriangle className="size-4" strokeWidth={1.75} />
              ) : (
                <CheckCircle2 className="size-4" strokeWidth={1.75} />
              )}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-950">{CLIENT_STATUS_COPY[connectionStatus]}</h3>
              <p className="mt-1 text-sm leading-5 text-zinc-500">
                We&apos;ll email you as soon as your full audit is ready.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {(mappingSaved || googleConnected) && (isAdminView || plan === 'paid') ? (
        <div className="flex flex-wrap gap-2">
          <a href={reportHref} className={primaryBtnClass}>
            View Brief
          </a>
          <a href="/app" className={outlineBtnClass}>
            Your sites
          </a>
        </div>
      ) : null}

      {isAdminView && connectorStatuses.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">Sources</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Connection status for each channel. Phase 2–3 sources stay empty until they ship.
            </p>
          </div>
          <ConnectorSourceCards statuses={connectorStatuses} connectHref={connectHref} />
        </section>
      ) : null}

      {isAdminView ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-[14px] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                <Link2 className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-950">Google account</h3>
                <p className="mt-1 text-sm leading-5 text-zinc-500">
                  Connect Search Console, GA4, and Ads readonly access for this workspace.
                </p>
              </div>
            </div>

            <div className="mt-5">
              {googleConnected ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                  <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} />
                  <span className="min-w-0 truncate">
                    Connected{operatorEmail ? ` as ${operatorEmail}` : 'for this workspace'}
                  </span>
                </div>
              ) : (
                <p className="rounded-lg bg-zinc-50 px-3 py-2.5 text-sm text-zinc-500">
                  Google is not connected yet for this workspace.
                </p>
              )}
            </div>

            {googleConnected ? (
              <dl className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
                <div className="flex justify-between gap-2">
                  <dt>Status</dt>
                  <dd
                    className={
                      connectionStatus === 'needs_refresh' ? 'font-medium text-red-600' : 'font-medium text-zinc-700'
                    }
                  >
                    {ADMIN_STATUS_COPY[connectionStatus]}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Last synced</dt>
                  <dd className="font-medium text-zinc-700">{formatDate(lastSyncedAt)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Token expires</dt>
                  <dd className="font-medium text-zinc-700">{formatDate(tokenExpiry)}</dd>
                </div>
                {scopes.length > 0 ? (
                  <div className="flex justify-between gap-2">
                    <dt>Scopes</dt>
                    <dd className="max-w-[60%] text-right font-medium text-zinc-700">
                      {scopes.map((scope) => scope.split('/').pop()).join(', ')}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="mt-5">
              {googleConnected ? (
                <a
                  href={`/api/google/oauth/start?projectId=${projectId}`}
                  className={outlineBtnClass}
                >
                  Reconnect Google
                </a>
              ) : (
                <a
                  href={`/api/google/oauth/start?projectId=${projectId}`}
                  className={primaryBtnClass}
                >
                  Connect Google
                </a>
              )}
            </div>
          </section>

          <section className="rounded-[14px] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-950">Property mapping</h3>
                <p className="mt-1 text-sm leading-5 text-zinc-500">
                  Map one GSC property, one GA4 property, and one Ads account. Website is always the
                  base source.
                </p>
              </div>
              <button
                type="button"
                onClick={syncProperties}
                disabled={!googleConnected || loading}
                className={outlineBtnClass}
              >
                <RefreshCw className="size-3.5" strokeWidth={2} />
                Sync
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="gsc" className="text-xs font-medium text-zinc-600">
                  Search Console ({gscProperties.length})
                </Label>
                <select
                  id="gsc"
                  className={fieldClass}
                  value={selectedGsc}
                  onChange={(event) => setSelectedGsc(event.target.value)}
                >
                  <option value="">
                    {gscProperties.length === 0 ? 'No sites found' : 'Select property'}
                  </option>
                  {gscProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.site_url}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="ga4" className="text-xs font-medium text-zinc-600">
                  GA4 ({ga4Properties.length})
                </Label>
                <select
                  id="ga4"
                  className={fieldClass}
                  value={selectedGa4}
                  onChange={(event) => setSelectedGa4(event.target.value)}
                >
                  <option value="">
                    {ga4Properties.length === 0 ? 'No properties found' : 'Select property'}
                  </option>
                  {ga4Properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.property_name} ({property.account_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="ads" className="text-xs font-medium text-zinc-600">
                  Google Ads ({adsAccounts.length})
                </Label>
                <select
                  id="ads"
                  className={fieldClass}
                  value={selectedAds}
                  onChange={(event) => setSelectedAds(event.target.value)}
                >
                  <option value="">
                    {adsAccounts.length === 0 ? 'No accounts found' : 'Select account'}
                  </option>
                  {adsAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.descriptive_name} ({account.customer_id})
                    </option>
                  ))}
                </select>
              </div>

              {message ? <p className="text-sm text-zinc-500">{message}</p> : null}
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="min-w-0 text-xs text-zinc-400 sm:pr-2">
                Leave any side blank for partial mapping, or clear all for site-only mode.
              </p>
              <button
                type="button"
                onClick={saveMapping}
                disabled={!googleConnected || loading}
                className={primaryBtnClass}
              >
                <Save className="size-3.5 shrink-0" strokeWidth={2} />
                Save mapping
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isAdminView || connectionStatus === 'not_granted' || connectionStatus === 'needs_refresh' ? (
        <ClientGoogleInviteCard
          operatorEmail={operatorEmail}
          audience={isAdminView ? 'admin' : 'client'}
          projectId={projectId}
          confirmedAt={clientAccessConfirmedAt}
        />
      ) : null}
    </div>
  );
}
