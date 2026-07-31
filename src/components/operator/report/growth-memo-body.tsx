import { EvidenceTable } from '@/components/operator/report/evidence-table';
import { ExecutionCard } from '@/components/operator/report/execution-card';
import { ScoreBar } from '@/components/operator/report/score-bar';
import { SectionFrame } from '@/components/operator/report/section-frame';
import { StatCards } from '@/components/operator/report/stat-cards';
import { StrengthMatrix } from '@/components/operator/report/strength-matrix';
import { GraphExecutiveMemo } from '@/components/operator/report/graph-executive-memo';
import { PromptBlock } from '@/components/operator/prompt-block';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  buildBuyerStrengthMatrix,
  buildIcpOfferRows,
  buildPageCoverageRows,
  buildPriorityTableRows,
  firstSentence,
  weakestScoreLabel,
} from '@/lib/reports/report-visuals';
import { findingCategoryLabel } from '@/lib/reports/presale-labels';
import type { AgentPrompt, ArchitectureInput, Finding } from '@/lib/supabase/types';

function VerdictRows({
  verdict,
}: {
  verdict: GrowthBrief['auditVerdict'];
}) {
  const rows: Array<[string, string]> = [
    ['Verdict', verdict.verdict],
    ['Main blocker', verdict.mainIssue],
    ['First fix', verdict.firstFix],
    ['Why leads stall', verdict.why],
  ];

  return (
    <div className="divide-y divide-white/8 rounded-lg border border-white/8 bg-white/[0.02]">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
          <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">{label}</p>
          <p className="text-sm leading-snug text-white/85">{value}</p>
        </div>
      ))}
    </div>
  );
}

function scoreDims(scorecard: GrowthBrief['scorecard']) {
  return {
    offerClarity: scorecard.offerClarity ?? scorecard.overallOpportunity,
    buyerClarity: scorecard.buyerClarity ?? 50,
    trustProof: scorecard.trustProof ?? scorecard.architectureReadiness,
    ctaStrength: scorecard.ctaStrength ?? scorecard.conversionHealth,
    pageArchitecture: scorecard.pageArchitecture ?? scorecard.architectureReadiness,
    searchVisibility: scorecard.searchVisibility ?? scorecard.searchDemand,
    engagementQuality: scorecard.engagementQuality ?? scorecard.conversionHealth,
    aeoClarity: scorecard.aeoClarity,
    presaleReadiness:
      scorecard.presaleReadiness ?? scorecard.overallOpportunity,
  };
}

