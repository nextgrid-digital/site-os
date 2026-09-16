export interface CheckoutSessionParams {
  userId: string;
  email: string;
  plan: 'full' | 'sprint' | 'retainer';
  successUrl: string;
  cancelUrl: string;
}

export interface PortalSessionParams {
  userId: string;
  email: string;
  returnUrl: string;
}

export interface BillingProvider {
  createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string }>;
  createPortalSession(params: PortalSessionParams): Promise<{ url: string }>;
}
