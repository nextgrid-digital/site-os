export type ConnectorId =
  | 'website'
  | 'ga4'
  | 'search_console'
  | 'google_ads'
  | 'instagram'
  | 'x'
  | 'youtube'
  | 'tiktok';

export type ConnectorPhase = 1 | 2 | 3;

export type ConnectorAvailability = 'available' | 'coming_soon';

export type ConnectorAuthKind = 'none' | 'oauth' | 'url';

export type ConnectorConnectionState =
  | 'disconnected'
  | 'partial'
  | 'connected'
  | 'error'
  | 'coming_soon';

export type ConnectorDefinition = {
  id: ConnectorId;
  label: string;
  shortLabel: string;
  phase: ConnectorPhase;
  availability: ConnectorAvailability;
  authKind: ConnectorAuthKind;
  /** Short list of signals this source can expose when connected. */
  signals: string[];
  /** Empty-state copy for Brand dashboard sections. */
  emptyWhatYouWouldSee: string;
};

export type ConnectorResource = {
  id: string;
  label: string;
  externalId: string;
  meta?: Record<string, string | null>;
};

export type ProjectConnectorMapping = {
  connectorId: ConnectorId;
  resourceId: string | null;
  resourceLabel: string | null;
  selected: boolean;
};

export type ConnectorStatus = {
  connectorId: ConnectorId;
  state: ConnectorConnectionState;
  label: string;
  resourceLabel: string | null;
  availableSignals: string[];
  lastSyncAt: string | null;
  usedInAudit: boolean;
  message: string | null;
  partialReason: string | null;
};

export type ConnectorSyncOutcome = 'ok' | 'partial' | 'error' | 'skipped';

export type ConnectorSyncResult = {
  connectorId: ConnectorId;
  outcome: ConnectorSyncOutcome;
  hasData: boolean;
  message?: string;
  /** Typed payload stored under snapshot.connectors[id] */
  payload?: unknown;
};
