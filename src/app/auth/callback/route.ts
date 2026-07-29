import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';
import { unlockAuditSession } from '@/lib/db/audit-sessions';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const cookieStore = await cookies();
  const sessionId =
    url.searchParams.get('sessionId') || cookieStore.get(AUDIT_SESSION_COOKIE)?.value || null;
  const next = sessionId
    ? `/app?session=${encodeURIComponent(sessionId)}`
    : '/app';
  const fail = new URL(
    `/login?error=auth${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ''}`,
    url.origin
  );

  if (!code) {
    return NextResponse.redirect(fail);
  }

  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(fail);
  }

  if (sessionId && data.user.email) {
    try {
      await unlockAuditSession(sessionId, {
        userId: data.user.id,
        email: data.user.email,
      });
    } catch {
      // page will unlock if signed in
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
