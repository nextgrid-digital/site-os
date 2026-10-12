import { cookies } from 'next/headers';
import { getAppUrl } from '@/lib/app-url';
import { getSessionPlan } from '@/lib/db/profiles';
import { getBillingProvider } from '@/lib/billing';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan?: string };

    if (!plan || !['full', 'sprint', 'retainer'].includes(plan)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const provider = getBillingProvider();
    if (!provider) {
      return Response.json(
        { error: 'Billing provider not configured' },
        { status: 503 }
      );
    }

    const appUrl = getAppUrl(request);
    const session = await getSessionPlan();

    // If already paid, redirect to portal instead
    if (session.plan === 'paid' && plan === 'full') {
      // For now, just return error. In future, could redirect to portal.
      return Response.json(
        { error: 'Already on paid plan' },
        { status: 400 }
      );
    }

    const checkoutSession = await provider.createCheckoutSession({
      userId: user.id,
      email: user.email,
      plan: plan as 'full' | 'sprint' | 'retainer',
      successUrl: `${appUrl}/account/billing?success=1`,
      cancelUrl: `${appUrl}/account/billing?cancelled=1`,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[billing/checkout]', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
