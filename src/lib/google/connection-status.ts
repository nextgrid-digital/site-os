import type { GoogleConnection } from '@/lib/supabase/types';

export type ConnectionStatus =
  | 'not_granted'
  | 'granted_pending_sync'
  | 'synced_mapped'
  | 'needs_refresh';

export interface ConnectionStatusInfo {
  status: ConnectionStatus;
  /** True if the stored Google token is already past its expiry. */
  tokenExpired: boolean;
  /** Most recent connect/sync timestamp, if any. */
  lastCheckedAt: string | null;
}

/**
 * Derive a single connection status from data already stored on the
 * connection + whether a GSC/GA4/Ads property has been mapped for the
 * project. No new tables — just a shared read of existing columns so the
 * admin and client views never disagree on what "connected" means.
 */
export function deriveConnectionStatus(
  connection: Pick<GoogleConnection, 'token_expiry' | 'updated_at'> | null,
  hasSelectedProperty: boolean
): ConnectionStatusInfo {
  if (!connection) {
    return { status: 'not_granted', tokenExpired: false, lastCheckedAt: null };
  }

  const tokenExpired = Boolean(
    connection.token_expiry && new Date(connection.token_expiry).getTime() < Date.now()
  );

  if (tokenExpired) {
    return { status: 'needs_refresh', tokenExpired: true, lastCheckedAt: connection.updated_at };
  }

  return {
    status: hasSelectedProperty ? 'synced_mapped' : 'granted_pending_sync',
    tokenExpired: false,
    lastCheckedAt: connection.updated_at,
  };
}

export const CLIENT_STATUS_COPY: Record<ConnectionStatus, string> = {
  not_granted: 'Waiting for you to grant access',
  granted_pending_sync: 'Access granted — our team is setting up your audit',
  synced_mapped: 'Your full audit is in progress',
  needs_refresh: 'Access needs to be refreshed — our team has been notified',
};

export const ADMIN_STATUS_COPY: Record<ConnectionStatus, string> = {
  not_granted: 'Not granted',
  granted_pending_sync: 'Granted, not yet mapped',
  synced_mapped: 'Synced & mapped',
  needs_refresh: 'Token expired — needs refresh',
};
