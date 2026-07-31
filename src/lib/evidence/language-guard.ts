/** Banned prescriptive / marketing-advice language for Brand Evidence Records. */

export const PRESCRIPTIVE_PATTERNS: RegExp[] = [
  /\bshould\b/i,
  /\bmust improve\b/i,
  /\bneeds to\b/i,
  /\brecommended\b/i,
  /\brecommendation\b/i,
  /\bopportunity\b/i,
  /\bnext step\b/i,
  /\baction item\b/i,
  /\bpriority action\b/i,
  /\bfix\b/i,
  /\boptimize\b/i,
  /\bstrengthen\b/i,
  /\benhance\b/i,
  /\bbuild\b/i,
  /\bcreate\b/i,
  /\bpublish\b/i,
  /\bimprove authority\b/i,
  /\bincrease visibility\b/i,
  /\bconversion blocker\b/i,
];

export function findPrescriptiveLanguage(text: string): string[] {
  const hits: string[] = [];
  for (const pattern of PRESCRIPTIVE_PATTERNS) {
    const match = text.match(pattern);
    if (match) hits.push(match[0]);
  }
  return hits;
}

export function assertNoPrescriptiveLanguage(
  texts: Array<string | null | undefined>,
  context = 'brand evidence'
): void {
  for (const text of texts) {
    if (!text) continue;
    const hits = findPrescriptiveLanguage(text);
    if (hits.length > 0) {
      throw new Error(
        `Prescriptive language in ${context}: ${hits.join(', ')} — in “${text.slice(0, 120)}”`
      );
    }
  }
}

export function collectReportTexts(view: {
  executive: { narrative: string; major_data_limitation: string };
  key_observations: Array<{ title: string; statement: string }>;
  methodology: { absence_disclaimer: string };
}): string[] {
  return [
    view.executive.narrative,
    view.executive.major_data_limitation,
    view.methodology.absence_disclaimer,
    ...view.key_observations.flatMap((o) => [o.title, o.statement]),
  ];
}
