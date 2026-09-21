import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

/**
 * Paddle webhook handler for payment events.
 * Verifies webhook signature and updates user plan on successful payment.
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get('paddle-signature');
    const body = await request.text();

    // Verify webhook signature
    if (!verifyPaddleWebhook(body, signature)) {
      console.error('[billing/webhook] Invalid signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    console.log(`[billing/webhook] Event: ${type}`, { customData: data.custom_data });

    // Handle payment.completed events
    if (type === 'payment.completed') {
      const userId = data.custom_data?.user_id;
      if (!userId) {
        console.warn('[billing/webhook] No user_id in custom_data');
        return Response.json({ ok: true }); // Don't fail, Paddle will retry
      }

      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      // Update user plan to 'paid'
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'paid' })
        .eq('user_id', userId);

      if (error) {
        console.error('[billing/webhook] Failed to update profile:', error);
        // Return 500 so Paddle retries
        return Response.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      console.log(`[billing/webhook] Updated user ${userId} to plan=paid`);
    }

    // Handle payment.failed events (log for monitoring)
    if (type === 'payment.failed') {
      const userId = data.custom_data?.user_id;
      console.warn(`[billing/webhook] Payment failed for user ${userId}:`, data.error);
    }

    // Always return 200 to acknowledge receipt
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[billing/webhook] Error:', error);
    // Return 500 so Paddle retries on error
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Verify Paddle webhook signature using HMAC-SHA256.
 * Paddle signs the request body with a shared secret.
 */
function verifyPaddleWebhook(body: string, signature: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  // Paddle signs the raw body + secret
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  // Compare with provided signature (constant-time comparison)
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
