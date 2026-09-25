'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { TIERS, type ServiceTier } from '@/lib/audit/pricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BillingPlansProps {
  currentPlan: 'free' | 'paid';
}

export function BillingPlans({ currentPlan }: BillingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Only 2 tiers: Free (Site audit) and Full Audit
  const tiers = [TIERS.teaser, TIERS.brief] as ServiceTier[];

  async function handleUpgrade(planKey: string) {
    setError(null);
    setLoading(planKey);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Checkout failed');
        return;
      }

      // Redirect to Paddle checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  }

  // Map tier names to plan keys for API
  const tierPlanMap: Record<string, string> = {
    'Site audit': 'free',
    'Full audit': 'full',
    'Implementation sprint': 'sprint',
    'Monthly monitoring / retainer': 'retainer',
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const isCurrent = currentPlan === 'free' && tier.tier === 'Site audit';
          const planKey = tierPlanMap[tier.tier] || '';
          const isLoading = loading === planKey;

          return (
            <Card key={tier.tier} className="relative flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{tier.tier}</CardTitle>
                <div className="mt-2 text-2xl font-bold">{tier.price}</div>
                {isCurrent && (
                  <div className="text-xs text-emerald-600 font-medium">Current plan</div>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-6">
                <ul className="space-y-3 flex-1">
                  {tier.items.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <Check className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {isCurrent ? (
                    <Button disabled className="w-full" variant="outline">
                      Current plan
                    </Button>
                  ) : tier.tier === 'Full audit' ? (
                    <Button
                      className="w-full"
                      onClick={() => void handleUpgrade('full')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Upgrade to $700'}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
