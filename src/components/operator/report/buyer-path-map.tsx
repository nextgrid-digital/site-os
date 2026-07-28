import { EvidenceTable } from '@/components/operator/report/evidence-table';
import { SectionFrame } from '@/components/operator/report/section-frame';
import type { CommercialGraphBriefSlice } from '@/lib/graph/types';

export function BuyerPathMap({ paths }: { paths: CommercialGraphBriefSlice['topPaths'] }) {
  if (paths.length === 0) return null;

  return (
    <SectionFrame id="buyer-path-map" title="Buyer path map">
      <SectionFrame.Visual>
        <EvidenceTable
          columns={['Query', 'Moment', 'Page', 'Offer', 'Proof', 'CTA', 'Missing']}
          rows={paths.map((path) => [
            path.queryLabel ?? '—',
            path.buyerMoment ?? '—',
            path.pageLabel ?? '—',
            path.offerLabel ?? '—',
            path.proofLabel ?? '—',
            path.ctaLabel ?? '—',
            path.missingSteps.length > 0 ? path.missingSteps.join(', ') : 'none',
          ])}
        />
      </SectionFrame.Visual>
      <SectionFrame.Interpretation>
        <p>
          Query → Buyer Moment → Page → Offer → Proof → CTA. Missing steps block commercial
          conversion paths.
        </p>
      </SectionFrame.Interpretation>
      <SectionFrame.Action>
        <p>Close the highest-impression paths with missing pages or CTAs first.</p>
      </SectionFrame.Action>
    </SectionFrame>
  );
}
