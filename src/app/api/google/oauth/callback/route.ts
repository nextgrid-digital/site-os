import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAppUrl } from '@/lib/app-url';
import { upsertGoogleConnection } from '@/lib/db/google';
import { syncGoogleConnectionInventory } from '@/lib/db/google-inventory';
import { exchangeCodeForTokens, fetchGoogleAccountEmail } from '@/lib/google/oauth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

function connectErrorRedirect(appUrl: string, projectId: string | null, returnTo: string, message: string) {
  if (projectId) {
    return NextResponse.redirect(
      `${appUrl}/audit/${projectId}/connect?error=${encodeURIComponent(message)}`
    );
  }
  const sep = returnTo.includes('?') ? '&' : '?';
  return NextResponse.redirect(
    `${appUrl}${returnTo}${sep}error=${encodeURIComponent(message)}`
  );
}

const GENERIC_CONNECT_ERROR =
  'Something went wrong while connecting your Google account. Please try again, and contact support if it keeps happening.';

/** Turns raw Google/OAuth errors into messages that are safe and useful to show a customer. */
function friendlyGoogleError(raw: string): string {
  const code = raw.toLowerCase();
  if (code.includes('access_denied')) {
    return 'Google access was not granted. Please try again and approve the requested permissions.';
  }
  if (code.includes('invalid_grant')) {
    return 'The connection request expired. Please try connecting again.';
  }
  // invalid_client, redirect_uri_mismatch, unauthorized_client, etc. are our configuration problems.
  return GENERIC_CONNECT_ERROR;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const appUrl = getAppUrl(request);

  const cookieStore = await cookies();
  const expectedNonce = cookieStore.get('g_oauth_state')?.value ?? null;
  cookieStore.delete('g_oauth_state');

  let projectId: string | null = null;
  let returnTo = '/app';
  let nonce: string | null = null;
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
        projectId?: string | null;
        returnTo?: string;
        nonce?: string;
      };
      projectId = typeof parsed.projectId === 'string' ? parsed.projectId : null;
      nonce = typeof parsed.nonce === 'string' ? parsed.nonce : null;
      if (
        typeof parsed.returnTo === 'string' &&
        parsed.returnTo.startsWith('/') &&
        !parsed.returnTo.startsWith('//')
      ) {
        returnTo = parsed.returnTo;
      }
    } catch {
      projectId = null;
    }
  }

  if (error) {
    console.error('[google/oauth/callback] Google returned error', error);
    return connectErrorRedirect(appUrl, projectId, returnTo, friendlyGoogleError(error));
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing OAuth code or state.' }, { status: 400 });
  }

  if (!nonce || !expectedNonce || nonce !== expectedNonce) {
    return connectErrorRedirect(
      appUrl,
      projectId,
      returnTo,
      'Invalid or expired connection request. Please try connecting again.'
    );
  }

  if (!projectId) {
    return connectErrorRedirect(appUrl, null, returnTo, 'Missing project context for Google connection.');
  }

  try {
    const tokens = await exchangeCodeForTokens(code, request);
    const accountEmail = tokens.access_token
      ? await fetchGoogleAccountEmail(tokens.access_token)
      : null;
    await upsertGoogleConnection(projectId, tokens, accountEmail);
    try {
      const { data: project } = await getSupabaseAdmin()
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .maybeSingle();
      if (project?.user_id) {
        await syncGoogleConnectionInventory(project.user_id);
      }
    } catch (inventoryError) {
      console.error('[google/oauth/callback] inventory sync failed', inventoryError);
    }

    if (projectId) {
      return NextResponse.redirect(`${appUrl}/audit/${projectId}/connect?connected=1`);
    }
    return NextResponse.redirect(`${appUrl}${returnTo}?connected=1`);
  } catch (callbackError) {
    console.error('[google/oauth/callback] token exchange failed', callbackError);
    return connectErrorRedirect(
      appUrl,
      projectId,
      returnTo,
      friendlyGoogleError(callbackError instanceof Error ? callbackError.message : '')
    );
  }
}
