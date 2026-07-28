import type { DraftFinding } from '@/lib/audit/finding-generators';

export interface PromptSections {
  context: string;
  page_path: string | null;
  evidence: string;
  buyer_moment: string;
  problem: string;
  exact_change: string;
  copy_guidance: string;
  internal_links: string;
  faq_schema_guidance: string;
  constraints: string;
  acceptance_criteria: string;
  full_prompt: string;
}

function formatEvidence(evidence: Record<string, unknown>): string {
  return Object.entries(evidence)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join('\n');
}

export function generatePromptForFinding(
  finding: DraftFinding,
  projectName: string,
  websiteUrl: string
): PromptSections {
  const evidence = formatEvidence(finding.evidence);
  const pagePath = finding.page_path ?? 'sitewide';

  const exactChange =
    finding.type === 'missing_page_type'
      ? `Create or expand a dedicated page for ${finding.title.toLowerCase()} with clear positioning, proof, and CTA.`
      : finding.type === 'weak_title' || finding.type === 'weak_meta_description'
        ? 'Rewrite the SERP snippet to improve clarity, intent match, and click appeal.'
        : finding.type === 'missing_faq'
          ? 'Add a concise FAQ section and FAQ schema for the highest-intent objections on this page.'
          : finding.type === 'thin_internal_links'
            ? 'Add contextual internal links from related pages to strengthen crawl paths and conversion routes.'
            : 'Improve the page to better match search demand and buyer intent.';

  const copyGuidance =
    finding.category === 'search'
      ? 'Lead with the buyer problem, name the outcome, and differentiate from generic alternatives.'
      : finding.category === 'architecture'
        ? 'Use a clear page hierarchy: audience, problem, solution, proof, CTA.'
        : 'Make the first screen answer what this is, who it is for, and why act now.';

  const internalLinks =
    finding.page_path && finding.page_path !== '/'
      ? `Link to pricing, proof, and the most relevant solution page from ${finding.page_path}.`
      : 'Link homepage sections to product, solution, proof, and pricing pages.';

  const faqSchemaGuidance =
    finding.type === 'missing_faq'
      ? 'Add 4-6 buyer objections as FAQ items and implement FAQPage schema.'
      : 'Only add FAQ/schema where it supports a real buyer objection on this page.';

  const constraints =
    'Use one universal implementation prompt. Do not create separate tool-specific variants. Preserve brand tone, avoid fluff, and do not invent proof.';

  const acceptanceCriteria =
    'The updated page or section clearly addresses the evidence, improves the buyer moment, and can be reviewed by an operator without additional context.';

  const sections = {
    context: `Project: ${projectName}. Website: ${websiteUrl}. Finding type: ${finding.type}.`,
    page_path: finding.page_path,
    evidence,
    buyer_moment: finding.buyer_moment,
    problem: finding.summary,
    exact_change: exactChange,
    copy_guidance: copyGuidance,
    internal_links: internalLinks,
    faq_schema_guidance: faqSchemaGuidance,
    constraints,
    acceptance_criteria: acceptanceCriteria,
  };

  const full_prompt = [
    '## Context',
    sections.context,
    '',
    '## Page path',
    pagePath,
    '',
    '## Evidence',
    sections.evidence,
    '',
    '## Buyer moment',
    sections.buyer_moment,
    '',
    '## Problem',
    sections.problem,
    '',
    '## Exact change',
    sections.exact_change,
    '',
    '## Copy guidance',
    sections.copy_guidance,
    '',
    '## Internal links',
    sections.internal_links,
    '',
    '## FAQ / schema guidance',
    sections.faq_schema_guidance,
    '',
    '## Constraints',
    sections.constraints,
    '',
    '## Acceptance criteria',
    sections.acceptance_criteria,
  ].join('\n');

  return { ...sections, full_prompt };
}

export function generateGraphWorkOrderPrompt(input: {
  projectName: string;
  websiteUrl: string;
  actionType: string;
  title: string;
  graphIssue: string;
  missingNodeOrEdge: string;
  buyerMoment: string;
  pageOrSystem: string;
  proofNeeded: string;
  ctaNeeded: string;
  faqSchemaGuidance: string;
  internalLinks: string;
  constraints: string;
  acceptanceCriteria: string;
}): string {
  return [
    '## Context',
    `Project: ${input.projectName}. Website: ${input.websiteUrl}. Work order: ${input.actionType} — ${input.title}.`,
    '',
    '## Graph issue',
    input.graphIssue,
    '',
    '## Missing node or edge',
    input.missingNodeOrEdge,
    '',
    '## Buyer moment',
    input.buyerMoment,
    '',
    '## Page or system to create',
    input.pageOrSystem,
    '',
    '## Proof needed',
    input.proofNeeded,
    '',
    '## CTA needed',
    input.ctaNeeded,
    '',
    '## FAQ / schema guidance',
    input.faqSchemaGuidance,
    '',
    '## Internal links',
    input.internalLinks,
    '',
    '## Constraints',
    input.constraints,
    '',
    '## Acceptance criteria',
    input.acceptanceCriteria,
  ].join('\n');
}
