import { generateGeminiJson, hasGeminiConfig, toPlainError } from '@/lib/ai/gemini';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { ArchitectureInput } from '@/lib/supabase/types';

export type PageKind =
  | 'home'
  | 'about'
  | 'services'
  | 'product'
  | 'case_study'
  | 'faq'
  | 'pricing'
  | 'contact'
  | 'other';

export interface SiteOnlyPageInventoryItem {
  kind: PageKind;
  paths: string[];
  present: boolean;
}

export interface SiteOnlyAnalysis {
  pageInventory: SiteOnlyPageInventoryItem[];
  messagingClarity: string[];
  architectureGaps: string[];
  weakLinkHubs: string[];
  buyerMoments: string[];
  proofGaps: string[];
  recommendedNextSteps: string[];
  whatTheSiteSays: string[];
  /** Homepage Open Graph / Twitter card image URL when present. */
  ogImageUrl: string | null;
  inferred?: {
    status: 'completed' | 'skipped' | 'failed';
    businessAppearance: string | null;
    aiUnderstandingGaps: string[];
    entitySignalGaps: string[];
    aeoImprovements: string[];
    error_message: string | null;
  };
  labels: {
    observed: string;
    inferred: string;
  };
}

const PAGE_KIND_RULES: Array<{ kind: PageKind; patterns: RegExp[] }> = [
  { kind: 'home', patterns: [/^\/$/] },
  { kind: 'about', patterns: [/about/i, /team/i, /story/i] },
  { kind: 'services', patterns: [/service/i, /solution/i, /capability/i] },
  { kind: 'product', patterns: [/product/i, /platform/i, /feature/i] },
  { kind: 'case_study', patterns: [/case[-_]?stud/i, /customer/i, /testimonial/i, /work/i, /portfolio/i] },
  { kind: 'faq', patterns: [/faq/i, /help/i, /support/i] },
  { kind: 'pricing', patterns: [/pricing/i, /plans/i] },
  { kind: 'contact', patterns: [/contact/i, /book/i, /demo/i, /get[-_]?started/i] },
];

function classifyPath(path: string): PageKind {
  for (const rule of PAGE_KIND_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(path))) return rule.kind;
  }
  return 'other';
}

function buildInventory(pages: CrawledPage[]): SiteOnlyPageInventoryItem[] {
  const byKind = new Map<PageKind, string[]>();
  for (const kind of [
    'home',
    'about',
    'services',
    'product',
    'case_study',
    'faq',
    'pricing',
    'contact',
    'other',
  ] as PageKind[]) {
    byKind.set(kind, []);
  }

  for (const page of pages) {
    const kind = classifyPath(page.path);
    byKind.get(kind)!.push(page.path);
  }

  return Array.from(byKind.entries()).map(([kind, paths]) => ({
    kind,
    paths,
    present: paths.length > 0,
  }));
}

function messagingSignals(pages: CrawledPage[]): string[] {
  const signals: string[] = [];
  const weakTitles = pages.filter((page) => !page.title || page.title.length < 20);
  const weakMeta = pages.filter((page) => !page.metaDescription || page.metaDescription.length < 70);
  const missingH1 = pages.filter((page) => !page.h1);

  if (weakTitles.length > 0) {
    signals.push(`${weakTitles.length} page(s) have missing or short titles.`);
  }
  if (weakMeta.length > 0) {
    signals.push(`${weakMeta.length} page(s) have missing or short meta descriptions.`);
  }
  if (missingH1.length > 0) {
    signals.push(`${missingH1.length} page(s) are missing an H1.`);
  }
  if (signals.length === 0) {
    signals.push('Titles, meta descriptions, and H1s look present on crawled pages.');
  }
  return signals;
}

function architectureGapsFromInventory(
  inventory: SiteOnlyPageInventoryItem[],
  intake: ArchitectureInput | null
): string[] {
  const gaps: string[] = [];
  const present = new Set(inventory.filter((item) => item.present).map((item) => item.kind));

  if (!present.has('faq')) gaps.push('No dedicated FAQ / help page found in the crawl.');
  if (!present.has('case_study')) gaps.push('No case study / proof page found in the crawl.');
  if (!present.has('about')) gaps.push('No about / company page found in the crawl.');
  if (!present.has('services') && !present.has('product')) {
    gaps.push('No clear services or product page found in the crawl.');
  }
  if (!present.has('pricing') && intake?.site_type?.toLowerCase().includes('saas')) {
    gaps.push('SaaS-style site without a visible pricing page.');
  }
  if (intake?.primary_offer && !present.has('services') && !present.has('product')) {
    gaps.push(`Primary offer is stated in intake ("${intake.primary_offer}") but offer pages are thin or missing.`);
  }
  return gaps;
}

