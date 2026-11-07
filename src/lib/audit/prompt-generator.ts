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
      ? `Create or expand a dedicated ${finding.title.replace(/^missing\s+/i, '').toLowerCase()}. State who it is for and what you offer, back it up with real proof such as customer results, logos, or testimonials, and end with one clear call to action.`
      : finding.type === 'weak_title' || finding.type === 'weak_meta_description'
        ? 'Rewrite the SERP snippet to improve clarity, intent match, and click appeal.'
        : finding.type === 'missing_faq'
          ? 'Add a concise FAQ section answering the questions customers actually ask before buying (use sales calls, support tickets, and Search Console queries as the source). Do not pad it with generic questions.'
          : finding.type === 'thin_internal_links'
            ? 'Add contextual internal links from related pages to strengthen crawl paths and conversion routes.'
            : finding.type === 'search_ctr_gap' || finding.type === 'page_ctr_gap'
              ? 'Rewrite the title tag and meta description so they contain the searched query wording and a concrete reason to click (specific outcome, number, or differentiator). Make sure the page actually delivers what the new snippet promises.'
              : finding.type === 'search_position_gap'
                ? 'Make this page the best answer to the query: cover it in a dedicated H2 with the query wording, add the missing detail competitors cover, and link to it from related pages.'
                : finding.type === 'low_engagement_landing_page'
                  ? 'Check the page against the traffic source that lands on it: the first screen must match the promise that brought the visitor, with one clear next step. Check load speed and mobile layout before rewriting copy.'
                  : finding.type === 'no_conversion_support'
                    ? 'First confirm the conversion event fires correctly in GA4 for this page. If tracking is fine, put one clear call to action above the fold and remove competing asks.'
                    : 'Improve the page to better match search demand and buyer intent.';

  const copyGuidance =
    finding.category === 'search'
      ? 'Lead with the buyer problem, name the outcome, and differentiate from generic alternatives.'
      : finding.category === 'architecture'
        ? 'Use a clear page hierarchy: audience, problem, solution, proof, CTA.'
        : 'Make the first screen answer what this is, who it is for, and why act now.';

  const internalLinks =
    finding.page_path && finding.page_path !== '/'
      ? `Link from ${finding.page_path} to the most relevant offer, proof, or pricing pages that already exist on the site. Do not link to pages that do not exist.`
      : 'Link homepage sections to the offer, proof, and pricing pages that already exist on the site.';

  const faqSchemaGuidance =
    finding.type === 'missing_faq'
      ? 'Add the real buyer objections as visible FAQ items. FAQPage schema is optional: Google only shows FAQ rich results for well-known government and health sites, so do not expect a SERP benefit.'
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
