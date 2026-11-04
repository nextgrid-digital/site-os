import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')
  ? process.env.NEXT_PUBLIC_APP_URL
  : 'https://site-os-opal.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/app/', '/account/', '/auth/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
