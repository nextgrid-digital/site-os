import { notFound } from 'next/navigation';
import { OperatorCard } from '@/components/operator/operator-card';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { getProjectWorkspace } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

const pricingTiers = [
  {
    tier: 'Site audit',
    price: '$0',
    description:
      'Business context, crawl observations, buyer moments, architecture gaps, scorecard, and top priority fixes.',
  },
  {
    tier: 'Full audit',
    price: '~$700',
    description:
      'Search Console and GA4 evidence, scored priority stack, AEO understanding, execution briefs, and sprint recommendation.',
  },
  {
    tier: 'Implementation sprint',
    price: 'Custom quote',
    description: 'Execute top full-audit findings across rewrites, linking, and FAQ upgrades.',
  },
  {
    tier: 'Monthly monitoring / retainer',
    price: 'Custom monthly',
    description: 'Ongoing audit refresh and opportunity tracking.',
  },
  {
    tier: 'Custom plan',
    price: 'Scoped',
    description: 'Tailored scope for complex sites or multi-property programs.',
  },
];

export default async function PricingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) notFound();
  const pricing = workspace.audit?.pricing;

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Pricing"
        title={workspace.project.name}
        description="Recommended package based on finding severity and architecture gaps."
      />

      {pricing ? (
        <OperatorCard className="border-white/12 bg-white/5">
          <p className="text-sm text-muted-foreground">Recommended for this audit</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {pricing.recommended_tier} · {pricing.price_range}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{pricing.rationale}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {pricing.included_items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </OperatorCard>
      ) : (
        <OperatorCard>
          <p className="font-medium text-foreground">No pricing recommendation yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run an audit to generate a package recommendation.
          </p>
        </OperatorCard>
      )}

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <OperatorCard key={tier.tier}>
            <p className="font-medium text-foreground">{tier.tier}</p>
            <p className="mt-1 text-sm text-muted-foreground">{tier.price}</p>
            <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
          </OperatorCard>
        ))}
      </section>
    </OperatorShell>
  );
}
