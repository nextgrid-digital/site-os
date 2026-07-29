import { NextResponse } from 'next/server';
import { verifyAccessCode } from '@/lib/db/client-access';

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  if (!email || !code) {
    return NextResponse.json({ error: 'email and code are required' }, { status: 400 });
  }

  const verified = await verifyAccessCode(email, code);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  return NextResponse.json({
    projectId: verified.project_id,
    verified: true,
  });
}
