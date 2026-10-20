'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChartColumn,
  CheckCircle2,
  Link2,
  Megaphone,
  RefreshCw,
  Rocket,
  Save,
  Search,
} from 'lucide-react';
import { useInvalidateAuditTab } from '@/components/audit/audit-tab-cache';
import { SoftAuditTabLink } from '@/components/audit/soft-audit-tab-link';
import { ClientGoogleInviteCard } from '@/components/audit/client-google-invite-card';
import { ConnectorSourceCards } from '@/components/audit/connectors/connector-source-cards';
import { AdsInvitePanel } from '@/components/workspace/ads-invite-panel';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ADMIN_STATUS_COPY,
  CLIENT_STATUS_COPY,
  type ConnectionStatus,
} from '@/lib/google/connection-status';
import type { ConnectorId, ConnectorStatus } from '@/lib/connectors/types';
import type { SourceSyncResult } from '@/lib/google/source-sync';
import type { Ga4Property, GoogleAdsAccount, SearchConsoleProperty } from '@/lib/supabase/types';
import { GoogleAdsIcon, GoogleAnalyticsIcon, GoogleFilledIcon, GoogleSearchIcon } from '../icons';

/** Which mapping <select> a connector card's "Manage" should focus. */
const MANAGE_CONTROL_ID: Partial<Record<ConnectorId, string>> = {
  search_console: 'gsc',
  ga4: 'ga4',
  google_ads: 'ads',
};

const fieldClass =
  'h-9 pointer-coarse:h-11 w-full rounded-lg border border-field bg-raised px-3 text-sm text-foreground outline-none transition focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-foreground/15';

const primaryBtnClass =
  'inline-flex h-9 pointer-coarse:h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50';

const outlineBtnClass =
  'inline-flex h-9 pointer-coarse:h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-raised px-3.5 text-sm font-medium text-foreground/90 shadow-sm transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50';

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

type StepState = 'done' | 'current' | 'upcoming' | 'attention';

type SetupStep = { title: string; body: string; state: StepState };

