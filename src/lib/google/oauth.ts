import { google } from 'googleapis';
import { getAppUrl } from '@/lib/app-url';

export const GOOGLE_SEARCH_CONSOLE_SCOPE =
  'https://www.googleapis.com/auth/webmasters.readonly';
export const GOOGLE_ANALYTICS_SCOPE =
  'https://www.googleapis.com/auth/analytics.readonly';
export const GOOGLE_ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';

export const GOOGLE_SCOPES = [
  GOOGLE_SEARCH_CONSOLE_SCOPE,
  GOOGLE_ANALYTICS_SCOPE,
  GOOGLE_ADS_SCOPE,
];

export function getOperatorEmail() {
  return process.env.OPERATOR_EMAIL ?? 'hello@nextgrid.digital';
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
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
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
