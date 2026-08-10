import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const SUCCESS_MESSAGE =
  'If an account exists for that email, a reset link is on the way.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/auth/update-password')}`,
  });

  if (error) {
    // Still return a generic success body to avoid account enumeration,
    // but log-level failures that are clearly config/rate-limit can surface a soft error.
    console.error('[forgot-password]', error.message);
  }

  return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
}
