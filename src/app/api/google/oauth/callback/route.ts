import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { upsertGoogleConnection } from '@/lib/db/google';
import { exchangeCodeForTokens } from '@/lib/google/oauth';

function connectErrorRedirect(appUrl: string, projectId: string | null, message: string) {
  if (projectId) {
    return NextResponse.redirect(
      `${appUrl}/audit/${projectId}/connect?error=${encodeURIComponent(message)}`
    );
  }
  return NextResponse.redirect(`${appUrl}/app?error=${encodeURIComponent(message)}`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const appUrl = getAppUrl(request);

  let projectId: string | null = null;
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
        projectId?: string;
      };
      projectId = typeof parsed.projectId === 'string' ? parsed.projectId : null;
    } catch {
      projectId = null;
    }
  }

  if (error) {
    return connectErrorRedirect(appUrl, projectId, error);
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing OAuth code or state.' }, { status: 400 });
  }

  try {
    if (!projectId) {
      throw new Error('Missing project in OAuth state.');
    }
    const tokens = await exchangeCodeForTokens(code, request);
    await upsertGoogleConnection(tokens);

    return NextResponse.redirect(`${appUrl}/audit/${projectId}/connect?connected=1`);
  } catch (callbackError) {
    return connectErrorRedirect(
      appUrl,
      projectId,
      callbackError instanceof Error ? callbackError.message : 'OAuth failed.'
    );
  }
}
