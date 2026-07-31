import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { upsertGoogleConnection } from '@/lib/db/google';
import { exchangeCodeForTokens } from '@/lib/google/oauth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const appUrl = getAppUrl(request);

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/operator?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing OAuth code or state.' }, { status: 400 });
  }

  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
      projectId: string;
    };
    const tokens = await exchangeCodeForTokens(code, request);
    await upsertGoogleConnection(tokens);

    return NextResponse.redirect(
      `${appUrl}/audit/${parsed.projectId}/connect?connected=1`
    );
  } catch (callbackError) {
    return NextResponse.redirect(
      `${appUrl}/operator?error=${encodeURIComponent(
        callbackError instanceof Error ? callbackError.message : 'OAuth failed.'
      )}`
    );
  }
}
