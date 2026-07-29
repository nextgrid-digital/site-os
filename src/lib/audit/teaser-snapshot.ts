export type TeaserCategoryKey = 'clarity' | 'trust' | 'cta' | 'missing_pages';

export interface TeaserCategory {
  key: TeaserCategoryKey;
  label: string;
  count: number;
  preview: string | null;
}

export interface TeaserSnapshot {
  domain: string;
  websiteUrl: string;
  siteBlurb: string | null;
  categories: TeaserCategory[];
  findingCount: number;
  ready: boolean;
}

const CATEGORY_META: { key: TeaserCategoryKey; label: string; match: (f: TeaserFinding) => boolean }[] = [
  {
    key: 'clarity',
    label: 'Clarity',
    match: (f) => {
      const t = `${f.type} ${f.category} ${f.title}`.toLowerCase();
      return (
        t.includes('messaging') ||
        t.includes('clarity') ||
        t.includes('title') ||
        t.includes('meta') ||
        t.includes('on_page')
      );
    },
  },
  {
    key: 'trust',
    label: 'Trust',
    match: (f) => {
      const t = `${f.type} ${f.category} ${f.title}`.toLowerCase();
      return t.includes('trust') || t.includes('proof') || t.includes('faq');
    },
  },
  {
    key: 'cta',
    label: 'CTA',
    match: (f) => {
      const t = `${f.type} ${f.category} ${f.title}`.toLowerCase();
      return t.includes('cta') || t.includes('conversion') || t.includes('call_to_action');
    },
  },
  {
    key: 'missing_pages',
    label: 'Missing pages',
    match: (f) => {
      const t = `${f.type} ${f.category} ${f.title}`.toLowerCase();
      return t.includes('missing_page') || t.includes('architecture') || t.includes('structure');
    },
  },
];

export interface TeaserFinding {
  type?: string | null;
  category?: string | null;
  title?: string | null;
  summary?: string | null;
  severity?: string | null;
  priority_score?: number | null;
}

export function buildTeaserSnapshot(input: {
  domain: string;
  websiteUrl: string;
  siteOnlySummary: string | null;
  findings: TeaserFinding[];
}): TeaserSnapshot {
  const findings = input.findings;

  const categories: TeaserCategory[] = CATEGORY_META.map((meta) => {
    const matched = findings.filter(meta.match);
    const top = matched[0];
    return {
      key: meta.key,
      label: meta.label,
      count: matched.length,
      preview: top?.title ?? null,
    };
  });

  return {
    domain: input.domain,
    websiteUrl: input.websiteUrl,
    siteBlurb: input.siteOnlySummary
      ? truncate(input.siteOnlySummary, 180)
      : findings.length > 0
        ? `We found ${findings.length} early signals on ${input.domain}. Sign in to see the full free audit.`
        : null,
    categories,
    findingCount: findings.length,
    ready: findings.length > 0 || Boolean(input.siteOnlySummary),
  };
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
