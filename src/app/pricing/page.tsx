import Link from 'next/link';
import { Check } from 'lucide-react';
import { TIERS } from '@/lib/audit/pricing';
import { SITE_CONTENT_CLASS } from '@/components/audit/site-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Pricing | Site-OS',
  description: 'Choose the right audit plan for your business. From free site audits to full implementation sprints.',
};

export default function PricingPage() {
  const tiers = Object.values(TIERS);

  return (
    <div className={`${SITE_CONTENT_CLASS} py-16`}>
      <Link href="/" className="inline-block text-sm text-muted-foreground transition hover:text-foreground">
        ← Back to Site-OS
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the plan that fits your needs. Start free, upgrade when you need connected data.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Card key={tier.tier} className="relative flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{tier.tier}</CardTitle>
              <div className="mt-2 text-2xl font-bold">{tier.price}</div>
              {tier.tier === 'Site audit' && (
                <div className="text-xs text-emerald-600 font-medium">Free forever</div>
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
                {tier.tier === 'Site audit' ? (
                  <Link href="/login?next=/app" className="block">
                    <Button className="w-full" variant="outline">
                      Get started
                    </Button>
                  </Link>
                ) : tier.price === 'Custom quote' || tier.price === 'Custom monthly' ? (
                  <a href="mailto:support@site-os.app" className="block">
                    <Button className="w-full" variant="outline">
                      Contact sales
                    </Button>
                  </a>
                ) : (
                  <Link href="/login?next=/app" className="block">
                    <Button className="w-full">
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-muted/50 p-6">
        <h2 className="font-semibold">Questions?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Reach out to{' '}
          <a href="mailto:support@site-os.app" className="font-medium text-foreground hover:underline">
            support@site-os.app
          </a>{' '}
          for custom pricing, enterprise features, or implementation questions.
        </p>
      </div>
    </div>
  );
}
