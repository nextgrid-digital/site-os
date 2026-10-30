import type * as cheerio from 'cheerio';

/**
 * Deterministic, per-page AEO checks. No network, no AI: everything here is
 * derived from the page HTML so results are reproducible and cheap to rerun.
 */

export type AeoPageKind = 'home' | 'article' | 'page';

export interface AeoPageSignals {
  schemaTypes: string[];
  jsonLdBlocks: number;
  jsonLdParseErrors: number;
  hasFaqContent: boolean;
  directAnswerWords: number | null;
  directAnswerText: string | null;
  questionHeadings: number;
  sectionHeadings: number;
  hasAuthor: boolean;
  hasPublishedDate: boolean;
  hasModifiedDate: boolean;
  hasList: boolean;
  hasTable: boolean;
  wordCount: number;
}

export type AeoCheckId =
  | 'structured_data'
  | 'entity_schema'
  | 'faq_schema'
  | 'direct_answer'
  | 'question_headings'
  | 'authorship'
  | 'freshness'
  | 'extractable_structure'
  | 'content_depth';

export interface AeoCheck {
  id: AeoCheckId;
  label: string;
  weight: number;
  /** false = not relevant for this page, excluded from the score. */
  applicable: boolean;
  passed: boolean;
  detail: string;
  fix: string;
}

export interface AeoPageScan {
  path: string;
  kind: AeoPageKind;
  score: number;
  checks: AeoCheck[];
  signals: AeoPageSignals;
}

const QUESTION_START =
  /^(what|how|why|when|where|who|which|can|does|do|is|are|should|will)\b/i;
const ENTITY_TYPES = new Set([
  'Organization',
  'LocalBusiness',
  'Corporation',
  'WebSite',
  'Person',
  'Product',
  'SoftwareApplication',
  'Service',
]);
const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle', 'TechArticle']);
const ARTICLE_PATH = /(blog|news|article|guide|resources|insights|learn|post)/i;

const DIRECT_ANSWER_MIN = 20;
const DIRECT_ANSWER_MAX = 80;
const DEPTH_MIN_WORDS = 300;

function collectTypes(node: unknown, into: Set<string>) {
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, into);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  const type = record['@type'];
  if (typeof type === 'string') into.add(type);
  else if (Array.isArray(type)) {
    for (const t of type) if (typeof t === 'string') into.add(t);
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') collectTypes(value, into);
  }
}

