import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { unlockAuditSession } from '@/lib/db/audit-sessions';
import { claimProjectOwnership } from '@/lib/db/projects';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

  if (!email || !email.includes('@') || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipLimit = rateLimit(`signup:ip:${ip}`, 8, 15 * 60 * 1000);
  if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfterMs);
  const emailLimit = rateLimit(`signup:email:${email}`, 5, 60 * 60 * 1000);
  if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfterMs);

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
      const unlocked = await unlockAuditSession(sessionId, {
        userId: data.user.id,
        email: data.user.email ?? email,
      });
      await claimProjectOwnership(unlocked.project_id, data.user.id);
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
