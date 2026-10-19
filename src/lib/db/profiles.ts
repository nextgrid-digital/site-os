import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

/** Resolve the signed-in user's id and email. */
export async function getSessionUser(): Promise<{
  userId: string | null;
  email: string | null;
  signedIn: boolean;
}> {
  const cookieStore = await cookies();
  const auth = createClient(cookieStore);
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return { userId: null, email: null, signedIn: false };
  }

  return { userId: user.id, email: user.email ?? null, signedIn: true };
}

export class SessionRequiredError extends Error {
  status: number;

  constructor(message = 'Sign in to continue.', status = 401) {
    super(message);
    this.name = 'SessionRequiredError';
    this.status = status;
  }
}

/** Throws SessionRequiredError unless the user is signed in. */
export async function requireSignedInSession() {
  const session = await getSessionUser();
  if (!session.signedIn || !session.userId) {
    throw new SessionRequiredError('Sign in to continue.', 401);
  }
  return session;
}