export function GrowthMemoBody({
  brief,
  isTeaser,
  lockDeepSections: _lockDeepSections,
  projectId,
  workspaceBase,
  operatorNotes,
  findings,
  firstPrompt: _firstPrompt,
}: {
  brief: GrowthBrief;
  isTeaser: boolean;
  lockDeepSections: boolean;
  projectId: string;
  workspaceBase?: string;
  operatorNotes?: ArchitectureInput | null;
  findings: Finding[];
  firstPrompt: AgentPrompt | null;
}) {
  const base = workspaceBase ?? `/audit/${projectId}`;
  const site = brief.siteOnlySummary;
  const verdict = brief.auditVerdict;
  const dims = scoreDims(brief.scorecard);

  const icpRows = buildIcpOfferRows(operatorNotes, brief);
  const buyerMatrix = buildBuyerStrengthMatrix(site?.pageInventory, site?.proofGaps ?? []);
  const coverageRows = buildPageCoverageRows(site?.pageInventory);
  const priorityRows = buildPriorityTableRows(brief.teaser, brief.priorityStack, isTeaser).slice(
    0,
    3
  );
  const weakest = weakestScoreLabel({
    ...brief.scorecard,
    ...dims,
  });
  const criticalCount =
    site?.criticalFindings ??
    findings.filter((f) => f.severity === 'high' || f.severity === 'critical').length;

  const topFinding = brief.priorityStack[0];
  const topWorkOrder = brief.commercialGraph?.topWorkOrders[0];
  const memo = brief.commercialGraph?.executiveMemo;
  const conversionGoal =
    operatorNotes?.conversion_goal?.trim() ||
    'Leads, sales conversations, or signups before the sale';

  const priorityWithLabels = priorityRows.map((row, index) => {
    const item = brief.priorityStack[index];
    const label = item
      ? findingCategoryLabel(item.category ?? 'conversion', item.type)
      : 'Lead blockers';
    return [row[0], label, row[1], row[2], row[3]] as [
      string | number,
      string,
      string,
      string,
      string,
    ];
  });

  return (
    <>
      <SectionFrame id="audit-verdict" title="Presale verdict">
        <SectionFrame.Visual>
          <VerdictRows verdict={verdict} />
        </SectionFrame.Visual>
        <SectionFrame.Interpretation>
          <p>{firstSentence(verdict.mainIssue)}</p>
        </SectionFrame.Interpretation>
        <SectionFrame.Action>
          <p>{verdict.firstFix}</p>
        </SectionFrame.Action>
      </SectionFrame>

      <SectionFrame id="business-context" title="Business context">
        <SectionFrame.Visual>
          <div className="space-y-3">
            <p className="not-typeset text-sm text-white/70">
              <span className="text-white/40">Conversion goal · </span>
              {conversionGoal}
            </p>
            <EvidenceTable columns={['ICP', 'Offer', 'Buyer moment']} rows={icpRows} />
          </div>
        </SectionFrame.Visual>
        <SectionFrame.Interpretation>
          <p>{firstSentence(brief.businessInterpretation)}</p>
          {brief.icpAlignment ? <p>{firstSentence(brief.icpAlignment, 160)}</p> : null}
        </SectionFrame.Interpretation>
        <SectionFrame.Action>
          <p>{firstSentence(brief.offerClarity) || 'Clarify primary offer and ICP in intake.'}</p>
        </SectionFrame.Action>
      </SectionFrame>

      {site ? (
        <SectionFrame id="site-snapshot" title="Site snapshot">
          <SectionFrame.Visual>
            <div className="space-y-4">
              {site.ogImageUrl ? (
                <div className="overflow-hidden rounded-lg border border-white/8 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary client OG hosts */}
                  <img
                    src={site.ogImageUrl}
                    alt="Site Open Graph preview"
                    className="aspect-[1.91/1] w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex aspect-[1.91/1] w-full items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.02] text-xs text-white/35">
                  No Open Graph image
                </div>
              )}
              <StatCards
                items={[
                  { label: 'Pages crawled', value: site.pagesCrawled },
                  { label: 'Meta issues', value: site.metaIssues },
                  { label: 'Missing lead pages', value: site.missingPageKinds },
                  { label: 'Critical blockers', value: criticalCount },
                ]}
              />
            </div>
          </SectionFrame.Visual>
          <SectionFrame.Interpretation>
            <ul>
              {site.whatTheSiteSays.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
              {site.messagingClarity[0] ? <li>{site.messagingClarity[0]}</li> : null}
            </ul>
          </SectionFrame.Interpretation>
          <SectionFrame.Action>
            <p>{site.recommendedNextSteps[0] ?? 'Fix the highest-impact lead-path gap first.'}</p>
          </SectionFrame.Action>
        </SectionFrame>
      ) : null}

      <SectionFrame id="scorecard" title="Presale readiness scorecard">
        <SectionFrame.Visual>
          <div className="space-y-3">
            <ScoreBar
              label="Presale readiness"
              value={dims.presaleReadiness}
              tone="bg-primary"
            />
            <ScoreBar label="Offer clarity" value={dims.offerClarity} />
            <ScoreBar label="Buyer clarity" value={dims.buyerClarity} />
            <ScoreBar label="Trust / proof" value={dims.trustProof} tone="bg-chart-5" />
            <ScoreBar label="CTA strength" value={dims.ctaStrength} tone="bg-success" />
            <ScoreBar label="Page architecture" value={dims.pageArchitecture} />
            <ScoreBar
              label="Search visibility"
              value={brief.dataAvailability.gscHasData ? dims.searchVisibility : dims.searchVisibility}
              tone="bg-primary"
            />
            <ScoreBar label="Engagement quality" value={dims.engagementQuality} />
            <ScoreBar label="AEO clarity" value={dims.aeoClarity} tone="bg-aeo" />
          </div>
        </SectionFrame.Visual>
        <SectionFrame.Interpretation>
          <p>
            Weakest dimension: {weakest.label} at {Math.round(weakest.value)}/100.
            {!brief.includeSearchSection
              ? ' Search visibility stays low until Search Console is connected.'
              : !brief.dataAvailability.gscHasData
                ? ' Search Console is connected; scores stay low until volume meets thresholds.'
                : null}
          </p>
        </SectionFrame.Interpretation>
        <SectionFrame.Action>
          <p>Prioritize work that lifts {weakest.label.toLowerCase()} to unblock leads.</p>
        </SectionFrame.Action>
      </SectionFrame>

      {site ? (
        <SectionFrame id="buyer-moments" title="Lead path moments">
          <SectionFrame.Visual>
            <StrengthMatrix rows={buyerMatrix} />
          </SectionFrame.Visual>
          <SectionFrame.Interpretation>
            <p>
              {site.buyerMoments[0] ??
                'Buyer moments are inferred from which page types support know / do / buy / trust.'}
            </p>
            {site.buyerMoments[1] ? <p>{site.buyerMoments[1]}</p> : null}
          </SectionFrame.Interpretation>
          <SectionFrame.Action>
            <p>
              {site.proofGaps[0] ??
                site.buyerMoments.find((m) => /missing|weak|unsupported/i.test(m)) ??
                'Strengthen the weakest lead moment with a dedicated page.'}
            </p>
          </SectionFrame.Action>
        </SectionFrame>
      ) : null}

      {site ? (
        <SectionFrame id="architecture-gaps" title="Page blockers">
          <SectionFrame.Visual>
            <EvidenceTable
              columns={['Page type', 'Expected', 'Found', 'Status']}
              rows={coverageRows}
            />
          </SectionFrame.Visual>
          <SectionFrame.Interpretation>
            <ul>
              {site.architectureGaps.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
              {site.proofGaps[0] ? <li>{site.proofGaps[0]}</li> : null}
            </ul>
          </SectionFrame.Interpretation>
          <SectionFrame.Action>
            <p>
              {site.recommendedNextSteps.find((step) => /page|proof|ICP|product/i.test(step)) ??
                'Add the highest-status Missing page type first.'}
            </p>
          </SectionFrame.Action>
        </SectionFrame>
      ) : null}

      {brief.commercialGraph ? (
        <GraphExecutiveMemo memo={brief.commercialGraph.executiveMemo} />
      ) : null}

      <SectionFrame id="priority-fixes" title="Top lead blockers">
        <SectionFrame.Visual>
          <EvidenceTable
            columns={['Priority', 'Category', 'Fix', 'Impact', 'Effort']}
            rows={priorityWithLabels}
          />
        </SectionFrame.Visual>
        <SectionFrame.Interpretation>
          <p>
            {isTeaser && brief.teaser?.growthLeak
              ? firstSentence(brief.teaser.growthLeak.summary)
              : brief.priorityStack[0]
                ? firstSentence(brief.priorityStack[0].summary)
                : 'No prioritized lead blockers yet.'}
          </p>
        </SectionFrame.Interpretation>
        <SectionFrame.Action href={`/operator/projects/${projectId}/work-orders`} cta="Open Fix Queue">
          <p>
            {priorityRows[0]
              ? `Ship “${priorityRows[0][1]}” first — open Fix Queue for the agent prompt.`
              : 'Re-run the audit after intake is complete.'}
          </p>
        </SectionFrame.Action>
      </SectionFrame>

      {brief.commercialGraph ? (
        <SectionFrame id="execution-links" title="Where to execute">
          <SectionFrame.Visual>
            <div className="not-typeset flex flex-wrap gap-2">
              <Button size="sm" render={<Link href={`/operator/projects/${projectId}/work-orders`} />}>
                Fix Queue
              </Button>
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/operator/projects/${projectId}/graph`} />}
              >
                Lead Map
              </Button>
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/operator/projects/${projectId}/systems`} />}
              >
                Page Plays
              </Button>
            </div>
          </SectionFrame.Visual>
          <SectionFrame.Interpretation>
            <p>
              Coverage score {brief.commercialGraph.scores.completenessScore}/100 ·{' '}
              {brief.commercialGraph.topWorkOrders.length} top fixes ·{' '}
              {brief.commercialGraph.topOpportunities.length} page plays.
            </p>
          </SectionFrame.Interpretation>
          <SectionFrame.Action href={`/operator/projects/${projectId}/work-orders`} cta="Open Fix Queue">
            <p>{brief.commercialGraph.executiveMemo.whatToFixFirst}</p>
          </SectionFrame.Action>
        </SectionFrame>
      ) : null}

      <SectionFrame id="presale-execution-brief" title="Presale execution brief">
        <SectionFrame.Visual>
          <div className="divide-y divide-white/8 rounded-lg border border-white/8 bg-white/[0.02]">
            {(
              [
                [
                  'What to fix first',
                  memo?.whatToFixFirst ??
                    topWorkOrder?.title ??
                    topFinding?.title ??
                    verdict.firstFix,
                ],
                [
                  'Why it matters for leads',
                  memo?.whatMattersMost ??
                    topFinding?.summary ??
                    verdict.why,
                ],
                [
                  'Page / section',
                  topFinding?.page_path ??
                    topWorkOrder?.title ??
                    'Primary conversion path on the site',
                ],
                [
                  'Proof needed',
                  site?.proofGaps[0] ??
                    memo?.whatTheSiteIsSaying ??
                    'Add credible proof near the primary claim',
                ],
                [
                  'CTA',
                  memo?.whatToFixFirst?.match(/cta|call|book|demo|signup/i)
                    ? memo.whatToFixFirst
                    : 'Strengthen the primary CTA on the highest-intent page',
                ],
                [
                  'Page system',
                  memo?.whatPageSystemsToBuild ?? 'None until ICP and offer pages are solid',
                ],
                [
                  'What NextGrid executes',
                  memo?.whatNextgridShouldExecute ??
                    'Ship the top Fix Queue prompt against the live site',
                ],
              ] as Array<[string, string]>
            ).map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 px-3 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)]"
              >
                <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                  {label}
                </p>
                <p className="text-sm leading-snug text-white/85">{value}</p>
              </div>
            ))}
          </div>
          {topWorkOrder?.fullPrompt ? (
            <div className="not-typeset mt-4 space-y-2">
              <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                Top Fix Queue prompt
              </p>
              <pre className="max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-5 whitespace-pre-wrap text-white/80">
                {topWorkOrder.fullPrompt}
              </pre>
            </div>
          ) : null}
        </SectionFrame.Visual>
        <SectionFrame.Interpretation>
          <p>
            This is the presale execution package — unblock leads first, then scale page plays.
          </p>
        </SectionFrame.Interpretation>
        <SectionFrame.Action href={`/operator/projects/${projectId}/work-orders`} cta="Open Fix Queue">
          <p>Copy the top prompt from Fix Queue and execute the first lead blocker.</p>
        </SectionFrame.Action>
      </SectionFrame>
    </>
  );
}

