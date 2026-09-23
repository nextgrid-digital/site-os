import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';
import { unlockAuditSession } from '@/lib/db/audit-sessions';
import { claimProjectOwnership } from '@/lib/db/projects';
import { fetchWithSupabaseRetry } from '@/lib/supabase/fetch-retry';

const UPDATE_PASSWORD_PATH = '/auth/update-password';

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const cookieStore = await cookies();
  const sessionId =
    url.searchParams.get('sessionId') || cookieStore.get(AUDIT_SESSION_COOKIE)?.value || null;
  const nextParam = safeNextPath(url.searchParams.get('next'));
  const isRecovery =
    url.searchParams.get('type') === 'recovery' || nextParam === UPDATE_PASSWORD_PATH;
  const defaultNext = sessionId
    ? `/app?session=${encodeURIComponent(sessionId)}`
    : '/app';
  const next = isRecovery ? UPDATE_PASSWORD_PATH : (nextParam ?? defaultNext);
  const fail = new URL(
    `/login?error=auth${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ''}`,
    url.origin
  );

  if (!code) {
    return NextResponse.redirect(fail);
  }

  // Build redirect first so session cookies are attached to this response
  // (cookies().set alone is not reliably sent with a separate redirect).
  let redirectResponse = NextResponse.redirect(new URL(next, url.origin));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    global: {
      fetch: fetchWithSupabaseRetry,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Route Handler may already be streaming; response cookies below are enough.
          }
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(fail);
  }

  if (sessionId && data.user.email) {
    try {
      const unlocked = await unlockAuditSession(sessionId, {
        userId: data.user.id,
        email: data.user.email,
      });
      await claimProjectOwnership(unlocked.project_id, data.user.id);
    } catch {
      // page will unlock if signed in
    }
  }

  return redirectResponse;
}
