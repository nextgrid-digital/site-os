import { resolveInternalUrl } from '@/lib/utils/urls';

const UA = 'Site-OS-AuditBot/1.0 (+internal)';
const FETCH_TIMEOUT_MS = 15_000;
const MAX_CHILD_SITEMAPS = 10;
const MAX_SITEMAP_URLS = 500;

export type SitemapFetchResult = {
  urls: string[];
  /** Non-fatal notes for the crawl errors list */
  notes: string[];
};

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/** Extract raw <loc> text values from sitemap XML (urlset or sitemapindex). */
export function extractLocValues(xml: string): string[] {
  if (!xml || typeof xml !== 'string') return [];
  const locs: string[] = [];
  const re = /<loc[^>]*>\s*([^<\s][^<]*?)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const value = match[1]?.trim();
    if (value) locs.push(value);
  }
  return locs;
}

export function isSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml);
}

function normalizeSameDomainUrls(locs: string[], baseUrl: string, limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const loc of locs) {
    if (out.length >= limit) break;
    const resolved = resolveInternalUrl(baseUrl, loc);
    if (!resolved || seen.has(resolved)) continue;
    seen.add(resolved);
    out.push(resolved);
  }
  return out;
}

/**
 * Fetch `{origin}/sitemap.xml`, follow sitemap indexes (capped), and return
 * same-domain page URLs. Soft-fails to empty urls on missing/parse errors.
 */
export async function fetchSitemapUrls(baseUrl: string): Promise<SitemapFetchResult> {
  const notes: string[] = [];
  let origin: string;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return { urls: [], notes: [`Invalid base URL for sitemap: ${baseUrl}`] };
  }

  const rootUrl = `${origin}/sitemap.xml`;
  const rootXml = await fetchText(rootUrl);
  if (!rootXml) {
    notes.push(`No sitemap.xml found at ${rootUrl}`);
    return { urls: [], notes };
  }

  const rootLocs = extractLocValues(rootXml);
  if (rootLocs.length === 0) {
    notes.push(`Sitemap at ${rootUrl} contained no <loc> entries`);
    return { urls: [], notes };
  }

  if (!isSitemapIndex(rootXml)) {
    const urls = normalizeSameDomainUrls(rootLocs, baseUrl, MAX_SITEMAP_URLS);
    if (urls.length === 0) {
      notes.push(`Sitemap at ${rootUrl} had no same-domain page URLs`);
    }
    return { urls, notes };
  }

  // Sitemap index: each <loc> points at another sitemap document.
  const childSitemapUrls = normalizeSameDomainUrls(rootLocs, baseUrl, MAX_CHILD_SITEMAPS);
  if (childSitemapUrls.length === 0) {
    // Cross-domain child sitemaps (CDN) — try raw locs that are http(s) without domain filter for fetch,
    // but still filter page URLs to same domain when collecting.
    const rawChildren = rootLocs
      .filter((u) => /^https?:\/\//i.test(u))
      .slice(0, MAX_CHILD_SITEMAPS);
    if (rawChildren.length === 0) {
      notes.push(`Sitemap index at ${rootUrl} had no fetchable child sitemaps`);
      return { urls: [], notes };
    }
    return collectFromChildSitemaps(rawChildren, baseUrl, notes);
  }

  return collectFromChildSitemaps(childSitemapUrls, baseUrl, notes);
}

async function collectFromChildSitemaps(
  childUrls: string[],
  baseUrl: string,
  notes: string[]
): Promise<SitemapFetchResult> {
  const pageLocs: string[] = [];
  for (const childUrl of childUrls) {
    if (pageLocs.length >= MAX_SITEMAP_URLS) break;
    const xml = await fetchText(childUrl);
    if (!xml) {
      notes.push(`Failed to fetch child sitemap ${childUrl}`);
      continue;
    }
    // Nested indexes are uncommon; treat child docs as urlsets (don't recurse further).
    pageLocs.push(...extractLocValues(xml));
  }

  const urls = normalizeSameDomainUrls(pageLocs, baseUrl, MAX_SITEMAP_URLS);
  if (urls.length === 0) {
    notes.push('Sitemap index children yielded no same-domain page URLs');
  }
  return { urls, notes };
}
