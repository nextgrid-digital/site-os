import { google } from 'googleapis';
import { getAppUrl } from '@/lib/app-url';
export { getOperatorEmail } from '@/lib/google/operator-email';

export const GOOGLE_SEARCH_CONSOLE_SCOPE =
  'https://www.googleapis.com/auth/webmasters.readonly';
export const GOOGLE_ANALYTICS_SCOPE =
  'https://www.googleapis.com/auth/analytics.readonly';
export const GOOGLE_ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';
/** Lets us show which Google account the client connected (not the agency's). */
export const GOOGLE_EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';

export const GOOGLE_SCOPES = [
  GOOGLE_SEARCH_CONSOLE_SCOPE,
  GOOGLE_ANALYTICS_SCOPE,
  GOOGLE_ADS_SCOPE,
  GOOGLE_EMAIL_SCOPE,
];

/** The three features an audit reads from. Clients can untick any of them on the consent screen. */
export const GOOGLE_FEATURES = [
  { key: 'search_console', label: 'Search Console', scope: GOOGLE_SEARCH_CONSOLE_SCOPE },
  { key: 'ga4', label: 'GA4', scope: GOOGLE_ANALYTICS_SCOPE },
  { key: 'google_ads', label: 'Google Ads', scope: GOOGLE_ADS_SCOPE },
] as const;

export type GoogleFeatureKey = (typeof GOOGLE_FEATURES)[number]['key'];

export function getMissingGoogleFeatures(grantedScopes: string[]) {
  return GOOGLE_FEATURES.filter((feature) => !grantedScopes.includes(feature.scope));
}

export function getGoogleRedirectUri(request?: Request) {
  if (process.env.GOOGLE_REDIRECT_URI?.trim()) {
    return process.env.GOOGLE_REDIRECT_URI.trim().replace(/\/$/, '');
  }
  return `${getAppUrl(request)}/api/google/oauth/callback`;
}

export function createOAuthClient(request?: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'There is some problem with the Google configuration. Please contact support.'
      );
    } else {
      throw new Error(
        'Google OAuth client ID and secret are not set.'
      );
    }
  }

  return new google.auth.OAuth2(clientId, clientSecret, getGoogleRedirectUri(request));
}

export function getGoogleAuthUrl(state: string, request?: Request) {
  const client = createOAuthClient(request);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
    state,
  });
}

export async function exchangeCodeForTokens(code: string, request?: Request) {
  const client = createOAuthClient(request);
  const { tokens } = await client.getToken(code);
  return tokens;
}

/** Email of the Google account that granted access, or null if it can't be read. */
export async function fetchGoogleAccountEmail(accessToken: string): Promise<string | null> {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { email?: string };
  return body.email ?? null;
}

export function getAuthorizedClient(tokens: {
  access_token: string;
  refresh_token?: string | null;
  expiry_date?: number | null;
}) {
  const client = createOAuthClient();
  client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined,
  });
  return client;
}

export async function refreshAccessToken(refreshToken: string) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}
