export interface AiEngine {
  id: string;
  name: string;
  /** GA4 sessionSource hostnames (matched exactly or as a parent domain). */
  hosts: string[];
}

export const AI_ENGINES: AiEngine[] = [
  { id: 'chatgpt', name: 'ChatGPT', hosts: ['chatgpt.com', 'chat.openai.com', 'openai.com'] },
  { id: 'perplexity', name: 'Perplexity', hosts: ['perplexity.ai', 'perplexity'] },
  { id: 'gemini', name: 'Gemini', hosts: ['gemini.google.com', 'bard.google.com'] },
  { id: 'copilot', name: 'Copilot', hosts: ['copilot.microsoft.com', 'copilot.com'] },
  { id: 'claude', name: 'Claude', hosts: ['claude.ai'] },
  { id: 'grok', name: 'Grok', hosts: ['grok.com', 'x.ai'] },
  { id: 'meta-ai', name: 'Meta AI', hosts: ['meta.ai'] },
  { id: 'deepseek', name: 'DeepSeek', hosts: ['chat.deepseek.com', 'deepseek.com'] },
  { id: 'mistral', name: 'Mistral', hosts: ['chat.mistral.ai'] },
  { id: 'you', name: 'You.com', hosts: ['you.com'] },
  { id: 'phind', name: 'Phind', hosts: ['phind.com'] },
];

export const AI_REFERRAL_WINDOW_DAYS = 90;

export function classifyAiSource(source: string): AiEngine | null {
  const host = source.trim().toLowerCase().replace(/^www\./, '');
  if (!host) return null;
  return (
    AI_ENGINES.find((engine) =>
      engine.hosts.some((h) => host === h || host.endsWith(`.${h}`))
    ) ?? null
  );
}

/** Regex for GA4's sessionSource filter: a superset, re-checked by classifyAiSource. */
export function aiSourceFilterRegex(): string {
  const hosts = AI_ENGINES.flatMap((engine) => engine.hosts);
  return hosts.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
}

export interface AiReferralRow {
  source: string;
  landingPage: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
}

export interface AiReferralDailyRow {
  date: string;
  sessions: number;
}

export interface AiReferralData {
  rangeStart: string;
  rangeEnd: string;
  totalSessions: number;
  aiSessions: number;
  /** AI share of all sessions, 0-100 with one decimal. */
  sharePct: number;
  engines: Array<{
    id: string;
    name: string;
    sessions: number;
    engagedSessions: number;
    conversions: number;
  }>;
  pages: Array<{ landingPage: string; sessions: number; conversions: number }>;
  daily: AiReferralDailyRow[];
}

export function summarizeAiReferrals(input: {
  rows: AiReferralRow[];
  daily: Array<{ date: string; source: string; sessions: number }>;
  totalSessions: number;
  rangeStart: string;
  rangeEnd: string;
}): AiReferralData {
  const engines = new Map<string, AiReferralData['engines'][number]>();
  const pages = new Map<string, { landingPage: string; sessions: number; conversions: number }>();

  for (const row of input.rows) {
    const engine = classifyAiSource(row.source);
    if (!engine) continue;
    const e = engines.get(engine.id) ?? {
      id: engine.id,
      name: engine.name,
      sessions: 0,
      engagedSessions: 0,
      conversions: 0,
    };
    e.sessions += row.sessions;
    e.engagedSessions += row.engagedSessions;
    e.conversions += row.conversions;
    engines.set(engine.id, e);

    const page = pages.get(row.landingPage) ?? {
      landingPage: row.landingPage,
      sessions: 0,
      conversions: 0,
    };
    page.sessions += row.sessions;
    page.conversions += row.conversions;
    pages.set(row.landingPage, page);
  }

  const byDate = new Map<string, number>();
  for (const row of input.daily) {
    if (!classifyAiSource(row.source)) continue;
    byDate.set(row.date, (byDate.get(row.date) ?? 0) + row.sessions);
  }

  const engineList = [...engines.values()].sort((a, b) => b.sessions - a.sessions);
  const aiSessions = engineList.reduce((sum, e) => sum + e.sessions, 0);
  return {
    rangeStart: input.rangeStart,
    rangeEnd: input.rangeEnd,
    totalSessions: input.totalSessions,
    aiSessions,
    sharePct:
      input.totalSessions > 0 ? Math.round((aiSessions / input.totalSessions) * 1000) / 10 : 0,
    engines: engineList,
    pages: [...pages.values()].sort((a, b) => b.sessions - a.sessions).slice(0, 10),
    daily: [...byDate.entries()]
      .map(([date, sessions]) => ({ date, sessions }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
