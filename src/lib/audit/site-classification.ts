import { generateGeminiJson, hasGeminiConfig } from '@/lib/ai/gemini';
import type { CrawledPage } from '@/lib/crawl/site-crawler';

export type WebsiteCategory =
  | 'saas'
  | 'service'
  | 'ecommerce'
  | 'course'
  | 'coaching'
  | 'agency'
  | 'local'
  | 'marketplace'
  | 'community'
  | 'media'
  | 'personal_brand'
  | 'nonprofit'
  | 'app'
  | 'product_dtc'
  | 'hybrid'
  | 'unknown';

export type BusinessModelGuess =
  | 'subscription'
  | 'service_lead_gen'
  | 'one_time'
  | 'ecommerce'
  | 'course'
  | 'membership'
  | 'booking'
  | 'free_trial'
  | 'freemium'
  | 'donation'
  | 'hybrid'
  | 'unknown';

export type ConversionGoalGuess =
  | 'contact'
  | 'booking'
  | 'demo'
  | 'trial'
  | 'signup'
  | 'purchase'
  | 'cart'
  | 'newsletter'
  | 'chat'
  | 'download'
  | 'application'
  | 'membership'
  | 'unknown';

export interface SiteClassification {
  category: WebsiteCategory;
  categoryConfidence: number;
  categoryEvidence: string[];
  categoryNotes: string | null;
  fallbackCategory: 'hybrid' | 'unknown';
  businessModel: BusinessModelGuess;
  businessModelConfidence: number;
  conversionGoal: ConversionGoalGuess;
  conversionGoalConfidence: number;
}

const CATEGORIES: WebsiteCategory[] = [
  'saas',
  'service',
  'ecommerce',
  'course',
  'coaching',
  'agency',
  'local',
  'marketplace',
  'community',
  'media',
  'personal_brand',
  'nonprofit',
  'app',
  'product_dtc',
  'hybrid',
  'unknown',
];

const BUSINESS_MODELS: BusinessModelGuess[] = [
  'subscription',
  'service_lead_gen',
  'one_time',
  'ecommerce',
  'course',
  'membership',
  'booking',
  'free_trial',
  'freemium',
  'donation',
  'hybrid',
  'unknown',
];

const CONVERSION_GOALS: ConversionGoalGuess[] = [
  'contact',
  'booking',
  'demo',
  'trial',
  'signup',
  'purchase',
  'cart',
  'newsletter',
  'chat',
  'download',
  'application',
  'membership',
  'unknown',
];

