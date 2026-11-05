/**
 * Age-restricted (adult, gambling, etc.) sites can only be audited by signed-in users, who
 * confirm they are 18+ at sign-in. Anonymous visitors might be minors.
 * Two cheap checks: obvious domain keywords, and the homepage's own age-rating signals.
 */

export const AGE_RESTRICTED_MESSAGE =
  'This looks like an age-restricted website. Please sign in and confirm you are 18 or older to audit it. If you are under 18, please leave this page.';

const DOMAIN_KEYWORDS = [
  'porn',
  'xxx',
  'xvideos',
  'xnxx',
  'xhamster',
  'redtube',
  'youporn',
  'onlyfans',
  'fansly',
  'hentai',
  'camgirl',
  'livejasmin',
  'chaturbate',
  'stripchat',
  'bongacams',
  'escort',
  'erotic',
  'nsfw',
  'casino',
  'betting',
  'sportsbook',
  'poker',
];

export function isAgeRestrictedDomain(domain: string): boolean {
  const host = domain.toLowerCase();
  return DOMAIN_KEYWORDS.some((word) => host.includes(word));
}

/** RTA / ICRA / "adult" rating labels sites publish so parental filters can block them. */
export function hasAgeRestrictedHtmlSignal(html: string): boolean {
  const head = html.slice(0, 200_000);
  if (/RTA-5042-1996-1400-1577-RTA/i.test(head)) return true;
  if (/<meta[^>]+name=["']rating["'][^>]+content=["'](adult|mature|restricted|rta[^"']*)["']/i.test(head)) {
    return true;
  }
  if (/<meta[^>]+content=["'](adult|mature|restricted)["'][^>]+name=["']rating["']/i.test(head)) {
    return true;
  }
  return false;
}

export async function isAgeRestrictedSite(websiteUrl: string, domain: string): Promise<boolean> {
  if (isAgeRestrictedDomain(domain)) return true;
  try {
    const res = await fetch(websiteUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Site-OS-AgeCheck/1.0' },
    });
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('text/html')) return false;
    return hasAgeRestrictedHtmlSignal(await res.text());
  } catch {
    // Unreachable sites fail later in the audit; don't block on a transient fetch error.
    return false;
  }
}
