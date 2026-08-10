import {
  buildPathFunnelView,
  hasAnyTrafficData,
  type AnalyticsFunnelStepView,
} from '@/lib/audit/connected-analytics';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { ChannelTrafficRow, PageMetric, QueryMetric } from '@/lib/supabase/types';

export type FunnelLeakLabel = 'looks_like_a_leak' | 'ok' | 'unclear';

export type FunnelChannelQuality =
  | 'best_visitors'
  | 'converting'
  | 'weak_quality'
  | 'high_drop_off'
  | 'neutral';

export type FunnelSummaryCard = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type FunnelStepInsight = {
  step: number;
  label: string;
  visitors: number;
  dropOffPct: number | null;
  meaning: string;
};

export type FunnelChannelInsight = {
  channel: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  sharePct: number;
  quality: FunnelChannelQuality;
  meaning: string;
};

export type FunnelLandingInsight = {
  path: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
  conversionRate: number;
  leakLabel: FunnelLeakLabel;
  meaning: string;
};

export type FunnelIntentMismatch = {
  kind: 'query' | 'page';
  label: string;
  detail: string;
  meaning: string;
};

export type FunnelPaidMismatch = {
  channel: string;
  sessions: number;
  conversions: number;
  meaning: string;
  /** True when derived from Google Ads API, not GA4 channel inference. */
  fromAdsApi?: boolean;
  spend?: number;
};

export type FunnelBottleneck = {
  id: string;
  title: string;
  whyItMatters: string;
  fixFirst: string;
  nextgridNext: string;
};

export type FunnelAssessment = {
  hasData: boolean;
  hasFunnelProblem: boolean | null;
  verdict: string;
  emptyReason: string | null;
  connectHint: boolean;
  summaryCards: FunnelSummaryCard[];
  whatIsHappening: string;
  whereItLeaks: string;
  whatDataSuggests: string;
  whatGoogleIsTellingUs: string;
  whatToFixFirst: string;
  steps: FunnelStepInsight[];
  channels: FunnelChannelInsight[];
  landings: FunnelLandingInsight[];
  intentMismatches: FunnelIntentMismatch[];
  paidMismatches: FunnelPaidMismatch[];
  bottlenecks: FunnelBottleneck[];
};

const MIN_CHANNEL_SESSIONS = 10;
const MIN_PAGE_SESSIONS_FOR_LEAK = 10;

