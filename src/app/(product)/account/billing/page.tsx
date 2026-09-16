import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionPlan } from '@/lib/db/profiles';
import { BillingPlans } from '@/components/audit/billing-plans';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account/billing');
  }

  const session = await getSessionPlan();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Current plan: <span className="font-medium text-foreground">{session.plan === 'paid' ? 'Paid' : 'Free'}</span>
        </p>
      </div>
      <BillingPlans currentPlan={session.plan} />
    </div>
  );
}
