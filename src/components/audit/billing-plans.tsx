import { Check } from 'lucide-react';
import { TIERS, type ServiceTier } from '@/lib/audit/pricing';
import { getBillingProvider } from '@/lib/billing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BillingPlansProps {
  currentPlan: 'free' | 'paid';
}

export function BillingPlans({ currentPlan }: BillingPlansProps) {
  const provider = getBillingProvider();
  const tiers = Object.values(TIERS) as ServiceTier[];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {tiers.map((tier) => {
        const isCurrent = currentPlan === 'free' && tier.tier === 'Site audit';
        const isCustomQuote = tier.price === 'Custom quote' || tier.price === 'Custom monthly';

        return (
          <Card key={tier.tier} className="relative flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{tier.tier}</CardTitle>
              <div className="mt-2 text-2xl font-bold">{tier.price}</div>
              {isCurrent && <div className="text-xs text-emerald-600 font-medium">Current plan</div>}
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
                ) : isCustomQuote ? (
                  <a href="mailto:support@site-os.app" className="block">
                    <Button className="w-full" variant="outline">
                      Contact sales
                    </Button>
                  </a>
                ) : provider ? (
                  <Button className="w-full" disabled title="Checkout coming soon">
                    Upgrade
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    disabled
                    title="Billing provider not yet selected. Check back soon!"
                  >
                    Coming soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
