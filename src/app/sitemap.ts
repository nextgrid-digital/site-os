import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')
  ? process.env.NEXT_PUBLIC_APP_URL
  : 'https://site-os-opal.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/login', '/privacy', '/terms'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