export function AgentPromptSection({
  prompt,
  locked,
}: {
  prompt: AgentPrompt | null;
  locked: boolean;
}) {
  if (locked && !prompt) {
    return (
      <SectionFrame
        id="agent-prompts"
        title="Execution Prompt"
        locked
        lockReason="full audit required"
      >
        <SectionFrame.Visual muted>
          <ExecutionCard
            rows={[
              { label: 'Input', value: 'Current website + audit' },
              { label: 'Output', value: 'Edited page / new page' },
              { label: 'Tool', value: 'Any website agent' },
              { label: 'Acceptance', value: 'Page answers buyer question clearly' },
            ]}
          />
        </SectionFrame.Visual>
        <SectionFrame.Interpretation>
          <p>Execution prompts unlock with full audit findings.</p>
        </SectionFrame.Interpretation>
        <SectionFrame.Action href={`/operator/projects`} cta="Back">
          <p>Run a full audit or open Fix Queue after the next run.</p>
        </SectionFrame.Action>
      </SectionFrame>
    );
  }

  if (!prompt) {
    return (
      <SectionFrame id="agent-prompts" title="Execution Prompt">
        <SectionFrame.Visual>
          <ExecutionCard
            rows={[
              { label: 'Input', value: 'Current website + audit' },
              { label: 'Output', value: 'Edited page / new page' },
              { label: 'Tool', value: 'Any website agent' },
              { label: 'Acceptance', value: 'Page answers buyer question clearly' },
            ]}
          />
        </SectionFrame.Visual>
        <SectionFrame.Interpretation>
          <p>No execution prompt was generated for this run yet.</p>
        </SectionFrame.Interpretation>
        <SectionFrame.Action>
          <p>Open Fix Queue after re-running the audit.</p>
        </SectionFrame.Action>
      </SectionFrame>
    );
  }

  return (
    <SectionFrame id="agent-prompts" title="Execution Prompt">
      <SectionFrame.Visual>
        <ExecutionCard
          rows={[
            { label: 'Input', value: 'Current website + audit' },
            { label: 'Output', value: 'Edited page / new page' },
            { label: 'Tool', value: 'Any website agent' },
            { label: 'Acceptance', value: 'Page answers buyer question clearly' },
          ]}
        />
      </SectionFrame.Visual>
      <SectionFrame.Interpretation>
        <p>One agent-ready prompt from this audit run — prefer the Fix Queue for the full set.</p>
      </SectionFrame.Interpretation>
      <SectionFrame.Action>
        <div className="not-typeset">
          <PromptBlock prompt={prompt} />
        </div>
      </SectionFrame.Action>
    </SectionFrame>
  );
}
