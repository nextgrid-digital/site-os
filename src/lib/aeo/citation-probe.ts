export interface ProbeSource {
  domain: string;
  title: string | null;
  url: string;
}

export interface ProbeResult {
  prompt: string;
  /** The user's domain appears among the answer's cited sources. */
  cited: boolean;
  /** The brand or domain is named in the answer text, cited or not. */
  mentioned: boolean;
  sources: ProbeSource[];
  error: string | null;
}

export interface ProbeSummary {
  total: number;
  cited: number;
  mentioned: number;
  /** 0-100, share of answered prompts that cited the site. */
  citationRate: number;
  /** Domains cited most often when the site wasn't, most frequent first. */
  topCompetitors: Array<{ domain: string; count: number }>;
}

/** Kill switch: while false, new probe runs are refused (saved results stay viewable). */
export const CITATION_PROBE_ENABLED = false;

export const MAX_PROBE_PROMPTS = 5;
export const MAX_PROBE_RUNS_PER_DAY = 5;
export const PROBE_COOLDOWN_MS = 30_000;
const MAX_SOURCES = 10;

const DOMAIN_LIKE = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;

export function normalizeDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  let host = trimmed;
  try {
    host = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname;
  } catch {
    // keep the raw value
  }
  return host.replace(/^www\./, '');
}

export function domainMatches(candidate: string, target: string): boolean {
  const a = normalizeDomain(candidate);
  const b = normalizeDomain(target);
  if (!a || !b) return false;
  return a === b || a.endsWith(`.${b}`);
}

interface GroundingChunk {
  web?: { uri?: string; title?: string };
}

/**
 * Gemini returns grounded sources as redirect URLs (vertexaisearch...), but
 * `title` is normally the publisher's domain, so prefer it when it looks like one.
 */
export function extractSources(chunks: GroundingChunk[] | undefined): ProbeSource[] {
  const seen = new Set<string>();
  const sources: ProbeSource[] = [];
  for (const chunk of chunks ?? []) {
    const web = chunk.web;
    if (!web?.uri) continue;
    const title = web.title?.trim() || null;
    let domain: string;
    if (title && DOMAIN_LIKE.test(title)) domain = normalizeDomain(title);
    else {
      try {
        domain = normalizeDomain(new URL(web.uri).hostname);
      } catch {
        continue;
      }
    }
    // Source data comes from a model-facing API: only ever keep plain hostnames.
    if (!DOMAIN_LIKE.test(domain) || domain.length > 100) continue;
    if (seen.has(domain)) continue;
    if (sources.length >= MAX_SOURCES) break;
    seen.add(domain);
    sources.push({ domain, title: title?.slice(0, 120) ?? null, url: web.uri });
  }
  return sources;
}

export function analyzeProbe(input: {
  prompt: string;
  answerText: string;
  sources: ProbeSource[];
  domain: string;
  brandName: string | null;
}): ProbeResult {
  const { prompt, answerText, sources, domain, brandName } = input;
  const cited = sources.some((s) => domainMatches(s.domain, domain));
  const haystack = answerText.toLowerCase();
  const brand = brandName?.trim().toLowerCase();
  const mentioned =
    haystack.includes(normalizeDomain(domain)) || Boolean(brand && brand.length > 2 && haystack.includes(brand));
  return {
    prompt,
    cited,
    mentioned,
    sources,
    error: null,
  };
}

export function summarizeProbes(results: ProbeResult[], domain: string): ProbeSummary {
  const answered = results.filter((r) => !r.error);
  const counts = new Map<string, number>();
  for (const result of answered) {
    if (result.cited) continue;
    for (const source of result.sources) {
      if (domainMatches(source.domain, domain)) continue;
      counts.set(source.domain, (counts.get(source.domain) ?? 0) + 1);
    }
  }
  const cited = answered.filter((r) => r.cited).length;
  return {
    total: answered.length,
    cited,
    mentioned: answered.filter((r) => r.mentioned).length,
    citationRate: answered.length === 0 ? 0 : Math.round((cited / answered.length) * 100),
    topCompetitors: [...counts.entries()]
      .map(([d, count]) => ({ domain: d, count }))
      .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain))
      .slice(0, 5),
  };
}

// Plain-language questions only: letters, digits, spaces and light punctuation.
// No markup, code, URLs or template characters can pass this.
const ALLOWED_PROMPT_CHARS = /^[\p{L}\p{N} .,?!'’"&/()%:+-]+$/u;
const INJECTION_HINTS =
  /\b(ignore|disregard|forget)\b.{0,30}\b(instruction|prompt|rule)s?\b|\bsystem prompt\b|\bjailbreak\b|\b(?:act|behave|pretend)\s+as\b|https?:|www\./i;

export type PromptRejection = { prompt: string; reason: string };

export function checkPromptShape(prompt: string): string | null {
  if (prompt.length < 8) return 'Too short to be a real question.';
  if (!ALLOWED_PROMPT_CHARS.test(prompt)) return 'Use plain words only, with no code, links or symbols.';
  if (prompt.split(' ').length < 3) return 'Write a full question of at least three words.';
  if (INJECTION_HINTS.test(prompt)) return 'This looks like an instruction, not a customer question.';
  return null;
}

/**
 * Normalizes user-supplied prompts: trims, drops dupes, caps the count, and
 * separates the ones that fail the plain-question shape check.
 */
export function cleanPrompts(raw: unknown): { accepted: string[]; rejected: PromptRejection[] } {
  const accepted: string[] = [];
  const rejected: PromptRejection[] = [];
  if (!Array.isArray(raw)) return { accepted, rejected };
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const text = item.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().replace(/\s+/g, ' ').slice(0, 200);
    if (!text) continue;
    if (accepted.some((p) => p.toLowerCase() === text.toLowerCase())) continue;
    const reason = checkPromptShape(text);
    if (reason) {
      rejected.push({ prompt: text, reason });
      continue;
    }
    if (accepted.length < MAX_PROBE_PROMPTS) accepted.push(text);
  }
  return { accepted, rejected };
}
