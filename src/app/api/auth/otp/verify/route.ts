import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { unlockAuditSession } from '@/lib/db/audit-sessions';
import { claimProjectOwnership } from '@/lib/db/projects';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const token = typeof body.token === 'string' ? body.token.replace(/\s+/g, '') : '';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

  if (!email || !email.includes('@') || !/^\d{6,8}$/.test(token)) {
    return NextResponse.json({ error: 'Enter the code from your email' }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipLimit = rateLimit(`otp-verify:ip:${ip}`, 30, 15 * 60 * 1000);
  if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfterMs);
  const emailLimit = rateLimit(`otp-verify:email:${email}`, 8, 15 * 60 * 1000);
  if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfterMs);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

  if (error || !data.user) {
    return NextResponse.json(
      { error: 'That code is invalid or has expired. Request a new one.' },
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
