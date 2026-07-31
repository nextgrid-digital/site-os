import type { BuyerQuestionCoverage } from '@/lib/evidence/types';

export const BUYER_QUESTIONS: Array<{
  group: BuyerQuestionCoverage['question_group'];
  question: string;
  pathHints: RegExp[];
  textHints: RegExp[];
}> = [
  {
    group: 'company_understanding',
    question: 'What does the company provide?',
    pathHints: [/^\/$/, /about/i, /service/i, /product/i],
    textHints: [/we (help|build|provide|offer|design)/i, /our (work|services|products)/i],
  },
  {
    group: 'company_understanding',
    question: 'Who is the intended customer?',
    pathHints: [/about/i, /for-/i, /industr/i, /customer/i],
    textHints: [/for (startups|founders|teams|companies|enterprises)/i, /built for/i],
  },
  {
    group: 'company_understanding',
    question: 'Which problems does it address?',
    pathHints: [/service/i, /solution/i, /use[-_]?case/i],
    textHints: [/problem/i, /challenge/i, /pain/i],
  },
  {
    group: 'company_understanding',
    question: 'Which outcomes does it claim?',
    pathHints: [/case/i, /result/i, /work/i],
    textHints: [/result/i, /outcome/i, /%\s*(increase|growth|reduction)/i],
  },
  {
    group: 'capability_understanding',
    question: 'Which services or products are available?',
    pathHints: [/service/i, /product/i, /offer/i],
    textHints: [/services?/i, /products?/i],
  },
  {
    group: 'capability_understanding',
    question: 'Which integrations are supported?',
    pathHints: [/integrat/i, /partner/i, /stack/i],
    textHints: [/integrat/i, /connects? with/i, /works with/i],
  },
  {
    group: 'capability_understanding',
    question: 'Which industries are served?',
    pathHints: [/industr/i, /sector/i, /vertical/i],
    textHints: [/industr/i, /for (healthcare|fintech|saas|ecommerce)/i],
  },
  {
    group: 'capability_understanding',
    question: 'Which use cases are documented?',
    pathHints: [/use[-_]?case/i, /solution/i],
    textHints: [/use case/i, /example/i],
  },
  {
    group: 'commercial_understanding',
    question: 'How does engagement work?',
    pathHints: [/contact/i, /process/i, /how[-_]?we/i, /get[-_]?started/i],
    textHints: [/book a/i, /get started/i, /discovery/i, /engagement/i],
  },
  {
    group: 'commercial_understanding',
    question: 'Is pricing publicly available?',
    pathHints: [/pric/i, /plan/i, /cost/i],
    textHints: [/\$|pricing|per month|retainer/i],
  },
  {
    group: 'commercial_understanding',
    question: 'Is there a trial, consultation, or demo?',
    pathHints: [/demo/i, /trial/i, /contact/i, /book/i],
    textHints: [/demo/i, /consultation/i, /trial/i, /book a call/i],
  },
  {
    group: 'commercial_understanding',
    question: 'What is the primary conversion path?',
    pathHints: [/contact/i, /get[-_]?started/i, /signup/i],
    textHints: [/contact us/i, /get started/i, /schedule/i, /sign up/i],
  },
  {
    group: 'trust_understanding',
    question: 'Which customers are publicly named?',
    pathHints: [/case/i, /client/i, /customer/i, /work/i],
    textHints: [/clients? include/i, /trusted by/i, /worked with/i],
  },
  {
    group: 'trust_understanding',
    question: 'Which outcomes are quantified?',
    pathHints: [/case/i, /result/i],
    textHints: [/\d+%/i, /\$\d/i, /\d+x/i],
  },
  {
    group: 'trust_understanding',
    question: 'Are detailed case studies available?',
    pathHints: [/case[-_]?stud/i, /portfolio/i, /work/i],
    textHints: [/case study/i, /project overview/i],
  },
  {
    group: 'trust_understanding',
    question: 'Are external reviews available?',
    pathHints: [/review/i, /testimonial/i],
    textHints: [/review/i, /testimonial/i, /clutch/i, /g2/i],
  },
  {
    group: 'trust_understanding',
    question: 'Are team expertise and credentials public?',
    pathHints: [/team/i, /about/i, /founder/i, /people/i],
    textHints: [/founder/i, /team/i, /years of/i, /previously at/i],
  },
];

export const CONTENT_TYPES = [
  'homepage',
  'products',
  'services',
  'use_cases',
  'industries',
  'customer_stories',
  'case_studies',
  'pricing',
  'comparisons',
  'alternatives',
  'integrations',
  'documentation',
  'faqs',
  'research',
  'blog',
  'team_or_author',
  'legal_and_company',
] as const;

export type BerContentType = (typeof CONTENT_TYPES)[number];

export function mapPageKindToContentType(kind: string): BerContentType {
  switch (kind) {
    case 'home':
      return 'homepage';
    case 'product':
      return 'products';
    case 'services':
      return 'services';
    case 'case_study':
      return 'case_studies';
    case 'pricing':
      return 'pricing';
    case 'faq':
      return 'faqs';
    case 'blog':
      return 'blog';
    case 'about':
    case 'contact':
      return 'legal_and_company';
    default:
      return 'legal_and_company';
  }
}
