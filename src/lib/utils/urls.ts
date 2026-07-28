export function normalizeWebsiteUrl(input: string): string {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = '';
  url.search = '';
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString().replace(/\/$/, '') || url.origin;
}

export function extractDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

export function normalizePath(input: string): string {
  if (!input) return '/';
  try {
    const parsed = input.startsWith('http') ? new URL(input) : new URL(input, 'https://example.com');
    const path = parsed.pathname || '/';
    return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  } catch {
    return input.startsWith('/') ? input : `/${input}`;
  }
}

export function pathsMatch(a: string, b: string): boolean {
  return normalizePath(a) === normalizePath(b);
}

export function isSameDomain(baseUrl: string, targetUrl: string): boolean {
  try {
    const base = new URL(baseUrl);
    const target = new URL(targetUrl, baseUrl);
    return extractDomain(base.href) === extractDomain(target.href);
  } catch {
    return false;
  }
}

export function resolveInternalUrl(baseUrl: string, href: string): string | null {
  try {
    const resolved = new URL(href, baseUrl);
    if (!['http:', 'https:'].includes(resolved.protocol)) return null;
    if (!isSameDomain(baseUrl, resolved.href)) return null;
    resolved.hash = '';
    return resolved.toString().replace(/\/$/, '') || resolved.origin;
  } catch {
    return null;
  }
}
