import type { BillingProvider, CheckoutSessionParams, PortalSessionParams } from './types';

/**
 * Paddle payment provider implementation.
 * Uses Paddle's Billing API for checkout and customer portal.
 */
export class PaddleProvider implements BillingProvider {
  private apiKey: string;
  private apiUrl = 'https://api.paddle.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string }> {
    // Map our internal plan names to Paddle price IDs
    const priceIdMap: Record<string, string> = {
      full: process.env.PADDLE_PRICE_ID_FULL || '',
      sprint: process.env.PADDLE_PRICE_ID_SPRINT || '',
      retainer: process.env.PADDLE_PRICE_ID_RETAINER || '',
    };

    const priceId = priceIdMap[params.plan];
    if (!priceId) {
      throw new Error(`No Paddle price ID configured for plan: ${params.plan}`);
    }

    const response = await fetch(`${this.apiUrl}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        customer_email: params.email,
        custom_data: {
          user_id: params.userId,
        },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Paddle checkout failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return { url: data.url };
  }

  async createPortalSession(params: PortalSessionParams): Promise<{ url: string }> {
    const response = await fetch(`${this.apiUrl}/customers/portal-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        customer_id: params.userId, // This assumes Paddle customer ID is stored as user ID
        return_url: params.returnUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Paddle portal session failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return { url: data.url };
  }
}

export function getPaddleProvider(): PaddleProvider | null {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) return null;
  return new PaddleProvider(apiKey);
}
