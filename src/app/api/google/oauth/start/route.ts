import { NextResponse } from 'next/server';
import { requireSignedInSession, SessionRequiredError } from '@/lib/db/profiles';
import {
  assertProjectOwnership,
  ProjectAccessError,
  getProjectOverview,
} from '@/lib/db/projects';
import { getGoogleAuthUrl } from '@/lib/google/oauth';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const returnTo = searchParams.get('returnTo');
  const safeReturnTo =
    returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/app';

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required to connect Google.' }, { status: 400 });
  }

  let session;
  try {
    session = await requireSignedInSession();
  } catch (error) {
    if (error instanceof SessionRequiredError) {
      const next = `/audit/${projectId}/connect`;
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(next)}`, request.url)
      );
    }
    throw error;
  }

  try {
    await assertProjectOwnership(projectId, session.userId!);
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const project = await getProjectOverview(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  const nonce = crypto.randomUUID();
  const state = Buffer.from(
    JSON.stringify({
      projectId: projectId ?? null,
      returnTo: safeReturnTo,
      nonce,
    })
  ).toString('base64url');
  const url = getGoogleAuthUrl(state, request);
  const response = NextResponse.redirect(url);
  response.cookies.set('g_oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
