/**
 * Resolve the public app origin for OAuth redirects and absolute URLs.
 * Never returns localhost when running on Vercel.
 */
export function getAppUrl(request?: Request): string {
  const configured = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (configured && !isLocalhost(configured)) {
    return configured;
  }

  if (request) {
    const fromRequest = originFromRequest(request);
    if (fromRequest && !isLocalhost(fromRequest)) {
      return fromRequest;
    }
    if (fromRequest && !isVercelRuntime()) {
      return fromRequest;
    }
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, '');
  if (vercel) {
    const host = vercel.includes('://') ? vercel : `https://${vercel}`;
    return normalizeOrigin(host) ?? host;
  }

  if (configured) {
    return configured;
  }

  if (isVercelRuntime()) {
    throw new Error(
      'Missing NEXT_PUBLIC_APP_URL in production. Set it to your production origin (e.g. https://site-os-opal.vercel.app).'
    );
  }

  return 'http://localhost:3000';
}

function isVercelRuntime() {
  return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_URL);
}

function isLocalhost(origin: string) {
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return /localhost|127\.0\.0\.1/i.test(origin);
  }
}

function normalizeOrigin(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.origin;
  } catch {
    return null;
  }
}

function originFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || request.headers.get('host') || url.host;
  if (!host) return null;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto =
    forwardedProto ||
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');

  return normalizeOrigin(`${proto}://${host}`);
}
