import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  const dest =
    typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return NextResponse.redirect(new URL(dest, request.url));
}
