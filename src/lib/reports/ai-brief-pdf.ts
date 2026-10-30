import type { PlainReport } from '@/components/workspace/report-pdf-button';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { displayFactLabel, parseBriefFacts } from '@/lib/reports/brief-facts';
import type { MonthlyCompareSection } from '@/lib/workflow/monthly-compare';
import type { WorkItemView } from '@/lib/workflow/work-items';

const field = (label: string, value: string | null | undefined) =>
  value && value.trim() ? `${label}: ${value.trim()}` : null;

const compact = (items: Array<string | null | undefined | false>) =>
  items.filter((v): v is string => Boolean(v));

/**
 * Builds a brief meant to be attached to ChatGPT, Claude, Perplexity or a coding
 * agent: an instruction preamble, then labelled, self-contained work items
 * (page, problem, change, done-when) so the model can plan and fix without context.
 */
export function buildAiBriefReport(input: {
  domain: string;
  brief: GrowthBrief | null;
  pending: WorkItemView[];
  monthly: MonthlyCompareSection | null;
}): PlainReport {
  const { domain, brief, pending, monthly } = input;
  const facts = parseBriefFacts(
    compact([
      brief?.businessInterpretation,
      ...(brief?.siteOnlySummary?.whatTheSiteSays.slice(0, 2) ?? []),
    ]),
  );
  const verdict = brief?.auditVerdict;
  const generated = new Date().toISOString().slice(0, 10);

  return {
    title: `Website fix brief: ${domain}`,
    subtitle: `Generated ${generated} by Site-OS. Audit readiness: ${brief?.readinessLabel ?? 'n/a'}.`,
    sections: [
      {
        heading: 'Instructions for the AI assistant reading this file',
        lines: [
          `This is an audit of the website ${domain}. Read all of it, then act as a senior web developer and SEO/AEO specialist.`,
          'Step 1: Summarise the site and its main problem in 3 sentences.',
          'Step 2: Produce an ordered fix plan. Follow the priority order below unless a dependency says otherwise.',
          'Step 3: For each task, give the exact change (code, copy, markup, config) and one way to verify it worked.',
          'Rules: make the smallest change that solves each issue. Do not invent data that is not in this file. If something needed is missing (page content, CMS, framework), ask before guessing.',
        ],
      },
      {
        heading: 'Summary',
        lines: compact([
          field('Site', domain),
          field('Verdict', verdict?.verdict),
          field('Main issue', verdict?.mainIssue),
          field('First fix', verdict?.firstFix),
          field('Why', verdict?.why),
          `Open tasks: ${pending.length}`,
        ]),
      },
      {
        heading: 'What the site is about (machine reading)',
        lines: facts.map((f) => (f.label ? `${displayFactLabel(f.label)}: ${f.value}` : f.value)),
      },
      {
        heading: 'Issues ranked by business impact',
        numbered: true,
        lines: (brief?.priorityStack ?? []).slice(0, 10).map((item) => ({
          text: item.title,
          details: compact([
            field('Page', item.page_path),
            field('Problem', item.summary),
            field('Why it matters', item.whyFirst),
            field('Category', item.category),
            field('Estimated value', item.estimated_value),
          ]),
        })),
      },
      {
        heading: 'Implementation details',
        numbered: true,
        lines: (brief?.executionBriefs ?? []).map((e) => ({
          text: e.title,
          details: compact([
            field('Page', e.page_path),
            field('What to change', e.whatToChange),
            field('Suggested rewrite', e.recommendedRewrite),
            field('Internal links to add', e.internalLinks),
            field('FAQ questions to answer', e.faqQuestions),
            field('Schema markup', e.schemaSuggestions),
            field('Done when / expected effect', e.expectedEffect),
          ]),
        })),
      },
      {
        heading: `Open tasks (${pending.length})`,
        numbered: true,
        lines: pending.map((item) => ({
          text: `[${item.priority.toUpperCase()}] ${item.issue}`,
          details: compact([
            field('Page', item.pagePath),
            field('Why it matters', item.whyItMatters),
            field('Do this', item.nextAction),
            field('Recommendation', item.recommendation),
          ]),
        })),
      },
      {
        heading: 'Changes since last audit',
        lines: [
          ...(monthly?.improved ?? []).map((l) => `Improved: ${l.title}${l.detail ? ` (${l.detail})` : ''}`),
          ...(monthly?.regressed ?? []).map((l) => `Regressed: ${l.title}${l.detail ? ` (${l.detail})` : ''}`),
        ],
      },
      {
        heading: 'Recommended next steps',
        numbered: true,
        lines:
          brief?.siteOnlySummary?.recommendedNextSteps.slice(0, 5) ??
          compact([brief?.offerRecommendation.nextgridAction]),
      },
    ],
  };
}