function StepMarker({ state, index }: { state: StepState; index: number }) {
  if (state === 'done') {
    return <CheckCircle2 className="size-6 shrink-0 text-success-ink" strokeWidth={2} />;
  }
  if (state === 'attention') {
    return <AlertTriangle className="size-6 shrink-0 text-warning-ink" strokeWidth={2} />;
  }
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        state === 'current' ? 'bg-primary text-primary-foreground' : 'bg-tint text-muted-foreground'
      }`}
    >
      {index + 1}
    </span>
  );
}

/** One labelled data-source picker with a plain-English line on what it adds. */
function SourceField({
  id,
  icon,
  label,
  help,
  count,
  chosen,
  children,
}: {
  id: string;
  icon: ReactNode;
  label: string;
  help: string;
  count: number;
  chosen: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 rounded-xl bg-muted p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-raised text-foreground/70 shadow-sm">
            {icon}
          </span>
          <div className="min-w-0">
            <Label htmlFor={id} className="text-sm font-medium text-foreground">
              {label}
            </Label>
            <p className="text-xs leading-5 text-muted-foreground">{help}</p>
          </div>
        </div>
        {chosen ? (
          <StatusBadge tone="success">
            <CheckCircle2 strokeWidth={2} />
            Selected
          </StatusBadge>
        ) : (
          <span className="shrink-0 text-[11px] text-muted-foreground">{count} found</span>
        )}
      </div>
      {children}
    </div>
  );
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
  viewerSignedIn = false,
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
  /** Guests get no Google data, and the Ads invite API requires a signed-in user. */
  viewerSignedIn?: boolean;
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
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [mappingSaved, setMappingSaved] = useState(false);
  const base = workspaceBase ?? `/audit/${projectId}`;
  const reportHref = `${base}/brief`;
  const oauthHref = `/api/google/oauth/start?projectId=${projectId}`;

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
      setMessageTone('error');
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
    const anySourceFailed = ['gsc', 'ga4', 'ads'].some(
      (key) => data.sync?.[key] && data.sync[key].status !== 'synced'
    );
    setMessageTone(anySourceFailed ? 'error' : 'success');
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
      setMessageTone('error');
      setMessage(data.error ?? 'Failed to save mapping.');
      return;
    }
    invalidateTab('/connect');
    invalidateTab('/workflow');
    invalidateTab('/brief');
    invalidateTab('/monthly');
    setMappingSaved(true);
    setMessageTone('success');
    setMessage('Saved. Your next audit will use these sources.');
  }

  const needsRefresh = connectionStatus === 'needs_refresh';
  const propertyCount = gscProperties.length + ga4Properties.length + adsAccounts.length;
  const mapped = mappingSaved || connectionStatus === 'synced_mapped';
  const googleStepDone = googleConnected && !needsRefresh;
  const loadedStepDone = googleStepDone && propertyCount > 0;
  const mappedStepDone = loadedStepDone && mapped;

  const steps: SetupStep[] = [
    {
      title: 'Connect Google',
      body: needsRefresh
        ? 'Access expired — reconnect to keep data flowing.'
        : 'Sign in once so we can read your search and visitor data.',
      state: needsRefresh ? 'attention' : googleStepDone ? 'done' : 'current',
    },
    {
      title: 'Load your properties',
      body: 'Pull in the sites and accounts this Google login can see.',
      state: loadedStepDone ? 'done' : googleStepDone ? 'current' : 'upcoming',
    },
    {
      title: 'Pick what to track',
      body: 'Choose which site, analytics, and ads account belong to this workspace.',
      state: mappedStepDone ? 'done' : loadedStepDone ? 'current' : 'upcoming',
    },
    {
      title: 'Run your audit',
      body: 'Head to the Dashboard and run the audit with your data.',
      state: mappedStepDone ? 'current' : 'upcoming',
    },
  ];
  const doneCount = steps.filter((step) => step.state === 'done').length;
  const setupComplete = mappedStepDone;

  const activeSources = connectorStatuses.filter((status) => status.state !== 'coming_soon');
  const comingSoon = connectorStatuses.filter((status) => status.state === 'coming_soon');

  function focusMapping() {
    const target = document.getElementById('gsc');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (target instanceof HTMLSelectElement) target.focus();
  }

  let nextAction: ReactNode;
  if (!googleStepDone) {
    nextAction = (
      <a href={oauthHref} className={primaryBtnClass}>
        {needsRefresh ? 'Reconnect Google' : 'Connect'}
      </a>
    );
  } else if (!loadedStepDone) {
    nextAction = (
      <button type="button" onClick={syncProperties} disabled={loading} className={primaryBtnClass}>
        <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
        {loading ? 'Loading…' : 'Load properties'}
      </button>
    );
  } else if (!mappedStepDone) {
    nextAction = (
      <button type="button" onClick={focusMapping} className={primaryBtnClass}>
        Choose sources
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </button>
    );
  } else {
    nextAction = (
      <div className="flex flex-wrap gap-2">
        <SoftAuditTabLink href={`${base}/workflow`} suffix="/workflow" className={primaryBtnClass}>
          <Rocket className="size-3.5" strokeWidth={2} />
          Go to Dashboard
        </SoftAuditTabLink>
        <a href={reportHref} className={outlineBtnClass}>
          View Brief
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress — where am I, and what's the one thing to do next? */}
      <section className="rounded-xl bg-raised p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {setupComplete ? 'Setup complete' : `Step ${Math.min(doneCount + 1, 4)} of 4`}
            </p>
            <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
              {setupComplete
                ? "You're all set — your audit will use real Google data"
                : needsRefresh
                  ? 'Your Google access needs a quick refresh'
                  : steps.find((step) => step.state === 'current')?.title ?? 'Finish setup'}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              {setupComplete
                ? 'Run an audit from the Dashboard any time. Come back here to change sources.'
                : 'Connecting Google adds real search and visitor numbers to your audit. Without it, the audit uses your website only.'}
            </p>
          </div>
          <div className="shrink-0">{nextAction}</div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-tint">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${(doneCount / 3) * 100}%` }}
          />
        </div>

        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`flex gap-3 rounded-xl p-3 ${
                step.state === 'current'
                  ? 'bg-muted ring-1 ring-border'
                  : step.state === 'attention'
                    ? 'bg-warning-soft'
                    : ''
              }`}
            >
              <StepMarker state={step.state} index={index} />
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {googleConnected && missingFeatures.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-warning-ink/20 bg-warning-soft p-4 text-sm text-warning-ink sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 leading-5">
            <span className="font-semibold">
              {missingFeatures.map((feature) => feature.label).join(', ')}
            </span>{' '}
            {missingFeatures.length === 1 ? "wasn't" : "weren't"} shared. When Google asks for
            permission, tick every box so we can read them.
          </p>
          <a href={oauthHref} className={`${primaryBtnClass} shrink-0`}>
            Grant missing access
          </a>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <section id="google-account" className="rounded-xl bg-raised p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-tint text-foreground/80">
              <GoogleFilledIcon className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Google account</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Read-only access. We never change anything in your Google accounts.
              </p>
            </div>
          </div>

          <div className="mt-5">
            {googleConnected ? (
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                  needsRefresh
                    ? 'border-warning-ink/20 bg-warning-soft text-warning-ink'
                    : 'border-success-ink/20 bg-success-soft text-success-ink'
                }`}
              >
                {needsRefresh ? (
                  <AlertTriangle className="size-4 shrink-0" strokeWidth={2} />
                ) : (
                  <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} />
                )}
                <span className="min-w-0 truncate">
                  {connectedEmail ? `Connected as ${connectedEmail}` : 'Connected for this workspace'}
                </span>
              </div>
            ) : (
              <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                Not connected yet.
              </p>
            )}
          </div>

          {googleConnected ? (
            <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <dt>Status</dt>
                <dd
                  className={
                    needsRefresh ? 'font-semibold text-warning-ink' : 'font-semibold text-foreground'
                  }
                >
                  {ADMIN_STATUS_COPY[connectionStatus]}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt>Last synced</dt>
                <dd className="font-medium text-foreground/80">
                  <RelativeTime value={lastSyncedAt} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt>Access renews</dt>
                <dd className="font-medium text-foreground/80">
                  <RelativeTime value={tokenExpiry} emptyLabel="Not set" />
                </dd>
              </div>
              {scopes.length > 0 ? (
                <div className="flex items-start justify-between gap-2">
                  <dt className="pt-0.5">Shared with us</dt>
                  <dd className="flex flex-wrap justify-end gap-1.5">
                    {scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded-full bg-tint px-2 py-0.5 text-[11px] font-medium text-foreground/80"
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
            <a href={oauthHref} className={googleConnected ? outlineBtnClass : primaryBtnClass}>
              {googleConnected ? 'Reconnect' : 'Connect'}
            </a>
          </div>
        </section>

        <section className="rounded-xl bg-raised p-5 shadow-sm lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Choose your data sources</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Pick one of each that belongs to this website. Your website itself is always
                included.
              </p>
            </div>
            <button
              type="button"
              onClick={syncProperties}
              disabled={!googleConnected || loading}
              className={outlineBtnClass}
              title="Re-load the list of properties from Google"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
              Refresh list
            </button>
          </div>

          {!googleConnected ? (
            <p className="mt-4 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
              Connect Google first — your properties will show up here.
            </p>
          ) : null}

          <div className="mt-4 grid gap-3">
            <SourceField
              id="gsc"
              icon={<GoogleSearchIcon className="size-3.5" strokeWidth={2} />}
              label="Search Console"
              help="How people find you on Google — searches, clicks, rankings."
              count={gscProperties.length}
              chosen={Boolean(selectedGsc)}
            >
              <select
                id="gsc"
                className={fieldClass}
                value={selectedGsc}
                disabled={!googleConnected}
                onChange={(event) => setSelectedGsc(event.target.value)}
              >
                <option value="">
                  {gscProperties.length === 0 ? 'No sites found' : 'Select a site'}
                </option>
                {gscProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.site_url}
                  </option>
                ))}
              </select>
            </SourceField>

            <SourceField
              id="ga4"
              icon={<GoogleAnalyticsIcon className="size-3.5" strokeWidth={2} />}
              label="Google Analytics (GA4)"
              help="What visitors do on your site — traffic, engagement, conversions."
              count={ga4Properties.length}
              chosen={Boolean(selectedGa4)}
            >
              <select
                id="ga4"
                className={fieldClass}
                value={selectedGa4}
                disabled={!googleConnected}
                onChange={(event) => setSelectedGa4(event.target.value)}
              >
                <option value="">
                  {ga4Properties.length === 0 ? 'No properties found' : 'Select a property'}
                </option>
                {ga4Properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.property_name} ({property.account_name})
                  </option>
                ))}
              </select>
            </SourceField>

            <SourceField
              id="ads"
              icon={<GoogleAdsIcon className="size-3.5" strokeWidth={2} />}
              label="Google Ads"
              help="Paid campaign spend and results. Optional."
              count={adsAccounts.length}
              chosen={Boolean(selectedAds)}
            >
              <select
                id="ads"
                className={fieldClass}
                value={selectedAds}
                disabled={!googleConnected}
                onChange={(event) => setSelectedAds(event.target.value)}
              >
                <option value="">
                  {adsAccounts.length === 0 ? 'No accounts found' : 'Select an account'}
                </option>
                {adsAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.descriptive_name} ({account.customer_id})
                  </option>
                ))}
              </select>
              {viewerSignedIn ? (
                <details className="group">
                  <summary className="cursor-pointer list-none text-xs font-medium text-foreground/70 underline-offset-2 hover:underline [&::-webkit-details-marker]:hidden">
                    Don&apos;t see the Ads account? Send an invite
                  </summary>
                  <div className="mt-2">
                    <AdsInvitePanel projectId={projectId} />
                  </div>
                </details>
              ) : null}
            </SourceField>

            {message ? (
              <p
                role="status"
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  messageTone === 'error'
                    ? 'bg-warning-soft text-warning-ink'
                    : 'bg-success-soft text-success-ink'
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="min-w-0 text-xs text-muted-foreground sm:pr-2">
              Skipping one is fine — the audit uses whatever you pick.
            </p>
            <button
              type="button"
              onClick={saveMapping}
              disabled={!googleConnected || loading}
              className={primaryBtnClass}
            >
              <Save className="size-3.5 shrink-0" strokeWidth={2} />
              Save sources
            </button>
          </div>
        </section>
      </div>

      {activeSources.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">What the audit can see</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Live status for each data source. Green means it&apos;s feeding your audit.
            </p>
          </div>
          <ConnectorSourceCards statuses={activeSources} onManage={focusManageTarget} />
          {comingSoon.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Coming soon:{' '}
              {comingSoon.map((status) => status.label).join(', ')}
            </p>
          ) : null}
        </section>
      ) : null}

      {connectionStatus === 'not_granted' || needsRefresh ? (
        <ClientGoogleInviteCard audience="client" />
      ) : null}
    </div>
  );
}
