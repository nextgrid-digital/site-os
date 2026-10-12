import type { BillingProvider } from './types';
import { getPaddleProvider } from './paddle';

/**
 * Returns the configured billing provider (Paddle, Razorpay, Dodo, or null).
 * Currently wired to Paddle. Requires:
 * - PADDLE_API_KEY environment variable
 * - PADDLE_PRICE_ID_FULL, PADDLE_PRICE_ID_SPRINT, PADDLE_PRICE_ID_RETAINER
 * - NEXT_PUBLIC_PADDLE_CLIENT_TOKEN for frontend checkout
 */
export function getBillingProvider(): BillingProvider | null {
  return getPaddleProvider();
}

export type { BillingProvider, CheckoutSessionParams, PortalSessionParams } from './types';
