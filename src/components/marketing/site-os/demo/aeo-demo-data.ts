/** Fictional sample data for the landing-page AEO demo. Not customer data. */

export type DemoCheck = { label: string; passed: boolean; fix: string };
export type DemoPage = { path: string; score: number; checks: DemoCheck[] };

export const DEMO_SITE = 'northwind-crm.com';

const c = (label: string, passed: boolean, fix: string): DemoCheck => ({ label, passed, fix });

export const DEMO_PAGES: DemoPage[] = [
  {
    path: '/',
    score: 82,
    checks: [
      c('Structured data', true, ''),
      c('Direct answer', true, ''),
      c('FAQ schema', false, 'Add FAQ markup for the five questions buyers ask most.'),
    ],
  },
  {
    path: '/pricing',
    score: 54,
    checks: [
      c('Structured data', false, 'Add Product and Offer schema so plans can be quoted.'),
      c('Direct answer', false, 'Lead with the price of the starter plan in the first sentence.'),
      c('Author and date', true, ''),
    ],
  },
  {
    path: '/integrations',
    score: 71,
    checks: [
      c('Structured data', true, ''),
      c('Question headings', false, 'Turn section headings into the questions people ask.'),
      c('Extractable structure', true, ''),
    ],
  },
  {
    path: '/blog/agency-crm-guide',
    score: 88,
    checks: [
      c('Direct answer', true, ''),
      c('Author and date', true, ''),
      c('Extractable structure', true, ''),
    ],
  },
  {
    path: '/case-studies',
    score: 36,
    checks: [
      c('Structured data', false, 'Mark up each story as an Article with author and date.'),
      c('Content depth', false, 'Add the numbers and the buyer quote that prove the result.'),
      c('Direct answer', false, 'State the outcome in one sentence before the story.'),
    ],
  },
  {
    path: '/security',
    score: 47,
    checks: [
      c('Direct answer', false, 'Answer "is my data safe?" in the opening paragraph.'),
      c('Freshness', false, 'Show a last-updated date on the page.'),
      c('Structured data', true, ''),
    ],
  },
  {
    path: '/about',
    score: 63,
    checks: [
      c('Entity schema', false, 'Add Organization schema with founders and location.'),
      c('Author and date', true, ''),
      c('Content depth', true, ''),
    ],
  },
];

export type DemoTopic = {
  id: string;
  name: string;
  description: string;
  coverage: 'strong' | 'developing' | 'thin';
  avgScore: number;
  paths: string[];
};

export const DEMO_TOPICS: DemoTopic[] = [
  {
    id: 'pricing',
    name: 'Pricing and plans',
    description: 'What it costs and what each plan includes.',
    coverage: 'developing',
    avgScore: 54,
    paths: ['/pricing', '/pricing/agencies'],
  },
  {
    id: 'crm-guides',
    name: 'Agency CRM guides',
    description: 'How agencies choose and set up a CRM.',
    coverage: 'strong',
    avgScore: 80,
    paths: ['/blog/agency-crm-guide', '/blog/client-reporting', '/blog/pipeline-stages'],
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Tools it connects to.',
    coverage: 'developing',
    avgScore: 71,
    paths: ['/integrations', '/integrations/slack'],
  },
  {
    id: 'proof',
    name: 'Customer proof',
    description: 'Stories and results from real customers.',
    coverage: 'thin',
    avgScore: 36,
    paths: ['/case-studies'],
  },
  {
    id: 'security',
    name: 'Security',
    description: 'How customer data is protected.',
    coverage: 'thin',
    avgScore: 47,
    paths: ['/security'],
  },
];

export type DemoGap = { id: string; topic: string; why: string; suggestedPage: string };

export const DEMO_GAPS: DemoGap[] = [
  {
    id: 'migration',
    topic: 'Switching from a spreadsheet',
    why: 'Buyers ask how hard it is to move their data in before they ask about price.',
    suggestedPage: 'How to move your agency from spreadsheets to a CRM',
  },
  {
    id: 'compare',
    topic: 'Comparisons with alternatives',
    why: 'AI answers lean on comparison pages when someone asks which tool to pick.',
    suggestedPage: 'Northwind vs the other CRMs agencies consider',
  },
];

export type DemoProbe = {
  id: string;
  question: string;
  cited: boolean;
  citedInstead: string[];
};

export const DEMO_PROBES: DemoProbe[] = [
  { id: 'q1', question: 'best crm for small agencies', cited: true, citedInstead: [] },
  { id: 'q2', question: 'crm with client reporting built in', cited: false, citedInstead: ['hubspot.com', 'pipedrive.com'] },
  { id: 'q3', question: 'how do agencies track leads', cited: true, citedInstead: [] },
  { id: 'q4', question: 'is northwind crm secure', cited: false, citedInstead: ['g2.com', 'capterra.com'] },
];
