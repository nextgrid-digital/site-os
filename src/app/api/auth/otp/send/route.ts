import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  if (body.ageConfirmed !== true) {
    return NextResponse.json(
      { error: 'You must confirm that you are 18 or older to use Site-OS.' },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const ipLimit = rateLimit(`otp-send:ip:${ip}`, 15, 60 * 60 * 1000);
  if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfterMs);
  const emailLimit = rateLimit(`otp-send:email:${email}`, 5, 60 * 60 * 1000);
  if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfterMs);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error('[otp-send]', error.message);
    return NextResponse.json(
      { error: 'Could not send a code. Please try again in a moment.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
