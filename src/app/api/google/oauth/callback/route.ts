import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { upsertGoogleConnection } from '@/lib/db/google';
import { syncGoogleConnectionInventory } from '@/lib/db/google-inventory';
import { exchangeCodeForTokens } from '@/lib/google/oauth';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const appUrl = getAppUrl(request);

  let projectId: string | null = null;
  let returnTo = '/app';
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
        projectId?: string | null;
        returnTo?: string;
      };
      projectId = typeof parsed.projectId === 'string' ? parsed.projectId : null;
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
    return connectErrorRedirect(appUrl, projectId, returnTo, error);
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing OAuth code or state.' }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code, request);
    await upsertGoogleConnection(tokens);
    try {
      await syncGoogleConnectionInventory();
    } catch (inventoryError) {
      console.error('[google/oauth/callback] inventory sync failed', inventoryError);
    }

    if (projectId) {
      return NextResponse.redirect(`${appUrl}/audit/${projectId}/connect?connected=1`);
    }
    return NextResponse.redirect(`${appUrl}${returnTo}?connected=1`);
  } catch (callbackError) {
    return connectErrorRedirect(
      appUrl,
      projectId,
      returnTo,
      callbackError instanceof Error ? callbackError.message : 'OAuth failed.'
    );
  }
}
