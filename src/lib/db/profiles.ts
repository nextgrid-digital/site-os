import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export type UserPlan = 'free' | 'paid';

/**
 * Site-OS is fully free: every signed-in user is treated as paid.
 * The profiles.plan column remains for future billing but is ignored.
 */
export async function getUserPlan(_userId: string): Promise<UserPlan> {
  return 'paid';
}

export async function isPaidUser(_userId: string): Promise<boolean> {
  return true;
}

/** Resolve the signed-in user. Signed-in users always have isPaid=true. */
export async function getSessionPlan(): Promise<{
  userId: string | null;
  email: string | null;
  plan: UserPlan;
  signedIn: boolean;
  isPaid: boolean;
}> {
  const cookieStore = await cookies();
  const auth = createClient(cookieStore);
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return { userId: null, email: null, plan: 'free', signedIn: false, isPaid: false };
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    plan: 'paid',
    signedIn: true,
    isPaid: true,
  };
}

export class PaidPlanRequiredError extends Error {
  status: number;

  constructor(message = 'Sign in to unlock connected Search Console and GA4.', status = 403) {
    super(message);
    this.name = 'PaidPlanRequiredError';
    this.status = status;
  }
}

/** Throws PaidPlanRequiredError unless the user is signed in. */
export async function requirePaidSession() {
  const session = await getSessionPlan();
  if (!session.signedIn || !session.userId) {
    throw new PaidPlanRequiredError('Sign in to continue.', 401);
  }
  return session;
}