function clampConfidence(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function pageCorpus(pages: CrawledPage[]): string {
  return pages
    .slice(0, 40)
    .map((p) => `${p.path} ${p.title ?? ''} ${p.h1 ?? ''} ${p.metaDescription ?? ''}`)
    .join('\n')
    .toLowerCase();
}

type ScoreBucket = { score: number; evidence: string[] };

function bump(bucket: ScoreBucket, points: number, evidence: string) {
  bucket.score += points;
  if (evidence && !bucket.evidence.includes(evidence)) {
    bucket.evidence.push(evidence);
  }
}

function heuristicClassify(pages: CrawledPage[]): SiteClassification {
  const corpus = pageCorpus(pages);
  const paths = pages.map((p) => p.path.toLowerCase()).join(' ');

  const categoryScores = new Map<WebsiteCategory, ScoreBucket>();
  for (const cat of CATEGORIES) {
    categoryScores.set(cat, { score: 0, evidence: [] });
  }

  const modelScores = new Map<BusinessModelGuess, ScoreBucket>();
  for (const m of BUSINESS_MODELS) {
    modelScores.set(m, { score: 0, evidence: [] });
  }

  const goalScores = new Map<ConversionGoalGuess, ScoreBucket>();
  for (const g of CONVERSION_GOALS) {
    goalScores.set(g, { score: 0, evidence: [] });
  }

  const ecommerce = categoryScores.get('ecommerce')!;
  const saas = categoryScores.get('saas')!;
  const service = categoryScores.get('service')!;
  const course = categoryScores.get('course')!;
  const coaching = categoryScores.get('coaching')!;
  const agency = categoryScores.get('agency')!;
  const local = categoryScores.get('local')!;
  const marketplace = categoryScores.get('marketplace')!;
  const community = categoryScores.get('community')!;
  const media = categoryScores.get('media')!;
  const personal = categoryScores.get('personal_brand')!;
  const nonprofit = categoryScores.get('nonprofit')!;
  const app = categoryScores.get('app')!;
  const productDtc = categoryScores.get('product_dtc')!;

  if (/\/(cart|checkout|collections?|products?|shop)\b/.test(paths) || /\badd to cart\b|\bshop now\b|\bfree shipping\b/.test(corpus)) {
    bump(ecommerce, 35, 'Shop/cart/product commerce signals');
    bump(modelScores.get('ecommerce')!, 30, 'Ecommerce purchase language');
    bump(goalScores.get('cart')!, 25, 'Cart / purchase path signals');
    bump(goalScores.get('purchase')!, 20, 'Purchase intent language');
  }

  if (/\b(saas|software|platform|dashboard|api)\b/.test(corpus) || /\/(pricing|plans|features|integrations?)\b/.test(paths)) {
    bump(saas, 28, 'Software / pricing / platform signals');
    bump(modelScores.get('subscription')!, 18, 'Likely subscription software');
    bump(goalScores.get('signup')!, 12, 'Product signup path likely');
  }
  if (/\b(free trial|start free|start your free)\b/.test(corpus)) {
    bump(saas, 18, 'Free trial language');
    bump(app, 10, 'App/trial language');
    bump(modelScores.get('free_trial')!, 28, 'Free trial model');
    bump(goalScores.get('trial')!, 30, 'Trial CTA');
  }
  if (/\b(freemium|free forever|free plan)\b/.test(corpus)) {
    bump(saas, 12, 'Freemium language');
    bump(modelScores.get('freemium')!, 24, 'Freemium model');
  }
  if (/\b(book a demo|request a demo|schedule a demo)\b/.test(corpus)) {
    bump(saas, 14, 'Demo request language');
    bump(agency, 6, 'Demo / inquiry language');
    bump(goalScores.get('demo')!, 28, 'Demo conversion goal');
  }

  if (/\b(services?|consulting|we help|our process)\b/.test(corpus) || /\/services?\b/.test(paths)) {
    bump(service, 24, 'Service offering signals');
    bump(modelScores.get('service_lead_gen')!, 22, 'Service lead-gen model');
    bump(goalScores.get('contact')!, 16, 'Contact / inquiry goal');
  }
  if (/\b(agency|studio|creative|branding agency|marketing agency)\b/.test(corpus)) {
    bump(agency, 30, 'Agency positioning');
    bump(modelScores.get('service_lead_gen')!, 18, 'Agency lead-gen');
    bump(goalScores.get('contact')!, 14, 'Inquiry path');
  }
  if (/\b(near me|hours|directions|serving|local|clinic|dentist|plumber|restaurant)\b/.test(corpus) || /\/(locations?|contact)\b/.test(paths)) {
    bump(local, 26, 'Local business signals');
    bump(modelScores.get('booking')!, 14, 'Local booking model');
    bump(goalScores.get('booking')!, 16, 'Booking / contact path');
    bump(goalScores.get('contact')!, 10, 'Contact path');
  }
  if (/\b(book (a |an )?(call|appointment|consult)|schedule|calendly)\b/.test(corpus)) {
    bump(local, 10, 'Appointment booking language');
    bump(coaching, 10, 'Call booking language');
    bump(service, 8, 'Booking language');
    bump(modelScores.get('booking')!, 24, 'Booking model');
    bump(goalScores.get('booking')!, 28, 'Booking CTA');
  }

  if (/\b(course|curriculum|cohort|lesson|module|enroll)\b/.test(corpus) || /\/(course|curriculum|learn)\b/.test(paths)) {
    bump(course, 32, 'Course / curriculum signals');
    bump(modelScores.get('course')!, 26, 'Course model');
    bump(goalScores.get('purchase')!, 14, 'Enrollment purchase');
    bump(goalScores.get('signup')!, 10, 'Enrollment signup');
  }
  if (/\b(coach|coaching|mentorship|1:1|one-on-one)\b/.test(corpus)) {
    bump(coaching, 30, 'Coaching signals');
    bump(modelScores.get('booking')!, 16, 'Coaching booking');
    bump(goalScores.get('booking')!, 18, 'Book a call');
  }

  if (/\b(marketplace|vendors?|buyers? and sellers?|listings)\b/.test(corpus)) {
    bump(marketplace, 32, 'Marketplace signals');
    bump(modelScores.get('hybrid')!, 12, 'Two-sided marketplace');
    bump(goalScores.get('signup')!, 14, 'Marketplace signup');
  }
  if (/\b(community|members?|forum|discord|slack community)\b/.test(corpus) || /\/(community|members)\b/.test(paths)) {
    bump(community, 28, 'Community signals');
    bump(modelScores.get('membership')!, 22, 'Membership model');
    bump(goalScores.get('membership')!, 24, 'Join membership');
  }
  if (/\b(blog|newsletter|subscribe|magazine|journal|articles?)\b/.test(corpus) || /\/(blog|news|articles?)\b/.test(paths)) {
    bump(media, 22, 'Media / content signals');
    bump(goalScores.get('newsletter')!, 20, 'Newsletter signup');
  }
  if (/\b(donate|donation|nonprofit|charity|mission|impact)\b/.test(corpus) || /\/donate\b/.test(paths)) {
    bump(nonprofit, 34, 'Nonprofit / donate signals');
    bump(modelScores.get('donation')!, 30, 'Donation model');
    bump(goalScores.get('purchase')!, 8, 'Donate action');
  }
  if (/\b(i help|my story|about me|personal brand|creator)\b/.test(corpus)) {
    bump(personal, 24, 'Personal brand signals');
    bump(goalScores.get('newsletter')!, 8, 'Audience capture');
    bump(goalScores.get('booking')!, 8, 'Personal booking');
  }
  if (/\b(download (the )?app|app store|google play|mobile app)\b/.test(corpus)) {
    bump(app, 28, 'App download signals');
    bump(goalScores.get('download')!, 26, 'App download goal');
  }
  if (/\b(buy now|limited edition|shipped|skincare|apparel|handmade)\b/.test(corpus) && ecommerce.score < 20) {
    bump(productDtc, 22, 'DTC product signals');
    bump(modelScores.get('one_time')!, 16, 'One-time product purchase');
    bump(goalScores.get('purchase')!, 18, 'Purchase CTA');
  }
  if (/\b(whatsapp|live chat|chat with us)\b/.test(corpus)) {
    bump(goalScores.get('chat')!, 20, 'Chat CTA');
  }
  if (/\b(apply now|application|waitlist)\b/.test(corpus)) {
    bump(goalScores.get('application')!, 22, 'Application CTA');
  }
  if (/\b(sign up|create account|get started)\b/.test(corpus)) {
    bump(goalScores.get('signup')!, 12, 'Signup language');
  }
  if (/\b(contact us|get in touch|request a quote)\b/.test(corpus)) {
    bump(goalScores.get('contact')!, 14, 'Contact CTA');
  }

  const rankedCategories = [...categoryScores.entries()]
    .filter(([key]) => key !== 'hybrid' && key !== 'unknown')
    .sort((a, b) => b[1].score - a[1].score);

  const top = rankedCategories[0];
  const second = rankedCategories[1];
  const topScore = top?.[1].score ?? 0;
  const secondScore = second?.[1].score ?? 0;

  let category: WebsiteCategory = 'unknown';
  let categoryConfidence = 35;
  let categoryEvidence: string[] = [];
  let categoryNotes: string | null = null;
  let fallbackCategory: 'hybrid' | 'unknown' = 'unknown';

  if (topScore < 18) {
    category = 'unknown';
    categoryConfidence = 30;
    categoryNotes = 'Signals were too weak to confidently classify this website.';
    fallbackCategory = 'unknown';
    categoryEvidence = ['Insufficient category signals in crawl'];
  } else if (secondScore > 0 && topScore - secondScore < 10) {
    category = 'hybrid';
    categoryConfidence = clampConfidence(45 + Math.min(20, topScore / 3));
    categoryNotes = `Mixed signals between ${top![0]} and ${second![0]}; treating as hybrid.`;
    fallbackCategory = 'hybrid';
    categoryEvidence = [...top![1].evidence.slice(0, 3), ...second![1].evidence.slice(0, 2)];
  } else {
    category = top![0];
    categoryConfidence = clampConfidence(50 + Math.min(40, topScore));
    categoryEvidence = top![1].evidence.slice(0, 6);
    categoryNotes = null;
    fallbackCategory = 'hybrid';
  }

  const rankedModels = [...modelScores.entries()].sort((a, b) => b[1].score - a[1].score);
  const rankedGoals = [...goalScores.entries()].sort((a, b) => b[1].score - a[1].score);

  let businessModel: BusinessModelGuess = rankedModels[0]?.[0] ?? 'unknown';
  let businessModelConfidence = clampConfidence(40 + (rankedModels[0]?.[1].score ?? 0));
  if ((rankedModels[0]?.[1].score ?? 0) < 12) {
    businessModel = categoryDefaultModel(category);
    businessModelConfidence = 40;
  }

  let conversionGoal: ConversionGoalGuess = rankedGoals[0]?.[0] ?? 'unknown';
  let conversionGoalConfidence = clampConfidence(40 + (rankedGoals[0]?.[1].score ?? 0));
  if ((rankedGoals[0]?.[1].score ?? 0) < 10) {
    conversionGoal = categoryDefaultGoal(category);
    conversionGoalConfidence = 40;
  }

  return {
    category,
    categoryConfidence,
    categoryEvidence,
    categoryNotes,
    fallbackCategory,
    businessModel,
    businessModelConfidence,
    conversionGoal,
    conversionGoalConfidence,
  };
}

function categoryDefaultModel(category: WebsiteCategory): BusinessModelGuess {
  switch (category) {
    case 'saas':
    case 'app':
      return 'subscription';
    case 'service':
    case 'agency':
      return 'service_lead_gen';
    case 'ecommerce':
    case 'product_dtc':
      return 'ecommerce';
    case 'course':
      return 'course';
    case 'coaching':
    case 'local':
      return 'booking';
    case 'community':
      return 'membership';
    case 'nonprofit':
      return 'donation';
    case 'media':
    case 'personal_brand':
      return 'hybrid';
    case 'marketplace':
      return 'hybrid';
    case 'hybrid':
      return 'hybrid';
    case 'unknown':
      return 'unknown';
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

function categoryDefaultGoal(category: WebsiteCategory): ConversionGoalGuess {
  switch (category) {
    case 'saas':
      return 'signup';
    case 'app':
      return 'download';
    case 'service':
    case 'agency':
      return 'contact';
    case 'ecommerce':
    case 'product_dtc':
      return 'purchase';
    case 'course':
      return 'purchase';
    case 'coaching':
    case 'local':
      return 'booking';
    case 'community':
      return 'membership';
    case 'nonprofit':
      return 'purchase';
    case 'media':
    case 'personal_brand':
      return 'newsletter';
    case 'marketplace':
      return 'signup';
    case 'hybrid':
    case 'unknown':
      return 'unknown';
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

function asCategory(value: unknown): WebsiteCategory | null {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value)
    ? (value as WebsiteCategory)
    : null;
}

function asModel(value: unknown): BusinessModelGuess | null {
  return typeof value === 'string' && (BUSINESS_MODELS as string[]).includes(value)
    ? (value as BusinessModelGuess)
    : null;
}

function asGoal(value: unknown): ConversionGoalGuess | null {
  return typeof value === 'string' && (CONVERSION_GOALS as string[]).includes(value)
    ? (value as ConversionGoalGuess)
    : null;
}

async function refineWithGemini(
  pages: CrawledPage[],
  heuristic: SiteClassification,
  websiteUrl: string
): Promise<SiteClassification> {
  if (!hasGeminiConfig()) return heuristic;

  try {
    const sample = pages.slice(0, 20).map((p) => ({
      path: p.path,
      title: p.title,
      h1: p.h1,
      meta: p.metaDescription,
    }));
    const prompt = [
      'Classify this public website. Do NOT invent facts. Only use provided crawl signals.',
      'Return JSON with keys:',
      'category (one of: saas,service,ecommerce,course,coaching,agency,local,marketplace,community,media,personal_brand,nonprofit,app,product_dtc,hybrid,unknown),',
      'categoryConfidence (0-100), categoryEvidence (string[]), categoryNotes (string|null),',
      'businessModel (one of: subscription,service_lead_gen,one_time,ecommerce,course,membership,booking,free_trial,freemium,donation,hybrid,unknown),',
      'businessModelConfidence (0-100),',
      'conversionGoal (one of: contact,booking,demo,trial,signup,purchase,cart,newsletter,chat,download,application,membership,unknown),',
      'conversionGoalConfidence (0-100).',
      `Website: ${websiteUrl}`,
      `Heuristic guess: ${JSON.stringify(heuristic)}`,
      `Pages: ${JSON.stringify(sample)}`,
    ].join('\n');

    const { text } = await generateGeminiJson(prompt, { maxOutputTokens: 1024, timeoutMs: 45_000 });
    const parsed = JSON.parse(text) as Record<string, unknown>;

    const category = asCategory(parsed.category) ?? heuristic.category;
    const businessModel = asModel(parsed.businessModel) ?? heuristic.businessModel;
    const conversionGoal = asGoal(parsed.conversionGoal) ?? heuristic.conversionGoal;
    const evidence = Array.isArray(parsed.categoryEvidence)
      ? parsed.categoryEvidence.filter((e): e is string => typeof e === 'string').slice(0, 8)
      : heuristic.categoryEvidence;

    return {
      category,
      categoryConfidence: clampConfidence(
        typeof parsed.categoryConfidence === 'number'
          ? parsed.categoryConfidence
          : heuristic.categoryConfidence
      ),
      categoryEvidence: evidence.length ? evidence : heuristic.categoryEvidence,
      categoryNotes:
        typeof parsed.categoryNotes === 'string'
          ? parsed.categoryNotes
          : parsed.categoryNotes === null
            ? null
            : heuristic.categoryNotes,
      fallbackCategory: category === 'unknown' ? 'unknown' : 'hybrid',
      businessModel,
      businessModelConfidence: clampConfidence(
        typeof parsed.businessModelConfidence === 'number'
          ? parsed.businessModelConfidence
          : heuristic.businessModelConfidence
      ),
      conversionGoal,
      conversionGoalConfidence: clampConfidence(
        typeof parsed.conversionGoalConfidence === 'number'
          ? parsed.conversionGoalConfidence
          : heuristic.conversionGoalConfidence
      ),
    };
  } catch {
    return heuristic;
  }
}

export async function classifyWebsite(input: {
  websiteUrl: string;
  pages: CrawledPage[];
  includeGemini?: boolean;
}): Promise<SiteClassification> {
  const heuristic = heuristicClassify(input.pages);
  if (input.includeGemini === false) return heuristic;
  return refineWithGemini(input.pages, heuristic, input.websiteUrl);
}

export function classifyWebsiteSync(pages: CrawledPage[]): SiteClassification {
  return heuristicClassify(pages);
}

export function categoryLabel(category: WebsiteCategory): string {
  switch (category) {
    case 'saas':
      return 'SaaS';
    case 'service':
      return 'Service business';
    case 'ecommerce':
      return 'Ecommerce';
    case 'course':
      return 'Course / info product';
    case 'coaching':
      return 'Coaching';
    case 'agency':
      return 'Agency';
    case 'local':
      return 'Local business';
    case 'marketplace':
      return 'Marketplace';
    case 'community':
      return 'Community';
    case 'media':
      return 'Media / blog';
    case 'personal_brand':
      return 'Personal brand';
    case 'nonprofit':
      return 'Nonprofit';
    case 'app':
      return 'App';
    case 'product_dtc':
      return 'Product / DTC';
    case 'hybrid':
      return 'Hybrid';
    case 'unknown':
      return 'Unclear';
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export function businessModelLabel(model: BusinessModelGuess): string {
  switch (model) {
    case 'subscription':
      return 'Software subscription';
    case 'service_lead_gen':
      return 'Service lead generation';
    case 'one_time':
      return 'One-time purchase';
    case 'ecommerce':
      return 'Ecommerce product sales';
    case 'course':
      return 'Course / info product';
    case 'membership':
      return 'Membership';
    case 'booking':
      return 'Booking / appointment';
    case 'free_trial':
      return 'Free trial';
    case 'freemium':
      return 'Freemium';
    case 'donation':
      return 'Donation';
    case 'hybrid':
      return 'Hybrid model';
    case 'unknown':
      return 'Unclear model';
    default: {
      const _exhaustive: never = model;
      return _exhaustive;
    }
  }
}

export function conversionGoalLabel(goal: ConversionGoalGuess): string {
  switch (goal) {
    case 'contact':
      return 'Contact / inquiry';
    case 'booking':
      return 'Call / appointment booking';
    case 'demo':
      return 'Demo request';
    case 'trial':
      return 'Free trial';
    case 'signup':
      return 'Signup';
    case 'purchase':
      return 'Purchase';
    case 'cart':
      return 'Add to cart';
    case 'newsletter':
      return 'Newsletter signup';
    case 'chat':
      return 'Chat / WhatsApp';
    case 'download':
      return 'Download';
    case 'application':
      return 'Application';
    case 'membership':
      return 'Membership join';
    case 'unknown':
      return 'Unclear conversion';
    default: {
      const _exhaustive: never = goal;
      return _exhaustive;
    }
  }
}

/** Expected page kinds for a category (used by site-only gaps). */
export function expectedPageKindsForCategory(category: WebsiteCategory): string[] {
  switch (category) {
    case 'saas':
      return ['home', 'product', 'pricing', 'about', 'case_study', 'faq', 'contact'];
    case 'service':
      return ['home', 'services', 'about', 'case_study', 'contact', 'faq'];
    case 'ecommerce':
      return ['home', 'shop', 'product', 'cart', 'about', 'faq', 'contact'];
    case 'course':
      return ['home', 'curriculum', 'about', 'case_study', 'pricing', 'contact', 'faq'];
    case 'coaching':
      return ['home', 'about', 'services', 'case_study', 'contact', 'faq'];
    case 'agency':
      return ['home', 'services', 'case_study', 'about', 'contact', 'faq'];
    case 'local':
      return ['home', 'services', 'location', 'about', 'contact', 'faq'];
    case 'marketplace':
      return ['home', 'shop', 'product', 'about', 'faq', 'contact'];
    case 'community':
      return ['home', 'about', 'faq', 'contact', 'blog'];
    case 'media':
      return ['home', 'blog', 'about', 'contact'];
    case 'personal_brand':
      return ['home', 'about', 'blog', 'contact', 'case_study'];
    case 'nonprofit':
      return ['home', 'about', 'donate', 'case_study', 'contact', 'faq'];
    case 'app':
      return ['home', 'product', 'pricing', 'faq', 'contact'];
    case 'product_dtc':
      return ['home', 'product', 'shop', 'about', 'faq', 'contact'];
    case 'hybrid':
    case 'unknown':
      return ['home', 'about', 'services', 'product', 'contact', 'faq'];
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export function reportSectionHeadings(category: WebsiteCategory): {
  clarity: string;
  conversion: string;
  trust: string;
} {
  switch (category) {
    case 'saas':
      return {
        clarity: 'Product clarity',
        conversion: 'Signup path',
        trust: 'Pricing and proof',
      };
    case 'service':
    case 'agency':
      return {
        clarity: 'Offer clarity',
        conversion: 'Lead generation',
        trust: 'Trust and proof',
      };
    case 'ecommerce':
    case 'product_dtc':
      return {
        clarity: 'Product discovery',
        conversion: 'Purchase path',
        trust: 'Trust signals',
      };
    case 'course':
      return {
        clarity: 'Curriculum clarity',
        conversion: 'Enrollment path',
        trust: 'Authority and proof',
      };
    case 'coaching':
      return {
        clarity: 'Offer clarity',
        conversion: 'Booking path',
        trust: 'Authority and proof',
      };
    case 'local':
      return {
        clarity: 'Service clarity',
        conversion: 'Contact path',
        trust: 'Location and trust',
      };
    case 'marketplace':
      return {
        clarity: 'Supply and demand clarity',
        conversion: 'Join / CTA paths',
        trust: 'Marketplace trust',
      };
    case 'media':
      return {
        clarity: 'Topic clarity',
        conversion: 'Subscription flow',
        trust: 'Content credibility',
      };
    case 'personal_brand':
      return {
        clarity: 'Story and offer',
        conversion: 'Lead capture',
        trust: 'Authority and proof',
      };
    case 'nonprofit':
      return {
        clarity: 'Mission clarity',
        conversion: 'Donation path',
        trust: 'Impact proof',
      };
    case 'app':
      return {
        clarity: 'Product clarity',
        conversion: 'Download / signup path',
        trust: 'Trust and proof',
      };
    case 'community':
      return {
        clarity: 'Community clarity',
        conversion: 'Membership path',
        trust: 'Trust and belonging',
      };
    case 'hybrid':
    case 'unknown':
      return {
        clarity: 'Offer clarity',
        conversion: 'Conversion path',
        trust: 'Trust and proof',
      };
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}
