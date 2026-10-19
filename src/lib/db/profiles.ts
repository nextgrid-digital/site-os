import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

async function fetchProfile(userId: string): Promise<{ isAdmin: boolean }> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .maybeSingle();
  return {
    isAdmin: data?.is_admin === true,
  };
}

/** Resolve the signed-in user's id, email and admin status. */
export async function getSessionUser(): Promise<{
  userId: string | null;
  email: string | null;
  signedIn: boolean;
  isAdmin: boolean;
}> {
  const cookieStore = await cookies();
  const auth = createClient(cookieStore);
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return {
      userId: null,
      email: null,
      signedIn: false,
      isAdmin: false,
    };
  }

  const { isAdmin } = await fetchProfile(user.id);

  return {
    userId: user.id,
    email: user.email ?? null,
    signedIn: true,
    isAdmin,
  };
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

export class AdminRequiredError extends Error {
  status: number;

  constructor(message = 'Admin access required.', status = 403) {
    super(message);
    this.name = 'AdminRequiredError';
    this.status = status;
  }
}

/** Throws AdminRequiredError unless the signed-in user is an admin. */
export async function requireAdminSession() {
  const session = await getSessionUser();
  if (!session.signedIn || !session.userId) {
    throw new AdminRequiredError('Sign in to continue.', 401);
  }
  if (!session.isAdmin) {
    throw new AdminRequiredError();
  }
  return session;
}
