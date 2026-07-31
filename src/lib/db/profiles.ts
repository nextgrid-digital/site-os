import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

export type UserPlan = 'free' | 'paid';

function planFromRow(plan: string | null | undefined): UserPlan {
  return plan === 'paid' ? 'paid' : 'free';
}

/**
 * Resolve a user's plan. Prefer the signed-in cookie client (RLS: read own)
 * so this works without SUPABASE_SERVICE_ROLE_KEY. Admin is only a fallback
 * for cross-user lookups.
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const cookieStore = await cookies();
  const auth = createClient(cookieStore);
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (user?.id === userId) {
    const { data } = await auth
      .from('profiles')
      .select('plan')
      .eq('user_id', userId)
      .maybeSingle();
    return planFromRow(data?.plan);
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle();
  return planFromRow(data?.plan);
}

export async function isPaidUser(userId: string): Promise<boolean> {
  return (await getUserPlan(userId)) === 'paid';
}

/** Resolve the signed-in user and whether they have plan=paid. */
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

  const { data } = await auth
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle();
  const plan = planFromRow(data?.plan);

  return {
    userId: user.id,
    email: user.email ?? null,
    plan,
    signedIn: true,
    isPaid: plan === 'paid',
  };
}

export class PaidPlanRequiredError extends Error {
  status: number;

  constructor(message = 'A paid plan is required to unlock connected Search Console and GA4.', status = 403) {
    super(message);
    this.name = 'PaidPlanRequiredError';
    this.status = status;
  }
}

/** Throws PaidPlanRequiredError unless the session user has plan=paid. */
export async function requirePaidSession() {
  const session = await getSessionPlan();
  if (!session.signedIn || !session.userId) {
    throw new PaidPlanRequiredError('Sign in with a paid account to continue.', 401);
  }
  if (!session.isPaid) {
    throw new PaidPlanRequiredError();
  }
  return session;
}
