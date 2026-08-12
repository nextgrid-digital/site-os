import { NextResponse } from 'next/server';
import { PaidPlanRequiredError, requirePaidSession } from '@/lib/db/profiles';
import { getProjectOverview, isFullBriefUnlocked } from '@/lib/db/projects';
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

  try {
    await requirePaidSession();
  } catch (error) {
    if (error instanceof PaidPlanRequiredError) {
      const next = projectId
        ? `/audit/${projectId}/connect`
        : safeReturnTo;
      if (error.status === 401) {
        return NextResponse.redirect(
          new URL(`/login?next=${encodeURIComponent(next)}`, request.url)
        );
      }
      if (projectId) {
        return NextResponse.redirect(
          new URL(`/audit/${projectId}/connect?upgrade=1`, request.url)
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    throw error;
  }

  if (projectId) {
    const project = await getProjectOverview(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }
    if (!isFullBriefUnlocked(project)) {
      return NextResponse.redirect(new URL(`/audit/${projectId}/connect`, request.url));
    }
  }

  const state = Buffer.from(
    JSON.stringify({
      projectId: projectId ?? null,
      returnTo: safeReturnTo,
    })
  ).toString('base64url');
  const url = getGoogleAuthUrl(state, request);
  return NextResponse.redirect(url);
}
