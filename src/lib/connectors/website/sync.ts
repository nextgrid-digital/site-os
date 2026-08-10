import type { ConnectorSyncResult } from '@/lib/connectors/types';
import type { crawlWebsite } from '@/lib/crawl/site-crawler';

export function websiteSyncFromCrawl(
  crawlResult: Awaited<ReturnType<typeof crawlWebsite>>
): ConnectorSyncResult {
  const hasData = crawlResult.pages.length > 0;
  return {
    connectorId: 'website',
    outcome: hasData ? 'ok' : 'partial',
    hasData,
    message: hasData
      ? `Crawled ${crawlResult.pages.length} pages.`
      : 'Crawl finished with no pages.',
    payload: {
      pagesCrawled: crawlResult.pages.length,
      errors: crawlResult.errors.slice(0, 20),
      signals: {
        titles: crawlResult.pages.filter((p) => p.title).length,
        meta: crawlResult.pages.filter((p) => p.metaDescription).length,
        headings: crawlResult.pages.filter((p) => p.h1).length,
        internalLinks: crawlResult.pages.reduce((sum, p) => sum + p.internalLinks.length, 0),
      },
    },
  };
}
