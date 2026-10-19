import { refreshAccessToken } from '@/lib/google/oauth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type { GoogleConnection } from '@/lib/supabase/types';

/** Refresh slightly before expiry so a request started now doesn't expire mid-flight. */
const REFRESH_LEEWAY_MS = 5 * 60_000;

export type FreshGoogleConnection = {
  connection: GoogleConnection;
  /** True when Google will not issue a new access token without the client signing in again. */
  needsReconnect: boolean;
};

/**
 * Access tokens last one hour. Refresh them with the stored refresh token, so
 * the client only sees "reconnect" when Google has actually revoked access.
 */
export async function getFreshGoogleConnection(
  connection: GoogleConnection
): Promise<FreshGoogleConnection> {
  const expiry = connection.token_expiry ? new Date(connection.token_expiry).getTime() : 0;
  if (expiry > Date.now() + REFRESH_LEEWAY_MS) {
    return { connection, needsReconnect: false };
  }

  if (!connection.refresh_token) {
    return { connection, needsReconnect: true };
  }

  try {
    const refreshed = await refreshAccessToken(connection.refresh_token);
    if (!refreshed.access_token) throw new Error('Google returned no access token on refresh.');

    const { data, error } = await getSupabaseAdmin()
      .from('google_connections')
      .update({
        access_token: refreshed.access_token,
        token_expiry: refreshed.expiry_date ? new Date(refreshed.expiry_date).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);

    return { connection: data as GoogleConnection, needsReconnect: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // invalid_grant = the grant was revoked or expired. Anything else (network, 5xx) is
    // not the client's problem, so keep the stored row and let the next load retry.
    const revoked = /invalid_grant/i.test(message);
    console.error('[google] token refresh failed', { connectionId: connection.id, revoked, message });
    return { connection, needsReconnect: revoked };
  }
}
