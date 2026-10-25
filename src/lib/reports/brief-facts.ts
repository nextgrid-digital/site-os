export interface BriefFact {
  /** Label as the report wrote it, or null for a line with no label. */
  label: string | null;
  value: string;
}

const KNOWN_LABELS = [
  'Business type',
  'Primary offer',
  'Conversion goal',
  'AI inference',
  'Homepage title',
  'Homepage H1',
  'Operator ICP',
  'AI inference ICPs',
];

/** Labels the report appends as "Label: value." where the final period is punctuation, not content. */
const TRAILING_PERIOD_LABELS = new Set(['Business type', 'Primary offer', 'Conversion goal']);

// Longest first so "AI inference ICPs" wins over "AI inference".
const LABEL_PATTERN = new RegExp(
  `(?:^|(?<=\\s))(${[...KNOWN_LABELS].sort((a, b) => b.length - a.length).join('|')}):\\s*`,
  'g'
);

/**
 * Splits report lines into label/value facts without losing text. One line can
 * hold several facts ("Business type: X. Primary offer: Y. AI inference: Z"),
 * and values may contain colons (titles, URLs), so only known labels split.
 */
export function parseBriefFacts(lines: string[]): BriefFact[] {
  const facts: BriefFact[] = [];
  for (const line of lines) {
    const matches = [...line.matchAll(LABEL_PATTERN)];
    if (matches.length === 0) {
      const text = line.trim();
      if (text) facts.push({ label: null, value: text });
      continue;
    }
    const lead = line.slice(0, matches[0].index).trim();
    if (lead) facts.push({ label: null, value: lead });
    matches.forEach((match, i) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = matches[i + 1]?.index ?? line.length;
      let value = line.slice(start, end).trim();
      if (TRAILING_PERIOD_LABELS.has(match[1])) value = value.replace(/\.$/, '');
      if (value) facts.push({ label: match[1], value });
    });
  }
  return facts;
}

const DISPLAY_LABELS: Record<string, string> = {
  'Homepage title': 'Browser tab title',
  'Homepage H1': 'Main headline',
  'AI inference ICPs': 'Buyers an AI sees',
  'Operator ICP': 'Buyers you named',
};

export function displayFactLabel(label: string): string {
  return DISPLAY_LABELS[label] ?? label;
}
