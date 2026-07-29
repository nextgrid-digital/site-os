import { generateGeminiJson, hasGeminiConfig, toPlainError } from '@/lib/ai/gemini';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { ArchitectureInput } from '@/lib/supabase/types';
import {
  classifyWebsite,
  classifyWebsiteSync,
  expectedPageKindsForCategory,
  type SiteClassification,
  type WebsiteCategory,
} from '@/lib/audit/site-classification';

export type PageKind =
  | 'home'
  | 'about'
  | 'services'
  | 'product'
  | 'case_study'
  | 'faq'
  | 'pricing'
  | 'contact'
  | 'blog'
  | 'shop'
  | 'cart'
  | 'location'
  | 'donate'
  | 'curriculum'
  | 'other';

export interface SiteOnlyPageInventoryItem {
  kind: PageKind;
  paths: string[];
  present: boolean;
  expectedForCategory?: boolean;
}

export interface SiteOnlyAnalysis {
  pageInventory: SiteOnlyPageInventoryItem[];
  messagingClarity: string[];
  architectureGaps: string[];
  weakLinkHubs: string[];
  buyerMoments: string[];
  proofGaps: string[];
  conversionBlockers: string[];
  recommendedNextSteps: string[];
  whatTheSiteSays: string[];
  programmaticSuggestions: string[];
  /** Homepage Open Graph / Twitter card image URL when present. */
  ogImageUrl: string | null;
  /** Homepage document title from crawl. */
  homepageTitle: string | null;
  /** Homepage meta description from crawl. */
  homepageMetaDescription: string | null;
  /** Homepage favicon / apple-touch-icon URL when present. */
  faviconUrl: string | null;
  classification: SiteClassification;
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

const ALL_PAGE_KINDS: PageKind[] = [
  'home',
  'about',
  'services',
  'product',
  'case_study',
  'faq',
  'pricing',
  'contact',
  'blog',
  'shop',
  'cart',
  'location',
  'donate',
  'curriculum',
  'other',
];

const PAGE_KIND_RULES: Array<{ kind: PageKind; patterns: RegExp[] }> = [
  { kind: 'home', patterns: [/^\/$/] },
  { kind: 'cart', patterns: [/cart/i, /checkout/i] },
  { kind: 'shop', patterns: [/shop/i, /store/i, /collections?/i, /catalog/i] },
  { kind: 'donate', patterns: [/donate/i, /giving/i, /support-us/i] },
  { kind: 'curriculum', patterns: [/curriculum/i, /course/i, /syllabus/i, /modules?/i, /lessons?/i] },
  { kind: 'location', patterns: [/location/i, /locations/i, /branches?/i, /stores?-near/i] },
  { kind: 'blog', patterns: [/blog/i, /news/i, /articles?/i, /journal/i, /resources?/i] },
  { kind: 'about', patterns: [/about/i, /team/i, /story/i, /mission/i] },
  { kind: 'services', patterns: [/service/i, /solution/i, /capability/i, /offerings?/i] },
  { kind: 'product', patterns: [/product/i, /platform/i, /feature/i] },
  { kind: 'case_study', patterns: [/case[-_]?stud/i, /customer/i, /testimonial/i, /work/i, /portfolio/i, /success/i] },
  { kind: 'faq', patterns: [/faq/i, /help/i, /support/i] },
  { kind: 'pricing', patterns: [/pricing/i, /plans/i] },
  { kind: 'contact', patterns: [/contact/i, /book/i, /demo/i, /get[-_]?started/i, /appoint/i] },
];

function classifyPath(path: string): PageKind {
  for (const rule of PAGE_KIND_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(path))) return rule.kind;
  }
  return 'other';
}

