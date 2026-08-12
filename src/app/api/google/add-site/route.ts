import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';
import { addSiteFromGoogleInventory } from '@/lib/db/google-inventory';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const auth = createClient(cookieStore);
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const gscSiteUrl = typeof body.gscSiteUrl === 'string' ? body.gscSiteUrl.trim() : '';
    if (!gscSiteUrl) {
      return NextResponse.json({ error: 'gscSiteUrl is required.' }, { status: 400 });
    }

    const result = await addSiteFromGoogleInventory({
      gscSiteUrl,
      userId: user.id,
      email: user.email,
      ga4PropertyId: typeof body.ga4PropertyId === 'string' ? body.ga4PropertyId : null,
      adsCustomerId: typeof body.adsCustomerId === 'string' ? body.adsCustomerId : null,
    });

    const response = NextResponse.json(result);
    response.cookies.set(AUDIT_SESSION_COOKIE, result.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add site.' },
      { status: 500 }
    );
  }
}
