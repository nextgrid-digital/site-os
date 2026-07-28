import { EvidenceTable } from '@/components/operator/report/evidence-table';
import { SectionFrame } from '@/components/operator/report/section-frame';
import { StatCards } from '@/components/operator/report/stat-cards';
import type {
  CommercialGraphBriefSlice,
  ProgrammaticAeoFlags,
  ProgrammaticUniqueData,
} from '@/lib/graph/types';

type OpportunityRow = CommercialGraphBriefSlice['topOpportunities'][number];

const EMPTY_UNIQUE: ProgrammaticUniqueData = {
  whatMakesUnique: '—',
  realDataNeeded: '—',
  proofNeeded: '—',
  doNotTemplate: 'Do not invent proof or thin template clones.',
};

const EMPTY_AEO: ProgrammaticAeoFlags = {
  improvesAnswerability: false,
  improvesEntityClarity: false,
  improvesCitationReadiness: false,
  improvesAiOverview: false,
};

function num(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Normalize legacy snapshot rows that lack the programmatic opportunity layer fields. */
function normalizeOpportunity(opp: OpportunityRow): OpportunityRow {
  const uniqueFromLegacy =
    !opp.uniqueData && typeof opp.uniqueDataNeeded === 'string' && opp.uniqueDataNeeded.trim()
      ? {
          whatMakesUnique: opp.uniqueDataNeeded,
          realDataNeeded: opp.uniqueDataNeeded,
          proofNeeded: 'Relevant proof if available',
          doNotTemplate: 'Do not invent proof or thin template clones.',
        }
      : null;

  return {
    ...opp,
    patternFamily: opp.patternFamily ?? 'use_case',
    firstRecommendedPages: opp.firstRecommendedPages ?? [],
    uniqueData: opp.uniqueData ?? uniqueFromLegacy ?? EMPTY_UNIQUE,
    uniqueDataNeeded: opp.uniqueDataNeeded ?? '',
    searchDemand: num(opp.searchDemand),
    buyerIntent: num(opp.buyerIntent),
    aiCitationValue: num(opp.aiCitationValue),
    easeOfProduction: num(opp.easeOfProduction),
    uniquenessRequirement: num(opp.uniquenessRequirement),
    revenueImpact: num(opp.revenueImpact),
    thinContentRisk: num(opp.thinContentRisk),
    linkedGapTypes: opp.linkedGapTypes ?? [],
    linkedEntityLabels: opp.linkedEntityLabels ?? [],
    buyerPathSummary: opp.buyerPathSummary ?? '—',
    aeoFlags: opp.aeoFlags ?? EMPTY_AEO,
    strategySummary: opp.strategySummary ?? opp.whyFits ?? '',
    risksIfBad: opp.risksIfBad ?? '',
    expectedBenefit: opp.expectedBenefit ?? '',
    agentPrompt: opp.agentPrompt ?? '',
    priorityScore: num(opp.priorityScore),
    confidence: num(opp.confidence, 50),
  };
}

export function ProgrammaticOpportunityCards({
  opportunities,
}: {
  opportunities: CommercialGraphBriefSlice['topOpportunities'];
}) {
  if (opportunities.length === 0) return null;

  const rows = opportunities.map(normalizeOpportunity);

  const avgAi = Math.round(
    rows.reduce((sum, o) => sum + o.aiCitationValue, 0) / rows.length
  );
  const thinWarnings = rows.filter((o) => o.thinContentRisk >= 60).length;
  const topFamily = rows[0]?.patternFamily ?? '—';

  return (
    <SectionFrame id="programmatic-opportunity-map" title="Page Plays">
      <SectionFrame.Visual>
        <div className="not-typeset space-y-4">
          <p className="text-sm text-white/65">
            Scalable pages that create more buyer conversations and leads — grounded in this
            project&apos;s lead map, queries, and intake.
          </p>
          <StatCards
            items={[
              { label: 'Plays', value: rows.length },
              { label: 'Top family', value: String(topFamily).replace('_', ' ') },
              { label: 'Avg AI value', value: avgAi },
              { label: 'Thin-risk flags', value: thinWarnings },
            ]}
          />
          <EvidenceTable
            columns={[
              'Family',
              'Template',
              'Demand',
              'Intent',
              'AI',
              'Thin risk',
              'Priority',
              'Conf',
            ]}
            rows={rows.map((o) => [
              o.patternFamily,
              o.exampleTemplate,
              o.searchDemand,
              o.buyerIntent,
              o.aiCitationValue,
              o.thinContentRisk,
              o.priority,
              o.confidence,
            ])}
          />
          {rows.map((opp) => (
            <details
              key={`${opp.patternFamily}-${opp.patternName}`}
              className="rounded-lg border border-white/8 bg-black/20 p-3"
            >
              <summary className="cursor-pointer text-sm font-medium text-white">
                {opp.patternName}
                <span className="ml-2 text-xs font-normal text-white/45">
                  {opp.patternFamily} · {opp.priority}
                </span>
              </summary>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <p>{opp.whyFits}</p>
                {opp.strategySummary ? (
                  <p>
                    <span className="text-white/40">Strategy: </span>
                    {opp.strategySummary}
                  </p>
                ) : null}
                {opp.buyerPathSummary && opp.buyerPathSummary !== '—' ? (
                  <p>
                    <span className="text-white/40">Buyer path: </span>
                    {opp.buyerPathSummary}
                  </p>
                ) : null}
                {opp.firstRecommendedPages.length > 0 ? (
                  <p>
                    <span className="text-white/40">First pages: </span>
                    {opp.firstRecommendedPages.slice(0, 8).join('; ')}
                  </p>
                ) : null}
                <div className="rounded border border-white/8 bg-black/30 p-2 text-xs leading-5">
                  <p>
                    <span className="text-white/40">Unique: </span>
                    {opp.uniqueData.whatMakesUnique}
                  </p>
                  <p>
                    <span className="text-white/40">Real data: </span>
                    {opp.uniqueData.realDataNeeded}
                  </p>
                  <p>
                    <span className="text-white/40">Proof: </span>
                    {opp.uniqueData.proofNeeded}
                  </p>
                  <p>
                    <span className="text-white/40">Do not template: </span>
                    {opp.uniqueData.doNotTemplate}
                  </p>
                </div>
                <p className="text-xs text-white/50">
                  AEO:{' '}
                  {[
                    opp.aeoFlags.improvesAnswerability ? 'answerability' : null,
                    opp.aeoFlags.improvesEntityClarity ? 'entity clarity' : null,
                    opp.aeoFlags.improvesCitationReadiness ? 'citation' : null,
                    opp.aeoFlags.improvesAiOverview ? 'AI overview' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'limited'}
                </p>
                {opp.risksIfBad ? (
                  <p>
                    <span className="text-white/40">Risks: </span>
                    {opp.risksIfBad}
                  </p>
                ) : null}
                {opp.expectedBenefit ? (
                  <p>
                    <span className="text-white/40">Benefit: </span>
                    {opp.expectedBenefit}
                  </p>
                ) : null}
                {opp.linkedGapTypes.length > 0 ? (
                  <p className="text-xs text-white/45">
                    Graph gaps: {opp.linkedGapTypes.join(', ')}
                  </p>
                ) : null}
                {opp.agentPrompt ? (
                  <pre className="overflow-x-auto rounded border border-white/10 bg-black/40 p-3 text-xs leading-5 whitespace-pre-wrap">
                    {opp.agentPrompt}
                  </pre>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </SectionFrame.Visual>
      <SectionFrame.Interpretation>
        <p>
          Each play is scored for demand, buyer intent, and thin-content risk. Only patterns with
          lead-map, intake, or query evidence are listed.
        </p>
      </SectionFrame.Interpretation>
      <SectionFrame.Action>
        <p>
          {rows[0]
            ? `Start with “${rows[0].patternName}”: ${rows[0].firstRecommendedPages[0] ?? rows[0].exampleTemplate}.`
            : 'Validate ICP and offer pages before expanding page plays.'}
        </p>
      </SectionFrame.Action>
    </SectionFrame>
  );
}
