import { EvidenceTable } from '@/components/operator/report/evidence-table';
import { SectionFrame } from '@/components/operator/report/section-frame';
import type { CommercialGraphBriefSlice } from '@/lib/graph/types';

function rowsFrom(label: string, items: string[]): Array<[string, string]> {
  if (items.length === 0) return [[label, 'None detected']];
  return items.slice(0, 8).map((item) => [label, item]);
}

export function RelationshipHealth({
  health,
}: {
  health: CommercialGraphBriefSlice['relationshipHealth'];
}) {
  const rows = [
    ...rowsFrom('Claims without proof', health.claimsWithoutProof),
    ...rowsFrom('Use cases without page', health.useCasesWithoutPage),
    ...rowsFrom('ICPs without page', health.icpsWithoutPage),
    ...rowsFrom('Queries without answer', health.queriesWithoutAnswer),
    ...rowsFrom('CTAs disconnected', health.ctasDisconnected),
    ...rowsFrom('Offers without page', health.offersWithoutPage),
    ...rowsFrom('Traffic pages weak proof', health.pagesWithTrafficWeakProof),
    ...rowsFrom('Pages that should link', health.pagesThatShouldLink),
  ];

  return (
    <SectionFrame id="relationship-health" title="Relationship health">
      <SectionFrame.Visual>
        <EvidenceTable columns={['Category', 'Issue']} rows={rows} />
      </SectionFrame.Visual>
      <SectionFrame.Interpretation>
        <p>Weak or missing edges between commercial nodes — not just isolated page errors.</p>
      </SectionFrame.Interpretation>
      <SectionFrame.Action>
        <p>Prioritize unproven claims and ICP/offer pages with no destination URL.</p>
      </SectionFrame.Action>
    </SectionFrame>
  );
}
