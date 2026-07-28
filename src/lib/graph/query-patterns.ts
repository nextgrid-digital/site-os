import type { ProgrammaticPatternFamily } from '@/lib/graph/types';

export interface QueryPatternHit {
  family: ProgrammaticPatternFamily;
  query: string;
  impressions: number;
  clicks: number;
}

const FAMILY_RULES: Array<{ family: ProgrammaticPatternFamily; pattern: RegExp }> = [
  { family: 'comparisons', pattern: /\bvs\.?\b|\bversus\b|\bcompared to\b/i },
  { family: 'comparisons', pattern: /\balternatives?\b|\bcompetitor/i },
  { family: 'integrations', pattern: /\bintegrat|\bconnect(s|ion)? with\b|\bplugin\b/i },
  { family: 'glossary', pattern: /\bwhat is\b|\bmeaning of\b|\bdefine\b|\bdefinition\b/i },
  { family: 'templates', pattern: /\btemplate\b|\bgenerator\b|\bchecklist\b/i },
  { family: 'converters', pattern: /\bcalculator\b|\bconverter\b|\broi\b|\bestimate\b/i },
  { family: 'examples', pattern: /\bexamples?\b|\bsample\b|\bcase stud/i },
  { family: 'directories', pattern: /\bdirectory\b|\blist of\b|\bmarketplace\b/i },
  { family: 'curation', pattern: /\bbest\b|\btop \d+\b|\btools for\b/i },
  { family: 'locations', pattern: /\bin [A-Z][a-z]+|\bnear me\b|\b(city|county|region)\b/i },
  { family: 'localization', pattern: /\b(español|french|deutsch|日本語|中文)\b/i },
  { family: 'profiles', pattern: /\bfor (teams?|agencies|startups?|enterprises?|marketers?|founders?)\b/i },
  { family: 'use_case', pattern: /\bfor [a-z].{3,40}\b|\buse case\b|\bworkflow\b/i },
];

export function classifyQueryPatterns(
  queries: Array<{ query: string; impressions: number; clicks: number }>
): QueryPatternHit[] {
  const hits: QueryPatternHit[] = [];

  for (const row of queries) {
    for (const rule of FAMILY_RULES) {
      if (rule.pattern.test(row.query)) {
        hits.push({
          family: rule.family,
          query: row.query,
          impressions: row.impressions,
          clicks: row.clicks,
        });
        break;
      }
    }
  }

  return hits;
}

export function demandForFamily(
  hits: QueryPatternHit[],
  family: ProgrammaticPatternFamily
): { impressions: number; matchingQueries: string[] } {
  const matched = hits.filter((h) => h.family === family);
  return {
    impressions: matched.reduce((sum, h) => sum + h.impressions, 0),
    matchingQueries: matched
      .toSorted((a, b) => b.impressions - a.impressions)
      .slice(0, 8)
      .map((h) => h.query),
  };
}
