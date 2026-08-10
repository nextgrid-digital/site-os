import type { ConnectorDefinition, ConnectorId } from '@/lib/connectors/types';

export const CONNECTOR_REGISTRY: ConnectorDefinition[] = [
  {
    id: 'website',
    label: 'Website',
    shortLabel: 'Site',
    phase: 1,
    availability: 'available',
    authKind: 'url',
    signals: [
      'Page titles',
      'Meta descriptions',
      'Headings',
      'CTAs',
      'Internal links',
      'Site type',
      'Story flow',
      'Structure gaps',
    ],
    emptyWhatYouWouldSee: 'Crawl of pages, titles, meta, headings, CTAs, and structure gaps.',
  },
  {
    id: 'ga4',
    label: 'Google Analytics 4',
    shortLabel: 'GA4',
    phase: 1,
    availability: 'available',
    authKind: 'oauth',
    signals: [
      'Traffic sources',
      'Landing pages',
      'Engagement',
      'Conversions',
      'Funnel drop-off',
      'Channel performance',
    ],
    emptyWhatYouWouldSee:
      'Sessions, landing pages, engagement, conversions, and channel performance from Analytics.',
  },
  {
    id: 'search_console',
    label: 'Google Search Console',
    shortLabel: 'Search',
    phase: 1,
    availability: 'available',
    authKind: 'oauth',
    signals: [
      'Queries',
      'Impressions',
      'Clicks',
      'CTR',
      'Average position',
      'Pages with visibility',
      'Demand without clicks',
    ],
    emptyWhatYouWouldSee:
      'Search queries, impressions, clicks, CTR, position, and pages with demand but weak clicks.',
  },
  {
    id: 'google_ads',
    label: 'Google Ads',
    shortLabel: 'Ads',
    phase: 1,
    availability: 'available',
    authKind: 'oauth',
    signals: [
      'Campaigns',
      'Keywords',
      'Ad traffic',
      'Landing page performance',
      'Conversion efficiency',
      'Wasted spend',
      'Intent vs landing mismatch',
    ],
    emptyWhatYouWouldSee:
      'Campaign and keyword spend, clicks, conversions, wasted spend, and ad-to-landing mismatches.',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    shortLabel: 'IG',
    phase: 2,
    availability: 'coming_soon',
    authKind: 'oauth',
    signals: [
      'Profile clarity',
      'Bio message',
      'Content themes',
      'Link behavior',
      'Audience signals',
      'Brand consistency',
    ],
    emptyWhatYouWouldSee:
      'Profile clarity, bio message, content themes, link behavior, and brand consistency.',
  },
  {
    id: 'x',
    label: 'X',
    shortLabel: 'X',
    phase: 2,
    availability: 'coming_soon',
    authKind: 'oauth',
    signals: [
      'Founder/brand voice',
      'Positioning',
      'Content themes',
      'Distribution signals',
      'Engagement patterns',
      'Website message consistency',
    ],
    emptyWhatYouWouldSee:
      'Voice, positioning, content themes, engagement patterns, and consistency with the site.',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    shortLabel: 'YT',
    phase: 3,
    availability: 'coming_soon',
    authKind: 'oauth',
    signals: [
      'Video topics',
      'Channel positioning',
      'Search visibility',
      'Authority signals',
      'Educational themes',
    ],
    emptyWhatYouWouldSee:
      'Video topics, channel positioning, search visibility, and authority signals.',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    shortLabel: 'TikTok',
    phase: 3,
    availability: 'coming_soon',
    authKind: 'oauth',
    signals: [
      'Content themes',
      'Attention signals',
      'Top-of-funnel reach',
      'Audience response',
      'Brand consistency',
    ],
    emptyWhatYouWouldSee:
      'Content themes, attention signals, top-of-funnel reach, and brand consistency.',
  },
];

export function getConnectorDefinition(id: ConnectorId): ConnectorDefinition {
  const found = CONNECTOR_REGISTRY.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown connector: ${id}`);
  return found;
}

export function phase1Connectors(): ConnectorDefinition[] {
  return CONNECTOR_REGISTRY.filter((c) => c.phase === 1);
}

export function availableConnectors(): ConnectorDefinition[] {
  return CONNECTOR_REGISTRY.filter((c) => c.availability === 'available');
}
