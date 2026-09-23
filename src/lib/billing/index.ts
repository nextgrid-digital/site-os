import type { BillingProvider } from './types';

/**
 * Returns the configured billing provider (Paddle, Razorpay, Dodo, or null).
 * Currently returns null — will be wired to the chosen provider once:
 * (1) provider is selected via POC evaluation
 * (2) SDK is installed and env vars configured
 * (3) checkout and webhook routes are implemented
 */
export function getBillingProvider(): BillingProvider | null {
  return null;
}
