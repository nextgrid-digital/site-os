'use client';

import { EvidenceTable } from '@/components/operator/report/evidence-table';
import { ScoreBar } from '@/components/operator/report/score-bar';
import { SectionFrame } from '@/components/operator/report/section-frame';
import { StatCards } from '@/components/operator/report/stat-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CommercialGraphBriefSlice } from '@/lib/graph/types';
import { gapTypeLabel, workOrderCategoryLabel } from '@/lib/reports/presale-labels';

const ENTITY_ORDER = [
  'icp',
  'offer',
  'product',
  'use_case',
  'page',
  'claim',
  'proof',
  'cta',
  'query',
  'competitor',
  'topic',
] as const;

function statusClass(status: string) {
  if (status === 'found') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (status === 'missing') return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
  return 'border-white/15 bg-white/5 text-white/70';
}

export function CommercialGraphSection({ graph }: { graph: CommercialGraphBriefSlice }) {
  const scores = graph.scores;

  return (
    <SectionFrame id="commercial-graph" title="Lead Map">
      <SectionFrame.Visual>
        <div className="not-typeset space-y-4">
          <p className="text-sm text-white/65">
            Commercial coverage for leads — ICPs, offers, pages, claims, proof, CTAs, and queries that
            create (or block) buyer conversations before the sale.
          </p>
          <Tabs defaultValue="overview">
            <TabsList variant="line" className="w-full flex-wrap justify-start">
              <TabsTrigger value="overview">Coverage</TabsTrigger>
              <TabsTrigger value="graph">Nodes</TabsTrigger>
              <TabsTrigger value="gaps">Gaps</TabsTrigger>
              <TabsTrigger value="work-orders">Fixes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-3">
              <StatCards
                items={[
                  { label: 'Coverage score', value: scores.completenessScore },
                  { label: 'Buyer paths', value: scores.buyerPathCoverage },
                  { label: 'Proof density', value: scores.proofDensity },
                  { label: 'Missing nodes', value: scores.missingNodeCount },
                ]}
              />
              <StatCards
                items={[
                  { label: 'Unproven claims', value: scores.disconnectedClaimCount },
                  { label: 'Query→page match', value: `${scores.queryPageMatchRate}%` },
                  { label: 'Page plays', value: scores.programmaticOpportunityCount },
                  { label: 'CTA coverage', value: scores.ctaCoverage },
                ]}
              />
              <div className="space-y-2">
                <ScoreBar label="Entity coverage" value={scores.entityCompleteness} />
                <ScoreBar label="Relationship coverage" value={scores.relationshipCompleteness} />
                <ScoreBar label="Search coverage" value={scores.searchCoverage} />
                <ScoreBar label="AEO clarity" value={scores.aeoClarity} tone="bg-aeo" />
                <ScoreBar label="Page-play readiness" value={scores.programmaticReadiness} />
              </div>
            </TabsContent>

            <TabsContent value="graph" className="space-y-4 pt-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ENTITY_ORDER.map((type) => {
                  const nodes = graph.entitiesByType[type] ?? [];
                  if (nodes.length === 0) return null;
                  return (
                    <div
                      key={type}
                      className="rounded-lg border border-white/8 bg-black/20 p-3"
                    >
                      <p className="mb-2 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                        {type.replace('_', '')}
                      </p>
                      <ul className="space-y-1.5">
                        {nodes.slice(0, 8).map((node) => (
                          <li
                            key={`${type}-${node.label}`}
                            className={`rounded border px-2 py-1 text-xs ${statusClass(node.status)}`}
                          >
                            <span className="font-medium">{node.label}</span>
                            <span className="ml-1 opacity-60">· {node.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {graph.relationships.length > 0 ? (
                <EvidenceTable
                  columns={['From', 'Relation', 'To', 'State']}
                  rows={graph.relationships.slice(0, 20).map((r) => [
                    r.from,
                    r.type,
                    r.to,
                    r.statusHint,
                  ])}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="gaps" className="pt-3">
              <EvidenceTable
                columns={['Gap', 'Blocker', 'Impact', 'Fix', 'Conf']}
                rows={graph.topGaps.map((g) => [
                  g.gap,
                  gapTypeLabel(g.gapType),
                  g.impact,
                  g.fix,
                  g.confidence,
                ])}
              />
            </TabsContent>

            <TabsContent value="work-orders" className="space-y-4 pt-3">
              <EvidenceTable
                columns={['Category', 'Title', 'Summary', 'Score']}
                rows={graph.topWorkOrders.map((w) => [
                  workOrderCategoryLabel(w.actionType),
                  w.title,
                  w.summary,
                  w.priorityScore,
                ])}
              />
              {graph.topWorkOrders[0] ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                    Top Fix Queue prompt
                  </p>
                  <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-5 whitespace-pre-wrap text-white/80">
                    {graph.topWorkOrders[0].fullPrompt}
                  </pre>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>
      </SectionFrame.Visual>
      <SectionFrame.Interpretation>
        <p>{graph.executiveMemo.whatTheGraphShows}</p>
      </SectionFrame.Interpretation>
      <SectionFrame.Action>
        <p>{graph.executiveMemo.whatToFixFirst}</p>
      </SectionFrame.Action>
    </SectionFrame>
  );
}
