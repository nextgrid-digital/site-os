import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export type UserPlan = 'free' | 'paid';

async function fetchProfile(userId: string): Promise<{ plan: UserPlan; isAdmin: boolean }> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('plan, is_admin')
    .eq('user_id', userId)
    .maybeSingle();
  return {
    plan: data?.plan === 'paid' ? 'paid' : 'free',
    isAdmin: data?.is_admin === true,
  };
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const { plan } = await fetchProfile(userId);
  return plan;
}

export async function isPaidUser(userId: string): Promise<boolean> {
  const { plan } = await fetchProfile(userId);
  return plan === 'paid';
}

/** Resolve the signed-in user's real plan and admin status from `profiles`. */
export async function getSessionPlan(): Promise<{
  userId: string | null;
  email: string | null;
  plan: UserPlan;
  signedIn: boolean;
  isPaid: boolean;
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
      plan: 'free',
      signedIn: false,
      isPaid: false,
      isAdmin: false,
    };
  }

  const { plan, isAdmin } = await fetchProfile(user.id);

  return {
    userId: user.id,
    email: user.email ?? null,
    plan,
    signedIn: true,
    isPaid: plan === 'paid',
    isAdmin,
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

/** Throws PaidPlanRequiredError unless the user is signed in and on the paid plan
 *  (or is an admin acting on a client's behalf). */
export async function requirePaidSession() {
  const session = await getSessionPlan();
  if (!session.signedIn || !session.userId) {
    throw new PaidPlanRequiredError('Sign in to continue.', 401);
  }
  if (!session.isPaid && !session.isAdmin) {
    throw new PaidPlanRequiredError(
      'Upgrade to a full audit to connect Google Search Console, GA4, and Ads.',
      403
    );
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
  const session = await getSessionPlan();
  if (!session.signedIn || !session.userId) {
    throw new AdminRequiredError('Sign in to continue.', 401);
  }
  if (!session.isAdmin) {
    throw new AdminRequiredError();
  }
  return session;
}