function wordsOf(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function findDirectAnswer($: cheerio.CheerioAPI): string | null {
  const root = $('main').first().length ? $('main').first() : $('body');
  let found: string | null = null;
  root.find('p').each((_, el) => {
    if (found) return;
    const $el = $(el);
    if ($el.closest('nav, header, footer, aside, form').length) return;
    const text = $el.text().replace(/\s+/g, ' ').trim();
    if (wordsOf(text).length >= 8) found = text;
  });
  return found;
}

export function extractAeoSignals($: cheerio.CheerioAPI): AeoPageSignals {
  const types = new Set<string>();
  let jsonLdBlocks = 0;
  let jsonLdParseErrors = 0;
  let rawJsonLd = '';

  $('script[type="application/ld+json"]').each((_, el) => {
    jsonLdBlocks += 1;
    const raw = $(el).html() ?? '';
    rawJsonLd += raw;
    try {
      collectTypes(JSON.parse(raw), types);
    } catch {
      jsonLdParseErrors += 1;
    }
  });

  const headings = $('h2, h3')
    .toArray()
    .map((el) => $(el).text().replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const questionHeadings = headings.filter((h) => h.endsWith('?') || QUESTION_START.test(h)).length;

  const directAnswerText = findDirectAnswer($);
  const directAnswerWords = directAnswerText ? wordsOf(directAnswerText).length : null;

  const hasAuthor =
    $('meta[name="author"], [rel="author"], [itemprop="author"], [class*="byline"], [class*="author"]')
      .length > 0 || rawJsonLd.includes('"author"');
  const hasPublishedDate =
    $('meta[property="article:published_time"], meta[name="date"], time[datetime]').length > 0 ||
    rawJsonLd.includes('"datePublished"');
  const hasModifiedDate =
    $('meta[property="article:modified_time"], meta[property="og:updated_time"]').length > 0 ||
    rawJsonLd.includes('"dateModified"');

  const bodyClone = $('body').clone();
  bodyClone.find('script, style, noscript, svg, nav, footer').remove();
  const wordCount = wordsOf(bodyClone.text().replace(/\s+/g, ' ').trim()).length;

  const faqHeading = headings.some((h) => /faq|frequently asked/i.test(h));

  return {
    schemaTypes: [...types].toSorted(),
    jsonLdBlocks,
    jsonLdParseErrors,
    hasFaqContent: faqHeading || $('details').length > 0,
    directAnswerWords,
    directAnswerText: directAnswerText ? directAnswerText.slice(0, 280) : null,
    questionHeadings,
    sectionHeadings: headings.length,
    hasAuthor,
    hasPublishedDate,
    hasModifiedDate,
    hasList: $('main ul li, main ol li, body ul li').length >= 3,
    hasTable: $('table').length > 0,
    wordCount,
  };
}

export function classifyPage(path: string, signals: AeoPageSignals): AeoPageKind {
  if (path === '/' || path === '') return 'home';
  if (signals.schemaTypes.some((t) => ARTICLE_TYPES.has(t)) || ARTICLE_PATH.test(path)) {
    return 'article';
  }
  return 'page';
}

export function scoreAeoPage(path: string, signals: AeoPageSignals): AeoPageScan {
  const kind = classifyPage(path, signals);
  const has = (...names: string[]) => signals.schemaTypes.some((t) => names.includes(t));
  const answerWords = signals.directAnswerWords;
  const answerOk =
    answerWords !== null && answerWords >= DIRECT_ANSWER_MIN && answerWords <= DIRECT_ANSWER_MAX;

  const checks: AeoCheck[] = [
    {
      id: 'structured_data',
      label: 'Valid JSON-LD present',
      weight: 18,
      applicable: true,
      passed: signals.jsonLdBlocks > 0 && signals.jsonLdParseErrors === 0,
      detail:
        signals.jsonLdBlocks === 0
          ? 'No JSON-LD found.'
          : signals.jsonLdParseErrors > 0
            ? `${signals.jsonLdParseErrors} JSON-LD block(s) failed to parse.`
            : `Found: ${signals.schemaTypes.join(', ') || 'untyped blocks'}.`,
      fix: 'Add JSON-LD describing what this page is (Article, Product, Service, FAQPage) and validate it in Google’s Rich Results Test.',
    },
    {
      id: 'entity_schema',
      label: 'Business entity declared in schema',
      weight: 12,
      applicable: kind === 'home',
      passed: signals.schemaTypes.some((t) => ENTITY_TYPES.has(t)),
      detail: signals.schemaTypes.some((t) => ENTITY_TYPES.has(t))
        ? 'Organization/Product entity found.'
        : 'No Organization, LocalBusiness, Product or WebSite entity.',
      fix: 'Add Organization (name, url, logo, sameAs profiles) on the homepage so AI engines can resolve who you are.',
    },
    {
      id: 'faq_schema',
      label: 'FAQ content has FAQPage schema',
      weight: 10,
      applicable: signals.hasFaqContent,
      passed: has('FAQPage'),
      detail: has('FAQPage') ? 'FAQPage schema present.' : 'FAQ content found without FAQPage schema.',
      fix: 'Wrap the visible Q&A pairs in FAQPage JSON-LD so each answer is individually quotable.',
    },
    {
      id: 'direct_answer',
      label: `Opens with a direct answer (${DIRECT_ANSWER_MIN}–${DIRECT_ANSWER_MAX} words)`,
      weight: 20,
      applicable: true,
      passed: answerOk,
      detail:
        answerWords === null
          ? 'No opening paragraph found.'
          : `Opening paragraph is ${answerWords} words.`,
      fix: `Lead with a ${DIRECT_ANSWER_MIN}–${DIRECT_ANSWER_MAX} word paragraph that states plainly what this page answers, before any marketing copy.`,
    },
    {
      id: 'question_headings',
      label: 'Question-style headings',
      weight: 14,
      applicable: signals.sectionHeadings >= 2,
      passed: signals.questionHeadings >= 2,
      detail: `${signals.questionHeadings} of ${signals.sectionHeadings} section headings are questions.`,
      fix: 'Rephrase at least two H2/H3s as the question a buyer would ask, then answer it in the first sentence below.',
    },
    {
      id: 'authorship',
      label: 'Author or byline visible',
      weight: 8,
      applicable: kind === 'article',
      passed: signals.hasAuthor,
      detail: signals.hasAuthor ? 'Author signal found.' : 'No author or byline detected.',
      fix: 'Show a named author with credentials and mark it up with the Article author property.',
    },
    {
      id: 'freshness',
      label: 'Published and updated dates',
      weight: 8,
      applicable: kind === 'article',
      passed: signals.hasPublishedDate && signals.hasModifiedDate,
      detail:
        signals.hasPublishedDate && signals.hasModifiedDate
          ? 'Both dates present.'
          : signals.hasPublishedDate
            ? 'Published date found, no modified date.'
            : 'No dates detected.',
      fix: 'Expose datePublished and dateModified in both the page and its schema so engines can judge freshness.',
    },
    {
      id: 'extractable_structure',
      label: 'Lists or tables an engine can lift',
      weight: 6,
      applicable: true,
      passed: signals.hasList || signals.hasTable,
      detail: signals.hasList || signals.hasTable ? 'List or table found.' : 'Only prose found.',
      fix: 'Turn comparisons, steps or specs into a list or table; they are the most frequently quoted formats.',
    },
    {
      id: 'content_depth',
      label: `Enough substance (${DEPTH_MIN_WORDS}+ words)`,
      weight: 6,
      applicable: true,
      passed: signals.wordCount >= DEPTH_MIN_WORDS,
      detail: `${signals.wordCount} words of body content.`,
      fix: 'Cover the topic and its likely follow-up questions on this page rather than leaving gaps for another source.',
    },
  ];

  const applicable = checks.filter((c) => c.applicable);
  const total = applicable.reduce((sum, c) => sum + c.weight, 0);
  const earned = applicable.filter((c) => c.passed).reduce((sum, c) => sum + c.weight, 0);
  const score = total === 0 ? 0 : Math.round((earned / total) * 100);

  return { path, kind, score, checks, signals };
}
