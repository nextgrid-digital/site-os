/**
 * Best-effort check that the selected Google properties belong to the project's site.
 * Search Console exposes a site URL; GA4 only exposes names, so it is checked only when
 * a name contains an explicit domain (e.g. "example.com - GA4").
 */

const DOMAIN_TOKEN = /[a-z0-9-]+(?:\.[a-z0-9-]+)+/g;

export function normalizeHost(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^sc-domain:/, '')
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#:]/)[0];
}

/** True when the hosts are equal, or one is a subdomain of the other. */
export function hostsRelated(a: string, b: string): boolean {
  const x = normalizeHost(a);
  const y = normalizeHost(b);
  if (!x || !y) return true;
  return x === y || x.endsWith(`.${y}`) || y.endsWith(`.${x}`);
}

export function gscMatchesDomain(siteUrl: string, domain: string): boolean {
  return hostsRelated(siteUrl, domain);
}

/** Returns false only when a name contains domain-like text and none of it matches. */
export function ga4MatchesDomain(
  names: Array<string | null | undefined>,
  domain: string
): boolean {
  const tokens = names.flatMap((name) => (name ? (name.toLowerCase().match(DOMAIN_TOKEN) ?? []) : []));
  if (tokens.length === 0) return true;
  return tokens.some((token) => hostsRelated(token, domain));
}

export function propertyMismatchWarnings({
  domain,
  gscSiteUrl,
  ga4Names,
}: {
  domain: string | null | undefined;
  gscSiteUrl?: string | null;
  ga4Names?: Array<string | null | undefined>;
}): string[] {
  if (!domain) return [];
  const warnings: string[] = [];
  if (gscSiteUrl && !gscMatchesDomain(gscSiteUrl, domain)) {
    warnings.push(
      `The Search Console site (${normalizeHost(gscSiteUrl)}) doesn't look like ${normalizeHost(domain)}.`
    );
  }
  if (ga4Names && !ga4MatchesDomain(ga4Names, domain)) {
    warnings.push(`The GA4 property name doesn't mention ${normalizeHost(domain)}.`);
  }
  return warnings;
}
