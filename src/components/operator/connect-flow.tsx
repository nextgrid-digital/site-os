'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Link2, RefreshCw, Save } from 'lucide-react';
import { useInvalidateAuditTab } from '@/components/audit/audit-tab-cache';
import { ClientGoogleInviteCard } from '@/components/audit/client-google-invite-card';
import { ConnectorSourceCards } from '@/components/audit/connectors/connector-source-cards';
import { AdsInvitePanel } from '@/components/operator/ads-invite-panel';
import { Label } from '@/components/ui/label';
import {
  ADMIN_STATUS_COPY,
  CLIENT_STATUS_COPY,
  type ConnectionStatus,
} from '@/lib/google/connection-status';
import type { ConnectorId, ConnectorStatus } from '@/lib/connectors/types';
import type { SourceSyncResult } from '@/lib/google/source-sync';
import type { Ga4Property, GoogleAdsAccount, SearchConsoleProperty } from '@/lib/supabase/types';

/** Which mapping <select> a connector card's "Manage" should focus. */
const MANAGE_CONTROL_ID: Partial<Record<ConnectorId, string>> = {
  search_console: 'gsc',
  ga4: 'ga4',
  google_ads: 'ads',
};

const fieldClass =
  'h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400';

const primaryBtnClass =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-zinc-950 px-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50';

const outlineBtnClass =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50';

/** "3 min ago" / "in 42 min", with the exact time available as a tooltip. */
function RelativeTime({ value, emptyLabel = 'Never' }: { value: string | null; emptyLabel?: string }) {
  if (!value) return <span>{emptyLabel}</span>;
  const date = new Date(value);
  return (
    <time dateTime={value} title={format(date, 'd MMM yyyy, h:mm:ss a')}>
      {formatDistanceToNow(date, { addSuffix: true })}
    </time>
  );
}

function describeSourceSync(label: string, result: SourceSyncResult | undefined) {
  if (!result) return null;
  switch (result.status) {
    case 'synced':
      return `${label}: ${result.count} found`;
    case 'missing_scope':
      return `${label}: access not granted, use "Grant missing access" below`;
    case 'error':
      return `${label}: ${result.message}`;
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}

/** Google scope URLs → the product names the client recognises. */
const SCOPE_LABELS: Record<string, string> = {
  'webmasters.readonly': 'Search Console',
  'analytics.readonly': 'GA4',
  adwords: 'Google Ads',
  'userinfo.email': 'Account email',
};

function scopeLabel(scope: string) {
  const key = scope.split('/').pop() ?? scope;
  return SCOPE_LABELS[key] ?? key;
}

export function ConnectFlow({
  projectId,
  googleConnected,
  gscProperties,
  ga4Properties,
  adsAccounts = [],
  connectorStatuses = [],
  operatorEmail,
  connectedEmail = null,
  tokenExpiry = null,
  lastSyncedAt = null,
  scopes = [],
  missingFeatures = [],
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
  /** Agency account the client invites (hello@…). Not the account that connected. */
  operatorEmail?: string | null;
  /** Google account that actually granted access. */
  connectedEmail?: string | null;
  tokenExpiry?: string | null;
  lastSyncedAt?: string | null;
  scopes?: string[];
  /** Features the client left unticked on the Google consent screen. */
  missingFeatures?: { key: string; label: string }[];
  /** True when the viewer is an admin managing this client's connection, not the client themselves. */
  connectionStatus?: ConnectionStatus;
  clientAccessConfirmedAt?: string | null;
  workspaceBase?: string;
}) {
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

  // "Manage" on a source card jumps to the control that fixes that source.
  // Without a Google connection there is nothing to map, so go to the connect section.
  function focusManageTarget(connectorId: ConnectorId) {
    const controlId = googleConnected ? MANAGE_CONTROL_ID[connectorId] : undefined;
    const target = document.getElementById(controlId ?? 'google-account');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (target instanceof HTMLSelectElement) target.focus();
  }

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

    invalidateTab('/connect');
    invalidateTab('/workflow');
    invalidateTab('/brief');
    invalidateTab('/monthly');

    const summary = [
      describeSourceSync('Search Console', data.sync?.gsc),
      describeSourceSync('GA4', data.sync?.ga4),
      describeSourceSync('Google Ads', data.sync?.ads),
    ].filter(Boolean);
    setMessage(summary.length > 0 ? summary.join(' · ') : 'Synced.');
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
    invalidateTab('/monthly');
    setMappingSaved(true);
    setMessage('Property mapping saved.');
  }

  
  return (
    <div className="space-y-6">

      {mappingSaved || googleConnected ? (
        <div className="flex flex-wrap gap-2">
          <a href={reportHref} className={primaryBtnClass}>
            View Brief
          </a>
          <a href="/app" className={outlineBtnClass}>
            Your sites
          </a>
        </div>
      ) : null}

      {googleConnected && missingFeatures.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 leading-5">
            Access not granted for <span className="font-semibold">{missingFeatures.map((feature) => feature.label).join(', ')}</span>.
            Those sources can&apos;t be read until Google access is granted with every box ticked.
          </p>
          <a href={`/api/google/oauth/start?projectId=${projectId}`} className={`${primaryBtnClass} shrink-0`}>
            Grant missing access
          </a>
        </div>
      ) : null}

      {connectorStatuses.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">Sources</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Connection status for each channel. Phase 2–3 sources stay empty until they ship.
            </p>
          </div>
          <ConnectorSourceCards statuses={connectorStatuses} onManage={focusManageTarget} />
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
          <section id="google-account" className="rounded-[14px] bg-white p-5 shadow-sm">
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
                    {connectedEmail ? `Connected as ${connectedEmail}` : 'Connected for this workspace'}
                  </span>
                </div>
              ) : (
                <p className="rounded-lg bg-zinc-50 px-3 py-2.5 text-sm text-zinc-500">
                  Google is not connected yet for this workspace.
                </p>
              )}
            </div>

            {googleConnected ? (
              <dl className="mt-4 space-y-2.5 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
                <div className="flex items-center justify-between gap-2">
                  <dt>Status</dt>
                  <dd
                    className={
                      connectionStatus === 'needs_refresh'
                        ? 'font-semibold text-red-600'
                        : 'font-semibold text-zinc-950'
                    }
                  >
                    {ADMIN_STATUS_COPY[connectionStatus]}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt>Last synced</dt>
                  <dd className="font-medium text-zinc-700">
                    <RelativeTime value={lastSyncedAt} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt>Token expires</dt>
                  <dd className="font-medium text-zinc-700">
                    <RelativeTime value={tokenExpiry} emptyLabel="Not set" />
                  </dd>
                </div>
                {scopes.length > 0 ? (
                  <div className="flex items-start justify-between gap-2">
                    <dt className="pt-0.5">Access</dt>
                    <dd className="flex flex-wrap justify-end gap-1.5">
                      {scopes.map((scope) => (
                        <span
                          key={scope}
                          className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                        >
                          {scopeLabel(scope)}
                        </span>
                      ))}
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

              <AdsInvitePanel projectId={projectId} />

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

      {connectionStatus === 'not_granted' || connectionStatus === 'needs_refresh' ? (
        <ClientGoogleInviteCard audience="client" />
      ) : null}
    </div>
  );
}
