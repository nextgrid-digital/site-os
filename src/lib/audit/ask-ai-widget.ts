import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';

export type AskAiProvider = 'chatgpt' | 'claude' | 'perplexity' | 'gemini';

export interface AskAiProviderLink {
  id: AskAiProvider;
  label: string;
  href: string;
}

export interface AskAiWidgetModel {
  brand: string;
  primaryQuestion: string;
  alternateQuestions: string[];
  /** All questions in display order: primary first. */
  questions: string[];
}

function titleCase(value: string): string {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/** Brand from page title when short/clean; else domain apex (nextgrid.digital → Nextgrid). */
export function brandFromIdentity(input: {
  title?: string | null;
  domain: string;
}): string {
  const title = input.title?.trim() ?? '';
  const domainApex = input.domain.split('.')[0] ?? input.domain;
  const fromDomain = titleCase(domainApex);

  if (!title) return fromDomain;

  // Prefer a short title segment before separators like | — -
  const firstSegment = title.split(/\s*[|—–-]\s*/)[0]?.trim() ?? title;
  if (
    firstSegment.length >= 2 &&
    firstSegment.length <= 32 &&
    !/^https?:/i.test(firstSegment) &&
    !firstSegment.includes('.')
  ) {
    return firstSegment;
  }

  return fromDomain;
}

function normalizeQuestion(raw: string, brand: string): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim().replace(/\?+$/, '');
  if (!cleaned) return `What is ${brand}?`;
  if (/^(how|what|why|who|when|where|which|can|does|do|is|are)\b/i.test(cleaned)) {
    return `${cleaned}?`;
  }
  return `How does ${brand} help with ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}?`;
}

function offerPhrase(aeo: AeoAnalysis | null, siteOnly: SiteOnlyAnalysis | null): string | null {
  const offer = aeo?.inferred_primary_offer?.trim();
  if (offer) return offer;
  const appearance = siteOnly?.inferred?.businessAppearance?.trim();
  if (appearance && appearance.length < 120) return appearance;
  const says = siteOnly?.whatTheSiteSays?.[0]?.trim();
  if (says && says.length < 100) return says;
  return null;
}

export function buildAskAiWidget(input: {
  domain: string;
  title?: string | null;
  aeo: AeoAnalysis | null;
  siteOnly: SiteOnlyAnalysis | null;
  categoryLabel?: string;
  conversionGoalLabel?: string;
}): AskAiWidgetModel {
  const brand = brandFromIdentity({ title: input.title, domain: input.domain });
  const offer = offerPhrase(input.aeo, input.siteOnly);

  const primaryQuestion = offer
    ? normalizeQuestion(
        `How does ${brand} ${/^(enable|help|provide|deliver|offer|make|turn)/i.test(offer) ? offer : `enable ${offer}`}`,
        brand
      )
    : `How does ${brand} help with ${
        input.conversionGoalLabel?.toLowerCase() ?? 'growing online'
      } for ${input.categoryLabel?.toLowerCase() ?? 'businesses'}?`;

  const alternates: string[] = [];

  for (const faq of input.aeo?.missing_faq_opportunities ?? []) {
    const q = normalizeQuestion(faq, brand);
    if (q !== primaryQuestion && !alternates.includes(q)) alternates.push(q);
    if (alternates.length >= 3) break;
  }

  for (const icp of input.aeo?.inferred_icps ?? []) {
    const q = `Who is ${brand} built for, and how does it help ${icp}?`;
    if (q !== primaryQuestion && !alternates.includes(q)) alternates.push(q);
    if (alternates.length >= 3) break;
  }

  for (const rec of input.siteOnly?.inferred?.aeoImprovements ?? []) {
    const q = normalizeQuestion(rec, brand);
    if (q !== primaryQuestion && !alternates.includes(q)) alternates.push(q);
    if (alternates.length >= 3) break;
  }

  if (alternates.length === 0) {
    alternates.push(
      `What makes ${brand} different from alternatives?`,
      `Is ${brand} a good fit for ${input.conversionGoalLabel?.toLowerCase() ?? 'my business'}?`
    );
  }

  const alternateQuestions = alternates.slice(0, 3);

  return {
    brand,
    primaryQuestion,
    alternateQuestions,
    questions: [primaryQuestion, ...alternateQuestions],
  };
}

export function askAiProviderHref(provider: AskAiProvider, question: string): string {
  const q = encodeURIComponent(question);
  switch (provider) {
    case 'chatgpt':
      return `https://chatgpt.com/?q=${q}`;
    case 'claude':
      return `https://claude.ai/new?q=${q}`;
    case 'perplexity':
      return `https://www.perplexity.ai/search?q=${q}`;
    case 'gemini':
      // Consumer Gemini may ignore q; still opens the app with the query in the URL.
      return `https://gemini.google.com/app?q=${q}`;
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export function askAiProviderLinks(question: string): AskAiProviderLink[] {
  return (
    [
      { id: 'chatgpt', label: 'ChatGPT' },
      { id: 'claude', label: 'Claude' },
      { id: 'perplexity', label: 'Perplexity' },
      { id: 'gemini', label: 'Gemini' },
    ] as const
  ).map((p) => ({
    ...p,
    href: askAiProviderHref(p.id, question),
  }));
}

export function buildAskAiHtmlSnippet(input: {
  brand: string;
  question: string;
}): string {
  const links = askAiProviderLinks(input.question);
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  return [
    `<section aria-label="Ask AI about ${escape(input.brand)}" style="font-family:system-ui,sans-serif">`,
    `  <p style="font-weight:600;margin:0 0 12px">${escape(`Ask AI about ${input.brand}`)}</p>`,
    `  <div style="display:flex;flex-wrap:wrap;gap:8px">`,
    ...links.map(
      (link) =>
        `    <a href="${link.href}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:#f4f4f5;color:#18181b;text-decoration:none;font-size:14px">${escape(link.label)} ↗</a>`
    ),
    `  </div>`,
    `</section>`,
  ].join('\n');
}