function fmt(n: number, digits = 0) {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function pct(rate: number, digits = 1) {
  const value = rate <= 1 && rate >= 0 ? rate * 100 : rate;
  return `${value.toFixed(digits)}%`;
}

function conversionRate(conversions: number, sessions: number) {
  if (sessions <= 0) return 0;
  return conversions / sessions;
}

function isPaidChannel(channel: string) {
  const c = channel.toLowerCase();
  return c.includes('paid') || c.includes('cpc') || c.includes('ppc');
}

function totals(connected: ConnectedAuditMetrics) {
  const pages = connected.pageMetrics ?? [];
  const overview = connected.ga4Overview;
  const metrics = connected.metrics;

  const sessions =
    overview?.sessions ??
    metrics?.total_sessions ??
    pages.reduce((s, p) => s + (p.ga_sessions || 0), 0);
  const engaged =
    overview?.engagedSessions ??
    pages.reduce((s, p) => s + (p.ga_engaged_sessions || 0), 0);
  const conversions =
    overview?.conversions ??
    metrics?.total_conversions ??
    pages.reduce((s, p) => s + (p.ga_conversions || 0), 0);
  const searchClicks =
    metrics?.total_clicks ?? pages.reduce((s, p) => s + (p.gsc_clicks || 0), 0);
  const impressions =
    metrics?.total_impressions ?? pages.reduce((s, p) => s + (p.gsc_impressions || 0), 0);

  return { sessions, engaged, conversions, searchClicks, impressions };
}

function buildSteps(
  connected: ConnectedAuditMetrics,
  sessions: number,
  engaged: number,
  conversions: number
): FunnelStepInsight[] {
  const pathView = buildPathFunnelView(connected.ga4FunnelSteps);
  if (pathView.length >= 2) {
    return pathView.map((step: AnalyticsFunnelStepView, index) => ({
      step: step.step,
      label: step.path || `Step ${step.step}`,
      visitors: step.visitors,
      dropOffPct: step.dropOffPct,
      meaning:
        index === 0
          ? 'People start here — the busiest path in this window.'
          : step.dropOffPct != null && step.dropOffPct >= 40
            ? `Many people leave before reaching this step (${pct(step.dropOffPct / 100)} drop-off from the previous step).`
            : 'Fewer people reach this step than the one before it.',
    }));
  }

  if (sessions <= 0) return [];

  const engagedDrop =
    sessions > 0 ? ((sessions - engaged) / sessions) * 100 : null;

  const approx: FunnelStepInsight[] = [
    {
      step: 1,
      label: 'Arrived on site',
      visitors: sessions,
      dropOffPct: null,
      meaning: 'Total sessions recorded in Analytics for this audit window.',
    },
    {
      step: 2,
      label: 'Engaged',
      visitors: engaged,
      dropOffPct: engagedDrop,
      meaning:
        engaged < sessions * 0.5
          ? 'Fewer than half of visits look engaged — interest fades quickly.'
          : 'A solid share of visits show engagement.',
    },
    {
      step: 3,
      label: 'Converted',
      visitors: conversions,
      // Do not treat conversion rate as a "drop-off %" — conversions are always a
      // smaller subset than engaged sessions and would false-flag healthy funnels.
      dropOffPct: null,
      meaning:
        conversions === 0 && sessions >= 20
          ? 'People arrive and engage, but almost no conversions are measured.'
          : conversions > 0
            ? `Measured conversions at the end of the path (${pct(conversionRate(conversions, sessions))} of sessions).`
            : 'Conversion volume is too low to read a clear pattern yet.',
    },
  ];
  return approx;
}

function rankChannels(rows: ChannelTrafficRow[], totalSessions: number): FunnelChannelInsight[] {
  const ranked = rows
    .filter((c) => c.sessions > 0)
    .toSorted((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  if (!ranked.length) return [];

  const withRates = ranked.map((c) => ({
    ...c,
    channel: c.channel || c.sourceMedium || 'Other',
    rate: conversionRate(c.conversions, c.sessions),
    sharePct: totalSessions > 0 ? (c.sessions / totalSessions) * 100 : 0,
  }));

  const meaningful = withRates.filter((c) => c.sessions >= MIN_CHANNEL_SESSIONS);
  const best =
    meaningful.length > 0
      ? meaningful.reduce((a, b) => (b.rate > a.rate ? b : a))
      : withRates[0];
  const weakest =
    meaningful.length > 0
      ? meaningful.reduce((a, b) => (b.rate < a.rate ? b : a))
      : withRates[withRates.length - 1];

  return withRates.map((c) => {
    let quality: FunnelChannelQuality = 'neutral';
    if (c.channel === best?.channel && c.rate > 0) quality = 'best_visitors';
    else if (c.conversions > 0 && c.rate >= (best?.rate ?? 0) * 0.7) quality = 'converting';
    else if (c.sessions >= MIN_CHANNEL_SESSIONS && c.conversions === 0) quality = 'high_drop_off';
    else if (c.channel === weakest?.channel && c.sessions >= MIN_CHANNEL_SESSIONS) {
      quality = 'weak_quality';
    }

    const meaning =
      quality === 'best_visitors'
        ? `${c.channel} brings the strongest converting traffic in this window.`
        : quality === 'converting'
          ? `${c.channel} produces measured conversions.`
          : quality === 'high_drop_off'
            ? `${c.channel} sends volume but almost no conversions — a leak after arrival.`
            : quality === 'weak_quality'
              ? `${c.channel} underperforms other channels on conversion rate.`
              : `${c.channel} accounts for ${pct(c.sharePct / 100, 0)} of sessions.`;

    return {
      channel: c.channel,
      sessions: c.sessions,
      conversions: c.conversions,
      conversionRate: c.rate,
      sharePct: c.sharePct,
      quality,
      meaning,
    };
  });
}

function rankLandings(pages: PageMetric[]): FunnelLandingInsight[] {
  return pages
    .filter((p) => p.ga_sessions > 0)
    .toSorted((a, b) => b.ga_sessions - a.ga_sessions)
    .slice(0, 8)
    .map((p) => {
      const sessions = p.ga_sessions;
      const engaged = p.ga_engaged_sessions;
      const conversions = p.ga_conversions;
      const rate = conversionRate(conversions, sessions);
      let leakLabel: FunnelLeakLabel = 'unclear';
      if (sessions >= MIN_PAGE_SESSIONS_FOR_LEAK && conversions === 0) {
        leakLabel = 'looks_like_a_leak';
      } else if (conversions > 0 && rate >= 0.02) {
        leakLabel = 'ok';
      } else if (sessions >= MIN_PAGE_SESSIONS_FOR_LEAK && rate < 0.01) {
        leakLabel = 'looks_like_a_leak';
      }

      const intentWeak =
        p.gsc_impressions >= 50 && p.gsc_ctr > 0 && p.gsc_ctr < 0.02;

      const meaning =
        leakLabel === 'looks_like_a_leak'
          ? intentWeak
            ? 'This page gets traffic, but the CTA or offer looks weak — and search CTR is soft too.'
            : 'People are arriving, but not converting on this page.'
          : leakLabel === 'ok'
            ? 'Traffic on this page shows measured conversions.'
            : 'Signal is thin — treat as early read, not a firm leak.';

      return {
        path: p.path || '/',
        sessions,
        engagedSessions: engaged,
        conversions,
        conversionRate: rate,
        leakLabel,
        meaning,
      };
    });
}

function buildIntentMismatches(
  queries: QueryMetric[],
  pages: PageMetric[]
): FunnelIntentMismatch[] {
  const out: FunnelIntentMismatch[] = [];
  const pageByPath = new Map(pages.map((p) => [p.path || '/', p]));

  for (const q of queries
    .filter((q) => q.impressions >= 40)
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, 12)) {
    if (q.ctr < 0.02 || (q.impressions >= 100 && q.clicks < 3)) {
      out.push({
        kind: 'query',
        label: q.query,
        detail: `${fmt(q.impressions)} impressions · ${fmt(q.clicks)} clicks · ${pct(q.ctr)} CTR`,
        meaning:
          'The search query has demand, but the page does not answer it well enough to earn clicks.',
      });
    } else if (q.clicks >= 3 && q.page_path) {
      const page = pageByPath.get(q.page_path);
      if (page && page.ga_sessions >= 5 && page.ga_conversions === 0) {
        out.push({
          kind: 'query',
          label: q.query,
          detail: `Lands on ${q.page_path}`,
          meaning:
            'Search brings people in, but the landing page is not converting.',
        });
      }
    }
    if (out.length >= 5) break;
  }

  for (const p of pages
    .filter((p) => p.gsc_impressions >= 80 && p.gsc_ctr < 0.02)
    .toSorted((a, b) => b.gsc_impressions - a.gsc_impressions)
    .slice(0, 4)) {
    if (out.some((i) => i.label === (p.path || '/'))) continue;
    out.push({
      kind: 'page',
      label: p.path || '/',
      detail: `${fmt(p.gsc_impressions)} impressions · ${pct(p.gsc_ctr)} CTR`,
      meaning:
        'This page shows up in search, but people rarely click — title, snippet, or intent match may be off.',
    });
    if (out.length >= 6) break;
  }

  return out.slice(0, 6);
}

function buildPaidMismatches(channels: FunnelChannelInsight[]): FunnelPaidMismatch[] {
  return channels
    .filter((c) => isPaidChannel(c.channel) && c.sessions >= 5)
    .map((c) => ({
      channel: c.channel,
      sessions: c.sessions,
      conversions: c.conversions,
      fromAdsApi: false,
      meaning:
        c.conversions === 0 || c.conversionRate < 0.01
          ? 'Paid traffic is landing, but almost none of it converts — spend may be wasted on a weak page or weak intent.'
          : 'Paid traffic is converting; keep the landing experience aligned with the ad promise.',
    }));
}

/** Prefer real Google Ads waste/mismatch signals when the Ads connector has data. */
function buildPaidMismatchesFromAds(
  connected: ConnectedAuditMetrics
): FunnelPaidMismatch[] | null {
  const ads = connected.googleAds;
  if (!ads || (!ads.campaigns.length && ads.spend <= 0 && !ads.wasteSignals.length)) {
    return null;
  }

  const fromWaste = ads.wasteSignals.slice(0, 6).map((w) => ({
    channel: w.kind === 'campaign' ? `Ads · ${w.label}` : `Keyword · ${w.label}`,
    sessions: w.clicks,
    conversions: w.conversions,
    spend: w.spend,
    fromAdsApi: true,
    meaning: w.meaning,
  }));

  if (fromWaste.length > 0) return fromWaste;

  const weakCampaigns = ads.campaigns
    .filter((c) => c.costMicros >= 20_000_000 && c.conversions <= 0)
    .slice(0, 4)
    .map((c) => ({
      channel: `Ads · ${c.campaignName}`,
      sessions: c.clicks,
      conversions: c.conversions,
      spend: c.costMicros / 1_000_000,
      fromAdsApi: true,
      meaning: `Campaign spent ~${(c.costMicros / 1_000_000).toFixed(0)} with no conversions.`,
    }));

  return weakCampaigns.length > 0 ? weakCampaigns : [];
}

function biggestStepDrop(steps: FunnelStepInsight[]): FunnelStepInsight | null {
  let worst: FunnelStepInsight | null = null;
  for (const step of steps) {
    if (step.dropOffPct == null) continue;
    if (!worst || (worst.dropOffPct ?? 0) < step.dropOffPct) worst = step;
  }
  return worst;
}

function buildBottlenecks(input: {
  hasFunnelProblem: boolean;
  sessions: number;
  conversions: number;
  steps: FunnelStepInsight[];
  channels: FunnelChannelInsight[];
  landings: FunnelLandingInsight[];
  intentMismatches: FunnelIntentMismatch[];
  paidMismatches: FunnelPaidMismatch[];
}): FunnelBottleneck[] {
  const items: FunnelBottleneck[] = [];
  const drop = biggestStepDrop(input.steps);
  const leak = input.landings.find((l) => l.leakLabel === 'looks_like_a_leak');
  const weakChannel = input.channels.find(
    (c) => c.quality === 'high_drop_off' || c.quality === 'weak_quality'
  );
  const intent = input.intentMismatches[0];
  const paid = input.paidMismatches.find((p) => p.conversions === 0 || p.sessions > p.conversions * 50);

  if (input.sessions >= 30 && input.conversions === 0) {
    items.push({
      id: 'no-conversions',
      title: 'Visits arrive without measured conversions',
      whyItMatters:
        'Traffic is present, but the business outcome is missing — the funnel is leaking after arrival.',
      fixFirst:
        'Confirm key conversion events in Analytics, then fix the primary CTA and form path on the top landing page.',
      nextgridNext:
        'NextGrid would audit the main offer page CTA, form friction, and whether GA4 is tracking the real lead event.',
    });
  }

  if (drop && (drop.dropOffPct ?? 0) >= 35) {
    items.push({
      id: 'step-drop',
      title: `Biggest drop-off into “${drop.label}”`,
      whyItMatters: `About ${pct((drop.dropOffPct ?? 0) / 100, 0)} of people leave before this step — that is where momentum dies.`,
      fixFirst: `Clarify the path from the previous step to ${drop.label}: stronger next-step CTA, fewer distractions, clearer promise.`,
      nextgridNext:
        'NextGrid would rewrite the step transition (headline, CTA, proof) and re-check engagement after the change.',
    });
  }

  if (leak) {
    items.push({
      id: 'landing-leak',
      title: `Landing page leak on ${leak.path}`,
      whyItMatters: `${fmt(leak.sessions)} sessions with weak or zero conversions — people show up, then leave.`,
      fixFirst:
        'Match the page message to the traffic intent, put one clear CTA above the fold, and remove competing asks.',
      nextgridNext:
        'NextGrid would run a landing-page fix pass: intent match, proof, and a single conversion path.',
    });
  }

  if (paid) {
    items.push({
      id: 'paid-mismatch',
      title: `Paid traffic underperforming (${paid.channel})`,
      whyItMatters:
        'Paid clicks cost money; if they do not convert, budget is funding a weak funnel step.',
      fixFirst:
        'Align the landing page with the ad promise, or pause traffic to pages that do not convert.',
      nextgridNext:
        'NextGrid would map ad intent → landing message → conversion event and recommend where to stop waste first.',
    });
  }

  if (intent && items.length < 3) {
    items.push({
      id: 'search-intent',
      title: `Search intent mismatch: “${intent.label}”`,
      whyItMatters: intent.meaning,
      fixFirst:
        'Improve title/snippet and landing content so the page answers the query people actually type.',
      nextgridNext:
        'NextGrid would rewrite the target page against the top demand queries and re-check CTR after publish.',
    });
  }

  if (weakChannel && items.length < 3) {
    items.push({
      id: 'weak-channel',
      title: `${weakChannel.channel} brings weak or low-converting traffic`,
      whyItMatters: weakChannel.meaning,
      fixFirst:
        'Either improve the landing experience for that channel or shift budget/effort to better-converting sources.',
      nextgridNext:
        'NextGrid would compare channel → landing → conversion and recommend which source to double down on.',
    });
  }

  if (!items.length && !input.hasFunnelProblem) {
    items.push({
      id: 'maintain',
      title: 'No major leak stands out in this window',
      whyItMatters: 'Traffic, engagement, and conversions look connected enough to keep optimizing, not emergency-fixing.',
      fixFirst: 'Protect the converting pages and improve the next-weakest channel or query cluster.',
      nextgridNext:
        'NextGrid would still tighten proof and CTA clarity on the top landing page to lift conversion rate further.',
    });
  }

  return items.slice(0, 3);
}

function emptyAssessment(reason: string, connectHint: boolean): FunnelAssessment {
  return {
    hasData: false,
    hasFunnelProblem: null,
    verdict: 'Not enough connected data yet to judge the funnel.',
    emptyReason: reason,
    connectHint,
    summaryCards: [],
    whatIsHappening: reason,
    whereItLeaks: 'Connect Google Analytics and Search Console, then re-run a full audit.',
    whatDataSuggests: 'Without sessions and search demand in the same audit, we cannot locate the leak.',
    whatGoogleIsTellingUs: 'No joined Analytics / Search Console rows are stored for this audit yet.',
    whatToFixFirst: 'Open Connect, select properties, and re-run a full audit.',
    steps: [],
    channels: [],
    landings: [],
    intentMismatches: [],
    paidMismatches: [],
    bottlenecks: [],
  };
}

/**
 * Plain-English funnel problem detection from website + GA4 + Search Console + Ads.
 * Prefers Google Ads API signals for paid waste when present; otherwise infers Paid Search from GA4 channels.
 */
export function buildFunnelAssessment(
  connected: ConnectedAuditMetrics | null
): FunnelAssessment {
  if (!connected || !hasAnyTrafficData(connected)) {
    return emptyAssessment(
      connected?.googleConnected
        ? 'Properties are selected, but this audit stored no Google traffic rows. Reconnect and re-run a full audit.'
        : 'Connect Search Console and GA4, then re-run a full audit to run a funnel problem check.',
      true
    );
  }

  const { sessions, engaged, conversions, searchClicks, impressions } = totals(connected);
  const steps = buildSteps(connected, sessions, engaged, conversions);
  const channels = rankChannels(connected.trafficByChannel ?? [], sessions);
  const landings = rankLandings(connected.pageMetrics ?? []);
  const intentMismatches = buildIntentMismatches(
    connected.queryMetrics ?? [],
    connected.pageMetrics ?? []
  );
  const adsPaid = buildPaidMismatchesFromAds(connected);
  const paidMismatches =
    adsPaid && adsPaid.length > 0 ? adsPaid : buildPaidMismatches(channels);

  const topSource = channels[0] ?? null;
  const topLanding = landings[0] ?? null;
  const dropStep = biggestStepDrop(steps);
  const leakPage =
    landings.find((l) => l.leakLabel === 'looks_like_a_leak') ??
    landings
      .filter((l) => l.sessions >= MIN_PAGE_SESSIONS_FOR_LEAK)
      .toSorted((a, b) => a.conversionRate - b.conversionRate)[0] ??
    null;
  const lowestChannel =
    channels
      .filter((c) => c.sessions >= MIN_CHANNEL_SESSIONS)
      .toSorted((a, b) => a.conversionRate - b.conversionRate)[0] ??
    channels.toSorted((a, b) => a.conversionRate - b.conversionRate)[0] ??
    null;

  const conversionRateSite = conversionRate(conversions, sessions);
  const engagedRate = conversionRate(engaged, sessions);
  const hasVolume = sessions >= 30 || searchClicks >= 20 || impressions >= 200;
  const leakSignals = [
    sessions >= 30 && conversions === 0,
    sessions >= 50 && conversionRateSite < 0.01,
    Boolean(dropStep && (dropStep.dropOffPct ?? 0) >= 40),
    Boolean(leakPage && leakPage.leakLabel === 'looks_like_a_leak'),
    Boolean(paidMismatches.some((p) => p.conversions === 0 && p.sessions >= 10)),
    intentMismatches.length >= 2,
    engagedRate > 0 && engagedRate < 0.4 && sessions >= 40,
  ].filter(Boolean).length;

  const hasFunnelProblem = hasVolume ? leakSignals >= 1 : leakSignals >= 2;

  const verdict = !hasVolume
    ? 'Early signal only — volume is still light, so treat this as a directional read.'
    : hasFunnelProblem
      ? conversions === 0 && sessions >= 30
        ? 'Yes — people are arriving, but not converting.'
        : dropStep && (dropStep.dropOffPct ?? 0) >= 40
          ? `Yes — the biggest leak is before “${dropStep.label}".`
          : leakPage
            ? `Yes — ${leakPage.path} looks like a conversion leak.`
            : 'Yes — the funnel shows a clear weak link in this window.'
      : 'No major funnel problem stands out in this window.';

  const summaryCards: FunnelSummaryCard[] = [
    {
      id: 'traffic',
      label: 'Total traffic',
      value: sessions > 0 ? fmt(sessions) : '—',
      hint: sessions > 0 ? 'Sessions in this audit window' : 'No GA4 sessions yet',
    },
    {
      id: 'top-source',
      label: 'Top traffic source',
      value: topSource?.channel ?? '—',
      hint: topSource ? `${fmt(topSource.sessions)} sessions` : undefined,
    },
    {
      id: 'top-landing',
      label: 'Top landing page',
      value: topLanding?.path ?? '—',
      hint: topLanding ? `${fmt(topLanding.sessions)} sessions` : undefined,
    },
    {
      id: 'drop-off',
      label: 'Biggest funnel drop-off',
      value:
        dropStep && dropStep.dropOffPct != null
          ? `${pct(dropStep.dropOffPct / 100, 0)} → ${dropStep.label}`
          : '—',
      hint: dropStep ? 'Between steps in the path' : 'Need clearer step data',
    },
    {
      id: 'leak-page',
      label: 'Highest leak page',
      value: leakPage?.path ?? '—',
      hint: leakPage
        ? `${fmt(leakPage.sessions)} sessions · ${fmt(leakPage.conversions)} conv.`
        : undefined,
    },
    {
      id: 'weak-channel',
      label: 'Lowest converting channel',
      value: lowestChannel?.channel ?? '—',
      hint: lowestChannel
        ? `${pct(lowestChannel.conversionRate)} conv. rate`
        : undefined,
    },
  ];

  const whatIsHappening = hasFunnelProblem
    ? `In this window the site recorded ${fmt(sessions)} sessions and ${fmt(conversions)} conversions` +
      (searchClicks > 0 ? `, with ${fmt(searchClicks)} Search Console clicks` : '') +
      '. People get to the site, but the path to a lead or sale is weak.'
    : `In this window the site recorded ${fmt(sessions)} sessions and ${fmt(conversions)} conversions` +
      (topSource ? `. Most traffic comes from ${topSource.channel}` : '') +
      '. The chain from arrival to outcome looks connected enough to optimize, not panic.';

  const whereItLeaks = dropStep
    ? `The clearest drop is into “${dropStep.label}”` +
      (dropStep.dropOffPct != null ? ` (${pct(dropStep.dropOffPct / 100, 0)} leave before it)` : '') +
      (leakPage ? `. On-page, ${leakPage.path} is the highest-volume weak converter.` : '.')
    : leakPage
      ? `The clearest leak is on ${leakPage.path} — traffic arrives without a proportional conversion.`
      : intentMismatches.length
        ? 'Leaks show up earlier in search: demand exists, but clicks or landing match are weak.'
        : 'No single dramatic leak jumps out; watch the weakest channel and secondary pages.';

  const whatDataSuggests = hasFunnelProblem
    ? 'The data suggests a funnel problem after arrival (and sometimes before click) — fix the step people abandon, then the landing pages that waste traffic.'
    : 'The data suggests the funnel is holding together; next gains come from tightening the best pages and lifting weaker channels.';

  const sources: string[] = [];
  if (connected.ga4Connected || sessions > 0) sources.push('Google Analytics');
  if (connected.gscConnected || impressions > 0 || searchClicks > 0) {
    sources.push('Search Console');
  }
  if (paidMismatches.length) {
    sources.push(
      paidMismatches.some((p) => p.fromAdsApi)
        ? 'Google Ads (campaign / keyword spend vs conversions)'
        : 'Paid Search (from Analytics channel data — not Ads campaign reports)'
    );
  }
  const whatGoogleIsTellingUs =
    sources.length > 0
      ? `${sources.join(' + ')} together show where demand, visits, and outcomes connect — and where they do not.`
      : 'Connected Google data is incomplete for a joined read.';

  const bottlenecks = buildBottlenecks({
    hasFunnelProblem,
    sessions,
    conversions,
    steps,
    channels,
    landings,
    intentMismatches,
    paidMismatches,
  });

  const whatToFixFirst =
    bottlenecks[0]?.fixFirst ??
    'Re-check conversion tracking, then improve the top landing page CTA.';

  return {
    hasData: true,
    hasFunnelProblem,
    verdict,
    emptyReason: null,
    connectHint: false,
    summaryCards,
    whatIsHappening,
    whereItLeaks,
    whatDataSuggests,
    whatGoogleIsTellingUs,
    whatToFixFirst,
    steps,
    channels,
    landings,
    intentMismatches,
    paidMismatches,
    bottlenecks,
  };
}