function buildInventory(
  pages: CrawledPage[],
  category: WebsiteCategory
): SiteOnlyPageInventoryItem[] {
  const byKind = new Map<PageKind, string[]>();
  for (const kind of ALL_PAGE_KINDS) {
    byKind.set(kind, []);
  }

  for (const page of pages) {
    const kind = classifyPath(page.path);
    byKind.get(kind)!.push(page.path);
  }

  const expected = new Set(expectedPageKindsForCategory(category));

  return Array.from(byKind.entries()).map(([kind, paths]) => ({
    kind,
    paths,
    present: paths.length > 0,
    expectedForCategory: expected.has(kind),
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
  classification: SiteClassification,
  intake: ArchitectureInput | null
): string[] {
  const gaps: string[] = [];
  const present = new Set(inventory.filter((item) => item.present).map((item) => item.kind));
  const expected = expectedPageKindsForCategory(classification.category);

  for (const kind of expected) {
    if (kind === 'home') continue;
    if (!present.has(kind as PageKind)) {
      gaps.push(`Missing expected ${kind.replace(/_/g, ' ')} page(s) for a ${classification.category} site.`);
    }
  }

  if (intake?.primary_offer && !present.has('services') && !present.has('product') && !present.has('shop')) {
    gaps.push(`Primary offer is stated in intake ("${intake.primary_offer}") but offer pages are thin or missing.`);
  }

  return gaps.slice(0, 10);
}

function weakLinkHubs(pages: CrawledPage[]): string[] {
  return pages
    .filter((page) => page.path !== '/' && page.internalLinks.length < 3)
    .slice(0, 8)
    .map((page) => `${page.path} has only ${page.internalLinks.length} internal link(s).`);
}

function buyerMoments(
  classification: SiteClassification,
  inventory: SiteOnlyPageInventoryItem[]
): string[] {
  const moments: string[] = [];
  const present = new Set(inventory.filter((item) => item.present).map((item) => item.kind));

  moments.push(
    `Inferred conversion goal: ${classification.conversionGoal} (confidence ${classification.conversionGoalConfidence}%).`
  );
  moments.push('Homepage is the primary discovery / first-impression moment.');

  if (present.has('services') || present.has('product') || present.has('shop') || present.has('curriculum')) {
    moments.push('Offer / product pages support solution evaluation.');
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

  switch (classification.conversionGoal) {
    case 'purchase':
    case 'cart':
      moments.push(
        present.has('cart') || present.has('shop') || present.has('pricing')
          ? 'Purchase path pages are present.'
          : 'Purchase path looks weak — no clear shop, cart, or pricing page.'
      );
      break;
    case 'booking':
      moments.push(
        present.has('contact')
          ? 'Booking / contact path is visible.'
          : 'Booking path looks weak — no clear contact or booking page.'
      );
      break;
    case 'signup':
    case 'trial':
    case 'demo':
      moments.push(
        present.has('pricing') || present.has('product') || present.has('contact')
          ? 'Signup / trial / demo path has supporting pages.'
          : 'Signup path looks weak — limited product, pricing, or contact pages.'
      );
      break;
    case 'newsletter':
      moments.push(
        present.has('blog')
          ? 'Content pages support audience capture.'
          : 'Content / subscribe path may be underbuilt.'
      );
      break;
    default:
      moments.push(
        present.has('contact') || present.has('pricing')
          ? 'A conversion page (contact or pricing) is present.'
          : 'Weak conversion path — no clear contact or pricing page.'
      );
  }

  return moments;
}

function proofGaps(
  inventory: SiteOnlyPageInventoryItem[],
  intake: ArchitectureInput | null
): string[] {
  const gaps: string[] = [];
  const hasProofPage = inventory.some((item) => item.kind === 'case_study' && item.present);
  const statedProof = intake?.trust_proof_assets?.trim() || intake?.proof_notes?.trim();

  if (!hasProofPage) {
    gaps.push('Crawl did not find a case study, testimonials, or customer-proof page.');
  }
  if (statedProof && !hasProofPage) {
    gaps.push(
      `Intake lists proof assets ("${statedProof.slice(0, 120)}") but the site crawl does not surface a dedicated proof page.`
    );
  }
  if (!statedProof && !hasProofPage) {
    gaps.push('No dedicated proof page found on-site.');
  }
  return gaps;
}

function conversionBlockers(
  classification: SiteClassification,
  inventory: SiteOnlyPageInventoryItem[],
  messaging: string[],
  proof: string[]
): string[] {
  const blockers: string[] = [];
  const present = new Set(inventory.filter((i) => i.present).map((i) => i.kind));

  if (messaging.some((m) => m.includes('title') || m.includes('H1') || m.includes('meta'))) {
    blockers.push('Weak on-page clarity (titles, meta, or H1s) can block understanding before action.');
  }
  if (proof.length > 0) {
    blockers.push('Weak proof / trust signals can block action.');
  }

  switch (classification.conversionGoal) {
    case 'cart':
    case 'purchase':
      if (!present.has('shop') && !present.has('product') && !present.has('cart')) {
        blockers.push('Purchase path is unclear — missing shop, product, or cart pages.');
      }
      break;
    case 'booking':
      if (!present.has('contact')) {
        blockers.push('Booking path is unclear — no obvious contact / booking page.');
      }
      break;
    case 'signup':
    case 'trial':
    case 'demo':
      if (!present.has('pricing') && !present.has('product') && !present.has('contact')) {
        blockers.push('Signup / trial path is unclear — limited product, pricing, or demo pages.');
      }
      break;
    case 'contact':
    case 'application':
      if (!present.has('contact')) {
        blockers.push('Inquiry path is weak — no clear contact page.');
      }
      break;
    case 'membership':
      if (!present.has('pricing') && !present.has('contact')) {
        blockers.push('Membership join path is unclear.');
      }
      break;
    default:
      if (!present.has('contact') && !present.has('pricing') && !present.has('cart')) {
        blockers.push('Primary action path is hard to find.');
      }
  }

  if (
    (classification.category === 'saas' || classification.category === 'course') &&
    !present.has('pricing')
  ) {
    blockers.push('Pricing is hidden or missing for a category where visitors usually expect it.');
  }

  return blockers.slice(0, 8);
}

function programmaticSuggestions(
  classification: SiteClassification,
  inventory: SiteOnlyPageInventoryItem[]
): string[] {
  const present = new Set(inventory.filter((i) => i.present).map((i) => i.kind));
  const suggestions: string[] = [];

  switch (classification.category) {
    case 'saas':
    case 'app':
      suggestions.push('[Product] for [ICP] landing pages');
      suggestions.push('[Product] vs [competitor] comparison pages');
      suggestions.push('Integration pages for tools your buyers already use');
      if (!present.has('faq')) suggestions.push('FAQ / “what is” glossary pages');
      break;
    case 'service':
    case 'agency':
      suggestions.push('[Service] for [ICP] pages');
      suggestions.push('[Service] vs [alternative] pages');
      suggestions.push('Case study pages by industry');
      break;
    case 'local':
      suggestions.push('[Service] in [location] pages');
      suggestions.push('Location / service area landing pages');
      break;
    case 'ecommerce':
    case 'product_dtc':
      suggestions.push('Category / collection pages');
      suggestions.push('[Product] for [use case] landing pages');
      suggestions.push('Comparison / alternatives pages where relevant');
      break;
    case 'course':
    case 'coaching':
      suggestions.push('[Topic] for [audience] landing pages');
      suggestions.push('Curriculum / module overview pages');
      break;
    case 'marketplace':
      suggestions.push('Category pages for supply and demand sides');
      suggestions.push('Use-case landing pages for each side of the marketplace');
      break;
    case 'media':
    case 'personal_brand':
      suggestions.push('Topic hub pages');
      suggestions.push('Audience-specific lead magnets / landing pages');
      break;
    case 'nonprofit':
      suggestions.push('Impact / program pages');
      suggestions.push('Donation landing pages by cause');
      break;
    case 'community':
      suggestions.push('Membership benefit pages');
      suggestions.push('Audience / segment landing pages');
      break;
    case 'hybrid':
    case 'unknown':
      suggestions.push('Clear offer pages by audience');
      suggestions.push('Proof and FAQ pages to support the main action');
      break;
    default: {
      const _exhaustive: never = classification.category;
      return _exhaustive;
    }
  }

  return suggestions.slice(0, 6);
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

function homepageIdentity(pages: CrawledPage[]): {
  title: string | null;
  metaDescription: string | null;
  faviconUrl: string | null;
} {
  const home = pages.find((page) => page.path === '/') ?? pages[0];
  return {
    title: home?.title ?? null,
    metaDescription: home?.metaDescription ?? null,
    faviconUrl: home?.faviconUrl ?? null,
  };
}

function nextSteps(
  gaps: string[],
  proof: string[],
  messaging: string[],
  blockers: string[],
  classification: SiteClassification
): string[] {
  const steps: string[] = [];
  if (blockers[0]) steps.push(`Unblock conversion first: ${blockers[0]}`);
  if (gaps[0]) steps.push(`Fix first structure gap: ${gaps[0]}`);
  if (proof[0]) steps.push(`Close proof gap: ${proof[0]}`);
  if (messaging.some((line) => line.includes('title') || line.includes('meta'))) {
    steps.push('Tighten titles and meta descriptions on high-intent pages.');
  }
  steps.push(
    `Prioritize fixes that support the inferred goal (${classification.conversionGoal}) for a ${classification.category} site.`
  );
  return steps.slice(0, 6);
}

async function inferWithGemini(input: {
  websiteUrl: string;
  inventory: SiteOnlyPageInventoryItem[];
  whatTheSiteSays: string[];
  architectureGaps: string[];
  classification: SiteClassification;
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
      'You are drafting AEO inferences for a public website audit.',
      'Do NOT invent facts. Only infer from the provided site signals.',
      'Return JSON with keys: businessAppearance (string), aiUnderstandingGaps (string[]), entitySignalGaps (string[]), aeoImprovements (string[]).',
      `Website: ${input.websiteUrl}`,
      `Detected category: ${input.classification.category}`,
      `Business model guess: ${input.classification.businessModel}`,
      `Conversion goal guess: ${input.classification.conversionGoal}`,
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

function assembleAnalysis(
  pages: CrawledPage[],
  classification: SiteClassification,
  intake: ArchitectureInput | null
): Omit<SiteOnlyAnalysis, 'inferred'> {
  const inventory = buildInventory(pages, classification.category);
  const messagingClarity = messagingSignals(pages);
  const architectureGaps = architectureGapsFromInventory(inventory, classification, intake);
  const weakLinks = weakLinkHubs(pages);
  const buyer = buyerMoments(classification, inventory);
  const proof = proofGaps(inventory, intake);
  const blockers = conversionBlockers(classification, inventory, messagingClarity, proof);
  const says = whatTheSiteSays(pages);
  const programmatic = programmaticSuggestions(classification, inventory);
  const home = homepageIdentity(pages);

  return {
    pageInventory: inventory,
    messagingClarity,
    architectureGaps,
    weakLinkHubs: weakLinks,
    buyerMoments: buyer,
    proofGaps: proof,
    conversionBlockers: blockers,
    recommendedNextSteps: nextSteps(architectureGaps, proof, messagingClarity, blockers, classification),
    whatTheSiteSays: says,
    programmaticSuggestions: programmatic,
    ogImageUrl: homepageOgImageUrl(pages),
    homepageTitle: home.title,
    homepageMetaDescription: home.metaDescription,
    faviconUrl: home.faviconUrl,
    classification,
    labels: {
      observed: 'Observed from crawl paths, titles, meta, and links',
      inferred: 'AI inference',
    },
  };
}

export async function buildSiteOnlyAnalysis(input: {
  websiteUrl: string;
  pages: CrawledPage[];
  intake: ArchitectureInput | null;
  includeGeminiInference?: boolean;
  classification?: SiteClassification;
}): Promise<SiteOnlyAnalysis> {
  const classification =
    input.classification ??
    (await classifyWebsite({
      websiteUrl: input.websiteUrl,
      pages: input.pages,
      includeGemini: input.includeGeminiInference !== false,
    }));

  const base = assembleAnalysis(input.pages, classification, input.intake);
  const analysis: SiteOnlyAnalysis = { ...base };

  if (input.includeGeminiInference !== false) {
    analysis.inferred = await inferWithGemini({
      websiteUrl: input.websiteUrl,
      inventory: base.pageInventory,
      whatTheSiteSays: base.whatTheSiteSays,
      architectureGaps: base.architectureGaps,
      classification,
      intake: input.intake,
    });
  }

  return analysis;
}

/** Sync helper for tests — no AI inference. */
export function buildSiteOnlyAnalysisSync(input: {
  pages: CrawledPage[];
  intake: ArchitectureInput | null;
  classification?: SiteClassification;
}): SiteOnlyAnalysis {
  const classification = input.classification ?? classifyWebsiteSync(input.pages);
  return assembleAnalysis(input.pages, classification, input.intake);
}
