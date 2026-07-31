import { notFound } from 'next/navigation';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
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

export default async function AuditPricingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const workspace = await getProjectWorkspace(resolved.projectId);
  if (!workspace) notFound();
  const pricing = workspace.audit?.pricing;

  return (
    <AuditWorkspacePanel
      title="Pricing"
      description="Recommended package based on finding severity and architecture gaps."
    >
      {pricing ? (
        <AuditWorkspaceCard>
          <p className="text-sm text-zinc-500">Recommended for this audit</p>
          <p className="mt-1 text-xl font-semibold text-zinc-950">
            {pricing.recommended_tier} · {pricing.price_range}
          </p>
          <p className="mt-3 text-sm text-zinc-500">{pricing.rationale}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {pricing.included_items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AuditWorkspaceCard>
      ) : (
        <AuditWorkspaceCard>
          <p className="font-medium text-zinc-950">No pricing recommendation yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Run an audit to generate a package recommendation.
          </p>
        </AuditWorkspaceCard>
      )}

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <AuditWorkspaceCard key={tier.tier}>
            <p className="font-medium text-zinc-950">{tier.tier}</p>
            <p className="mt-1 text-sm text-zinc-500">{tier.price}</p>
            <p className="mt-3 text-sm text-zinc-500">{tier.description}</p>
          </AuditWorkspaceCard>
        ))}
      </section>
    </AuditWorkspacePanel>
  );
}
