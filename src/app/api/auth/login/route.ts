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

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Sign in failed' }, { status: 400 });
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
