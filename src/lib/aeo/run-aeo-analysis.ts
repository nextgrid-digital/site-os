import {
  generateGeminiJson,
  getGeminiModel,
  hasGeminiConfig,
  isAbortOrTimeoutError,
  toPlainError,
} from '@/lib/ai/gemini';
import { aeoAnalysisSchema, type AeoAnalysis, type AeoAnalysisStatus } from '@/lib/aeo/schema';
import type { DraftFinding } from '@/lib/audit/finding-generators';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { Ga4LandingPageRow } from '@/lib/google/ga4';
import type { GscPageRow, GscQueryRow } from '@/lib/google/search-console';
import type { ArchitectureInput } from '@/lib/supabase/types';

const PRIORITY_PATH_PATTERNS = [
  /^\/$/,
  /about/i,
  /service/i,
  /product/i,
  /solution/i,
  /case[-_]?stud/i,
  /customer/i,
  /testimonial/i,
  /contact/i,
  /faq/i,
  /help/i,
  /pricing/i,
];

const TINY_PATH_PATTERNS = [/^\/$/, /about/i, /service/i, /product/i, /pricing/i];

export interface AeoRunResult {
  status: AeoAnalysisStatus;
  model: string | null;
  error_message: string | null;
  analysis: AeoAnalysis | null;
}

type AeoPromptInput = {
  websiteUrl: string;
  projectName: string;
  intake: ArchitectureInput | null;
  pages: CrawledPage[];
  gscQueries: GscQueryRow[];
  gscPages: GscPageRow[];
  ga4Pages: Ga4LandingPageRow[];
  findings: DraftFinding[];
};

function prioritizePages(pages: CrawledPage[], patterns: RegExp[], limit: number) {
  const scored = pages.map((page) => {
    const priority = patterns.some((pattern) => pattern.test(page.path)) ? 0 : 1;
    return { page, priority };
  });
  return scored
    .toSorted((a, b) => a.priority - b.priority || a.page.path.localeCompare(b.page.path))
    .map((item) => item.page)
    .slice(0, limit);
}

function summarizeGsc(queries: GscQueryRow[], pages: GscPageRow[], limit: number) {
  const topQueries = queries
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, limit)
    .map((row) => ({
      query: row.query,
      page: row.page,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: Number(row.ctr.toFixed(4)),
      position: Number(row.position.toFixed(1)),
    }));
  const topPages = pages
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, limit)
    .map((row) => ({
      page: row.page,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: Number(row.ctr.toFixed(4)),
      position: Number(row.position.toFixed(1)),
    }));
  return { topQueries, topPages };
}

function summarizeGa4(rows: Ga4LandingPageRow[], limit: number) {
  return rows
    .toSorted((a, b) => b.sessions - a.sessions)
    .slice(0, limit)
    .map((row) => ({
      landingPage: row.landingPage,
      sourceMedium: row.sourceMedium,
      sessions: row.sessions,
      engagedSessions: row.engagedSessions,
      conversions: row.conversions,
    }));
}

function intakePayload(intake: ArchitectureInput | null) {
  return {
    business_type: intake?.business_type ?? null,
    primary_offer: intake?.primary_offer ?? null,
    secondary_offers: intake?.secondary_offers ?? null,
    primary_icp: intake?.primary_icp ?? null,
    secondary_icps: intake?.secondary_icps ?? null,
    conversion_goal: intake?.conversion_goal ?? null,
    trust_proof_assets: intake?.trust_proof_assets ?? null,
    site_type: intake?.site_type ?? null,
    icp_notes: intake?.icp_notes ?? null,
    product_notes: intake?.product_notes ?? null,
    offer_notes: intake?.offer_notes ?? null,
    proof_notes: intake?.proof_notes ?? null,
  };
}

