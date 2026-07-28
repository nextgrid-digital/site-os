import * as cheerio from 'cheerio';
import { isSameDomain, normalizePath, resolveInternalUrl } from '@/lib/utils/urls';

const TEXT_EXCERPT_LIMIT = 3000;

export interface CrawledPage {
  url: string;
  path: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  ogImageUrl: string | null;
  internalLinks: string[];
  hasFaq: boolean;
  hasFaqSchema: boolean;
  statusCode: number;
  textExcerpt: string | null;
}

/** Resolve a meta image URL (og/twitter) against the page URL; allows CDN hosts. */
export function resolveMediaUrl(pageUrl: string, content: string | null | undefined): string | null {
  const raw = content?.trim();
  if (!raw) return null;
  try {
    const resolved = new URL(raw, pageUrl);
    if (!['http:', 'https:'].includes(resolved.protocol)) return null;
    return resolved.href;
  } catch {
    return null;
  }
}

export function extractOgImageUrl($: cheerio.CheerioAPI, pageUrl: string): string | null {
  const raw =
    $('meta[property="og:image:secure_url"]').attr('content') ||
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[property="twitter:image"]').attr('content') ||
    null;
  return resolveMediaUrl(pageUrl, raw);
}

export interface CrawlResult {
  pages: CrawledPage[];
  errors: string[];
}

const PRIORITY_HREF_PATTERNS = [
  /about/i,
  /service/i,
  /product/i,
  /solution/i,
  /case[-_]?stud/i,
  /customer/i,
  /testimonial/i,
  /contact/i,
  /faq/i,
  /help/i,
  /pricing/i,
];

function detectFaq($: cheerio.CheerioAPI): boolean {
  const text = $('body').text().toLowerCase();
  const hasFaqHeading = $('h2, h3, h4')
    .toArray()
    .some((el) => $(el).text().toLowerCase().includes('faq'));
  const hasDetails = $('details').length > 0;
  const hasAccordion = $('[class*="accordion"], [class*="faq"]').length > 0;
  return hasFaqHeading || hasDetails || hasAccordion || text.includes('frequently asked');
}

function detectFaqSchema($: cheerio.CheerioAPI): boolean {
  return $('script[type="application/ld+json"]')
    .toArray()
    .some((el) => {
      const raw = $(el).html() ?? '';
      return raw.includes('FAQPage') || raw.includes('"@type":"Question"');
    });
}

function extractTextExcerpt($: cheerio.CheerioAPI): string | null {
  const clone = $.root().clone();
  clone.find('script, style, noscript, svg, nav, footer, iframe').remove();
  const text = clone
    .text()
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  return text.slice(0, TEXT_EXCERPT_LIMIT);
}

async function fetchPage(url: string): Promise<{ html: string; status: number } | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Site-OS-AuditBot/1.0 (+internal)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    return { html, status: response.status };
  } catch {
    return null;
  }
}

function parsePage(url: string, html: string, statusCode: number, baseUrl: string): CrawledPage {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    null;
  const h1 = $('h1').first().text().trim() || null;
  const ogImageUrl = extractOgImageUrl($, url);

  const internalLinks = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const resolved = resolveInternalUrl(baseUrl, href);
    if (resolved) internalLinks.add(resolved);
  });

  return {
    url,
    path: normalizePath(url),
    title,
    metaDescription,
    h1,
    ogImageUrl,
    internalLinks: [...internalLinks],
    hasFaq: detectFaq($),
    hasFaqSchema: detectFaqSchema($),
    statusCode,
    textExcerpt: extractTextExcerpt($),
  };
}

function prioritizeQueue(links: string[], baseUrl: string) {
  const unique = [...new Set(links)];
  return unique.toSorted((a, b) => {
    const aScore = PRIORITY_HREF_PATTERNS.some((pattern) => pattern.test(a)) ? 0 : 1;
    const bScore = PRIORITY_HREF_PATTERNS.some((pattern) => pattern.test(b)) ? 0 : 1;
    if (aScore !== bScore) return aScore - bScore;
    return a.localeCompare(b);
  }).filter((link) => isSameDomain(baseUrl, link));
}

export async function crawlWebsite(baseUrl: string, maxPages = 50): Promise<CrawlResult> {
  const origin = new URL(baseUrl).origin;
  const queue = [baseUrl];
  const visited = new Set<string>();
  const pages: CrawledPage[] = [];
  const errors: string[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const fetched = await fetchPage(current);
    if (!fetched) {
      errors.push(`Failed to fetch ${current}`);
      continue;
    }

    const page = parsePage(current, fetched.html, fetched.status, baseUrl);
    pages.push(page);

    const nextLinks = prioritizeQueue(
      page.internalLinks.filter((link) => !visited.has(link) && !queue.includes(link)),
      baseUrl
    );
    queue.push(...nextLinks);
  }

  if (pages.length === 0) {
    errors.push(`No pages crawled for ${origin}`);
  }

  return { pages, errors };
}
