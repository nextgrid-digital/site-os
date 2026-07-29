import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { unlockAuditSession } from '@/lib/db/audit-sessions';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

  if (!email || !email.includes('@') || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If email confirmation is still required, there may be no session yet.
  if (!data.session || !data.user) {
    return NextResponse.json(
      {
        error:
          'Account created, but email confirmation is required. Disable “Confirm email” in Supabase Auth, or confirm your email then sign in.',
      },
      { status: 400 }
    );
  }

  if (sessionId) {
    try {
      await unlockAuditSession(sessionId, {
        userId: data.user.id,
        email: data.user.email ?? email,
      });
    } catch (unlockError) {
      return NextResponse.json(
        { error: unlockError instanceof Error ? unlockError.message : 'Failed to unlock session' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    userId: data.user.id,
    email: data.user.email ?? email,
    sessionId: sessionId || null,
  });
}