function schemaPreamble() {
  return `You are an AEO (Answer Engine Optimization) analyst for Site-OS.
Return ONLY valid JSON matching this schema:
{
  "observed_inputs_summary": string,
  "business_summary": string,
  "inferred_icps": string[],
  "inferred_primary_offer": string,
  "inferred_secondary_offers": string[],
  "clarity_score": number 0-100,
  "answerability_score": number 0-100,
  "entity_clarity_notes": string[],
  "missing_faq_opportunities": string[],
  "missing_proof_opportunities": string[],
  "missing_page_types": string[],
  "suggested_aeo_rewrites": [{"page_path": string|null, "change": string, "why": string}],
  "risks_and_ambiguities": string[],
  "confidence_notes": string
}

Rules:
- Treat operatorIntake as corrections when the live site is unclear.
- Separate observed facts from inferences. Put factual input synthesis in observed_inputs_summary.
- Do not invent proof, customers, or metrics not present in the inputs.
- Focus on how AI answer engines may interpret and cite this business.
- Keep arrays concise (max 6 items each).`;
}

function buildPrompt(input: AeoPromptInput, mode: 'compact' | 'tiny') {
  const pageLimit = mode === 'tiny' ? 4 : 6;
  const excerptLimit = mode === 'tiny' ? 300 : 600;
  const findingLimit = mode === 'tiny' ? 5 : 8;
  const metricLimit = mode === 'tiny' ? 5 : 8;
  const patterns = mode === 'tiny' ? TINY_PATH_PATTERNS : PRIORITY_PATH_PATTERNS;

  const prioritized = prioritizePages(input.pages, patterns, pageLimit).map((page) => ({
    path: page.path,
    title: page.title,
    metaDescription: page.metaDescription?.slice(0, 160) ?? null,
    h1: page.h1,
    hasFaq: page.hasFaq,
    hasFaqSchema: page.hasFaqSchema,
    textExcerpt: page.textExcerpt?.slice(0, excerptLimit) ?? null,
  }));

  const payload =
    mode === 'tiny'
      ? {
          projectName: input.projectName,
          websiteUrl: input.websiteUrl,
          operatorIntake: intakePayload(input.intake),
          crawledPages: prioritized,
          existingFindings: input.findings.slice(0, findingLimit).map((finding) => ({
            type: finding.type,
            category: finding.category,
            severity: finding.severity,
            title: finding.title,
            page_path: finding.page_path,
          })),
        }
      : {
          projectName: input.projectName,
          websiteUrl: input.websiteUrl,
          operatorIntake: intakePayload(input.intake),
          crawledPages: prioritized,
          searchConsole: summarizeGsc(input.gscQueries, input.gscPages, metricLimit),
          ga4: summarizeGa4(input.ga4Pages, metricLimit),
          existingFindings: input.findings.slice(0, findingLimit).map((finding) => ({
            type: finding.type,
            category: finding.category,
            severity: finding.severity,
            title: finding.title,
            summary: finding.summary.slice(0, 180),
            page_path: finding.page_path,
          })),
        };

  return `${schemaPreamble()}

INPUTS:
${JSON.stringify(payload)}`;
}

function parseJsonText(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Could not parse AEO JSON.');
  }
}

async function callAndParse(prompt: string, maxOutputTokens = 4096) {
  const { model, text } = await generateGeminiJson(prompt, { maxOutputTokens });
  const parsed = aeoAnalysisSchema.parse(parseJsonText(text));
  return { model, analysis: parsed };
}

export async function runAeoAnalysis(input: AeoPromptInput): Promise<AeoRunResult> {
  if (!hasGeminiConfig()) {
    return {
      status: 'skipped',
      model: null,
      error_message: 'AI provider is not configured.',
      analysis: null,
    };
  }

  try {
    const compact = await callAndParse(buildPrompt(input, 'compact'));
    return {
      status: 'completed',
      model: compact.model,
      error_message: null,
      analysis: compact.analysis,
    };
  } catch (firstError) {
    if (!isAbortOrTimeoutError(firstError)) {
      const plain = toPlainError(firstError, 'AEO analysis failed.');
      return {
        status: 'failed',
        model: getGeminiModel(),
        error_message: plain.message,
        analysis: null,
      };
    }

    try {
      const tiny = await callAndParse(buildPrompt(input, 'tiny'), 2048);
      return {
        status: 'completed',
        model: tiny.model,
        error_message: null,
        analysis: tiny.analysis,
      };
    } catch (retryError) {
      const plain = toPlainError(
        retryError,
      `AEO analysis timed out twice. Retry later or check the AI provider configuration.`
      );
      return {
        status: 'failed',
        model: getGeminiModel(),
        error_message: plain.message,
        analysis: null,
      };
    }
  }
}
