import { getConnectorDefinition } from '@/lib/connectors/registry';
import type {
  ConnectorConnectionState,
  ConnectorId,
  ConnectorStatus,
} from '@/lib/connectors/types';
import {
  GOOGLE_ADS_SCOPE,
  GOOGLE_ANALYTICS_SCOPE,
  GOOGLE_SEARCH_CONSOLE_SCOPE,
} from '@/lib/google/oauth';

export type ProjectConnectorSnapshotInput = {
  websiteUrl: string | null;
  googleConnected: boolean;
  googleScopes: string[];
  gscSelected: boolean;
  gscLabel: string | null;
  ga4Selected: boolean;
  ga4Label: string | null;
  adsSelected: boolean;
  adsLabel: string | null;
  adsDeveloperTokenConfigured: boolean;
  /** Latest completed audit timestamp (ISO). */
  lastAuditAt: string | null;
  /** Sources that contributed data in the latest audit. */
  usedInLatestAudit: Partial<Record<ConnectorId, boolean>>;
  dataFlags?: {
    gscHasData?: boolean;
    ga4HasData?: boolean;
    adsHasData?: boolean;
    pagesCrawled?: number;
  };
};

function hasScope(scopes: string[], scope: string) {
  return scopes.some((s) => s === scope || s.includes(scope));
}

function googlePartialReason(scopes: string[]): string | null {
  const missing: string[] = [];
  if (!hasScope(scopes, GOOGLE_SEARCH_CONSOLE_SCOPE)) missing.push('Search Console');
  if (!hasScope(scopes, GOOGLE_ANALYTICS_SCOPE)) missing.push('Analytics');
  if (!hasScope(scopes, GOOGLE_ADS_SCOPE)) missing.push('Ads');
  if (missing.length === 0) return null;
  return `Google OAuth is missing: ${missing.join(', ')}. Reconnect to grant access.`;
}

function buildComingSoon(id: ConnectorId): ConnectorStatus {
  const def = getConnectorDefinition(id);
  return {
    connectorId: id,
    state: 'coming_soon',
    label: def.label,
    resourceLabel: null,
    availableSignals: def.signals,
    lastSyncAt: null,
    usedInAudit: false,
    message: 'Coming in a later phase.',
    partialReason: null,
  };
}

export function buildConnectorStatuses(input: ProjectConnectorSnapshotInput): ConnectorStatus[] {
  const partialGoogle = input.googleConnected ? googlePartialReason(input.googleScopes) : null;
  const lastSync = input.lastAuditAt;

  const website: ConnectorStatus = (() => {
    const def = getConnectorDefinition('website');
    const connected = Boolean(input.websiteUrl);
    const crawled = (input.dataFlags?.pagesCrawled ?? 0) > 0;
    return {
      connectorId: 'website',
      state: connected ? 'connected' : 'disconnected',
      label: def.label,
      resourceLabel: input.websiteUrl,
      availableSignals: connected ? def.signals : [],
      lastSyncAt: connected && crawled ? lastSync : connected ? lastSync : null,
      usedInAudit: Boolean(input.usedInLatestAudit.website),
      message: connected ? null : 'Add a website URL to crawl pages and structure.',
      partialReason: null,
    };
  })();

  const searchConsole: ConnectorStatus = (() => {
    const def = getConnectorDefinition('search_console');
    if (!input.googleConnected) {
      return {
        connectorId: 'search_console',
        state: 'disconnected' as ConnectorConnectionState,
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Connect Google to map a Search Console property.',
        partialReason: null,
      };
    }
    if (!input.gscSelected) {
      return {
        connectorId: 'search_console',
        state: 'partial',
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Google connected — select a Search Console property.',
        partialReason: partialGoogle,
      };
    }
    const hasData = input.dataFlags?.gscHasData;
    return {
      connectorId: 'search_console',
      state: hasData === false ? 'partial' : 'connected',
      label: def.label,
      resourceLabel: input.gscLabel,
      availableSignals: def.signals,
      lastSyncAt: lastSync,
      usedInAudit: Boolean(input.usedInLatestAudit.search_console),
      message: hasData === false ? 'Property mapped, but the last audit had little Search Console data.' : null,
      partialReason: hasData === false ? 'Low or empty Search Console data in the last audit.' : partialGoogle,
    };
  })();

  const ga4: ConnectorStatus = (() => {
    const def = getConnectorDefinition('ga4');
    if (!input.googleConnected) {
      return {
        connectorId: 'ga4',
        state: 'disconnected',
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Connect Google to map a GA4 property.',
        partialReason: null,
      };
    }
    if (!input.ga4Selected) {
      return {
        connectorId: 'ga4',
        state: 'partial',
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Google connected — select a GA4 property.',
        partialReason: partialGoogle,
      };
    }
    const hasData = input.dataFlags?.ga4HasData;
    return {
      connectorId: 'ga4',
      state: hasData === false ? 'partial' : 'connected',
      label: def.label,
      resourceLabel: input.ga4Label,
      availableSignals: def.signals,
      lastSyncAt: lastSync,
      usedInAudit: Boolean(input.usedInLatestAudit.ga4),
      message: hasData === false ? 'Property mapped, but the last audit had little GA4 data.' : null,
      partialReason: hasData === false ? 'Low or empty GA4 data in the last audit.' : partialGoogle,
    };
  })();

  const ads: ConnectorStatus = (() => {
    const def = getConnectorDefinition('google_ads');
    if (!input.adsDeveloperTokenConfigured) {
      return {
        connectorId: 'google_ads',
        state: 'disconnected',
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Set GOOGLE_ADS_DEVELOPER_TOKEN to enable Ads sync.',
        partialReason: null,
      };
    }
    if (!input.googleConnected) {
      return {
        connectorId: 'google_ads',
        state: 'disconnected',
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Connect Google (with Ads access) to map an Ads account.',
        partialReason: null,
      };
    }
    if (!hasScope(input.googleScopes, GOOGLE_ADS_SCOPE)) {
      return {
        connectorId: 'google_ads',
        state: 'partial',
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Reconnect Google to grant Ads readonly access.',
        partialReason: 'Missing Ads OAuth scope.',
      };
    }
    if (!input.adsSelected) {
      return {
        connectorId: 'google_ads',
        state: 'partial',
        label: def.label,
        resourceLabel: null,
        availableSignals: [],
        lastSyncAt: null,
        usedInAudit: false,
        message: 'Google connected — select a Google Ads account.',
        partialReason: partialGoogle,
      };
    }
    const hasData = input.dataFlags?.adsHasData;
    return {
      connectorId: 'google_ads',
      state: hasData === false ? 'partial' : 'connected',
      label: def.label,
      resourceLabel: input.adsLabel,
      availableSignals: def.signals,
      lastSyncAt: lastSync,
      usedInAudit: Boolean(input.usedInLatestAudit.google_ads),
      message: hasData === false ? 'Account mapped, but the last audit had little Ads data.' : null,
      partialReason: hasData === false ? 'Low or empty Ads data in the last audit.' : null,
    };
  })();

  return [
    website,
    ga4,
    searchConsole,
    ads,
    buildComingSoon('instagram'),
    buildComingSoon('x'),
    buildComingSoon('youtube'),
    buildComingSoon('tiktok'),
  ];
}

export function isAdsDeveloperTokenConfigured() {
  return Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim());
}
