import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import type { Website } from '@/lib/supabase/types';

export interface SiteIdentity {
  title: string;
  description: string | null;
  url: string;
  domain: string;
  faviconUrl: string;
  ogImageUrl: string | null;
}

export function googleFaviconUrl(domain: string, size = 128) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function buildSiteIdentity(input: {
  website: Website;
  siteOnly: SiteOnlyAnalysis | null;
  homePage?: { title: string | null; meta_description: string | null } | null;
}): SiteIdentity {
  const title =
    input.homePage?.title?.trim() ||
    input.siteOnly?.homepageTitle?.trim() ||
    input.website.domain;

  const description =
    input.homePage?.meta_description?.trim() ||
    input.siteOnly?.homepageMetaDescription?.trim() ||
    null;

  const faviconUrl =
    input.siteOnly?.faviconUrl?.trim() || googleFaviconUrl(input.website.domain);

  const ogImageUrl = input.siteOnly?.ogImageUrl?.trim() || null;

  return {
    title,
    description,
    url: input.website.url,
    domain: input.website.domain,
    faviconUrl,
    ogImageUrl,
  };
}