function weakLinkHubs(pages: CrawledPage[]): string[] {
  return pages
    .filter((page) => page.path !== '/' && page.internalLinks.length < 3)
    .slice(0, 8)
    .map((page) => `${page.path} has only ${page.internalLinks.length} internal link(s).`);
}

function buyerMoments(intake: ArchitectureInput | null, inventory: SiteOnlyPageInventoryItem[]): string[] {
  const moments: string[] = [];
  const present = new Set(inventory.filter((item) => item.present).map((item) => item.kind));
  const goal = intake?.conversion_goal?.trim();

  if (goal) {
    moments.push(`Stated conversion goal: ${goal}.`);
  } else {
    moments.push('No conversion goal in intake — buyer moments inferred from page types only.');
  }

  if (present.has('home')) moments.push('Homepage is the primary discovery / first-impression moment.');
  if (present.has('services') || present.has('product')) {
    moments.push('Offer pages support solution evaluation.');
  } else {
    moments.push('Missing offer pages weaken the evaluate-solution moment.');
  }
  if (present.has('case_study')) {
    moments.push('Proof pages support trust validation.');
  } else {
    moments.push('Missing proof pages leave the trust-validation moment unsupported.');
  }
  if (present.has('faq')) {
    moments.push('FAQ supports objection handling.');
  } else {
    moments.push('Missing FAQ leaves objection handling unsupported.');
  }
  if (present.has('contact') || present.has('pricing')) {
    moments.push('Contact / pricing supports conversion intent.');
  } else {
    moments.push('Weak conversion path — no clear contact or pricing page.');
  }

  return moments;
}

function proofGaps(intake: ArchitectureInput | null, inventory: SiteOnlyPageInventoryItem[]): string[] {
  const gaps: string[] = [];
  const hasProofPage = inventory.some((item) => item.kind === 'case_study' && item.present);
  const statedProof = intake?.trust_proof_assets?.trim() || intake?.proof_notes?.trim();

  if (!hasProofPage) {
    gaps.push('Crawl did not find a case study, testimonials, or customer-proof page.');
  }
  if (statedProof && !hasProofPage) {
    gaps.push(`Intake lists proof assets ("${statedProof.slice(0, 120)}") but the site crawl does not surface a dedicated proof page.`);
  }
  if (!statedProof && !hasProofPage) {
    gaps.push('No proof assets recorded in intake and none found on-site.');
  }
  return gaps;
}

function whatTheSiteSays(pages: CrawledPage[]): string[] {
  const lines: string[] = [];
  const home = pages.find((page) => page.path === '/') ?? pages[0];
  if (home?.title) lines.push(`Homepage title: ${home.title}`);
  if (home?.h1) lines.push(`Homepage H1: ${home.h1}`);
  if (home?.metaDescription) lines.push(`Homepage meta: ${home.metaDescription}`);

  for (const page of pages.slice(0, 12)) {
    if (page.path === home?.path) continue;
    if (page.title) lines.push(`${page.path}: ${page.title}`);
  }

  if (lines.length === 0) {
    lines.push('Crawl returned pages but little readable title/meta content.');
  }
  return lines.slice(0, 16);
}

function homepageOgImageUrl(pages: CrawledPage[]): string | null {
  const home = pages.find((page) => page.path === '/') ?? pages[0];
  return home?.ogImageUrl ?? null;
}

function nextSteps(
  gaps: string[],
  proof: string[],
  messaging: string[],
  intake: ArchitectureInput | null
): string[] {
  const steps: string[] = [];
  if (gaps[0]) steps.push(`Fix first architecture gap: ${gaps[0]}`);
  if (proof[0]) steps.push(`Close proof gap: ${proof[0]}`);
  if (messaging.some((line) => line.includes('title') || line.includes('meta'))) {
    steps.push('Tighten titles and meta descriptions on high-intent pages.');
  }
  if (!intake?.primary_offer || !intake?.primary_icp) {
    steps.push('Complete project intake (offer + ICP) so recommendations stay grounded.');
  }
  if (!intake?.conversion_goal) {
    steps.push('Define the primary conversion goal in Settings.');
  }
  steps.push('Connect Search Console and GA4 when available for demand and engagement depth.');
  return steps.slice(0, 6);
}

