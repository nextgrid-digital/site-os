import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/operator/:path*',
    '/api/google/:path*',
    '/audit/:path*',
    '/app',
    '/app/:path*',
    '/auth/:path*',
    '/login',
    '/api/auth/:path*',
  ],
};