async function inferWithGemini(input: {
  websiteUrl: string;
  inventory: SiteOnlyPageInventoryItem[];
  whatTheSiteSays: string[];
  architectureGaps: string[];
  intake: ArchitectureInput | null;
}): Promise<SiteOnlyAnalysis['inferred']> {
  if (!hasGeminiConfig()) {
    return {
      status: 'skipped',
      businessAppearance: null,
      aiUnderstandingGaps: [],
      entitySignalGaps: [],
      aeoImprovements: [],
      error_message: 'AI provider is not configured.',
    };
  }

  try {
    const prompt = [
      'You are drafting AEO inferences for an internal website audit.',
      'Do NOT invent facts. Only infer from the provided site signals.',
      'Return JSON with keys: businessAppearance (string), aiUnderstandingGaps (string[]), entitySignalGaps (string[]), aeoImprovements (string[]).',
      `Website: ${input.websiteUrl}`,
      `Intake primary offer: ${input.intake?.primary_offer ?? 'unknown'}`,
      `Intake ICP: ${input.intake?.primary_icp ?? 'unknown'}`,
      `Page kinds present: ${input.inventory.filter((i) => i.present).map((i) => i.kind).join(', ')}`,
      `Site says: ${input.whatTheSiteSays.slice(0, 10).join(' | ')}`,
      `Architecture gaps: ${input.architectureGaps.join(' | ') || 'none listed'}`,
    ].join('\n');

    const { text } = await generateGeminiJson(prompt, { maxOutputTokens: 1024, timeoutMs: 60_000 });
    const parsed = JSON.parse(text) as {
      businessAppearance?: string;
      aiUnderstandingGaps?: string[];
      entitySignalGaps?: string[];
      aeoImprovements?: string[];
    };

    return {
      status: 'completed',
      businessAppearance: parsed.businessAppearance ?? null,
      aiUnderstandingGaps: parsed.aiUnderstandingGaps ?? [],
      entitySignalGaps: parsed.entitySignalGaps ?? [],
      aeoImprovements: parsed.aeoImprovements ?? [],
      error_message: null,
    };
  } catch (error) {
    return {
      status: 'failed',
      businessAppearance: null,
      aiUnderstandingGaps: [],
      entitySignalGaps: [],
      aeoImprovements: [],
      error_message: toPlainError(error, 'Site-only AEO inference failed.').message,
    };
  }
}

export async function buildSiteOnlyAnalysis(input: {
  websiteUrl: string;
  pages: CrawledPage[];
  intake: ArchitectureInput | null;
  includeGeminiInference?: boolean;
}): Promise<SiteOnlyAnalysis> {
  const inventory = buildInventory(input.pages);
  const messagingClarity = messagingSignals(input.pages);
  const architectureGaps = architectureGapsFromInventory(inventory, input.intake);
  const weakLinks = weakLinkHubs(input.pages);
  const buyer = buyerMoments(input.intake, inventory);
  const proof = proofGaps(input.intake, inventory);
  const says = whatTheSiteSays(input.pages);
  const recommendedNextSteps = nextSteps(architectureGaps, proof, messagingClarity, input.intake);

  const analysis: SiteOnlyAnalysis = {
    pageInventory: inventory,
    messagingClarity,
    architectureGaps,
    weakLinkHubs: weakLinks,
    buyerMoments: buyer,
    proofGaps: proof,
    recommendedNextSteps,
    whatTheSiteSays: says,
    ogImageUrl: homepageOgImageUrl(input.pages),
    labels: {
      observed: 'Observed from crawl, sitemap paths, titles, meta, and links',
      inferred: 'AI inference',
    },
  };

  if (input.includeGeminiInference !== false) {
    analysis.inferred = await inferWithGemini({
      websiteUrl: input.websiteUrl,
      inventory,
      whatTheSiteSays: says,
      architectureGaps,
      intake: input.intake,
    });
  }

  return analysis;
}

/** Sync helper for tests — no AI inference. */
export function buildSiteOnlyAnalysisSync(input: {
  pages: CrawledPage[];
  intake: ArchitectureInput | null;
}): SiteOnlyAnalysis {
  const inventory = buildInventory(input.pages);
  const messagingClarity = messagingSignals(input.pages);
  const architectureGaps = architectureGapsFromInventory(inventory, input.intake);
  const weakLinks = weakLinkHubs(input.pages);
  const buyer = buyerMoments(input.intake, inventory);
  const proof = proofGaps(input.intake, inventory);
  const says = whatTheSiteSays(input.pages);
  return {
    pageInventory: inventory,
    messagingClarity,
    architectureGaps,
    weakLinkHubs: weakLinks,
    buyerMoments: buyer,
    proofGaps: proof,
    recommendedNextSteps: nextSteps(architectureGaps, proof, messagingClarity, input.intake),
    whatTheSiteSays: says,
    ogImageUrl: homepageOgImageUrl(input.pages),
    labels: {
      observed: 'Observed from crawl, sitemap paths, titles, meta, and links',
      inferred: 'AI inference',
    },
  };
}
