import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Newsreader } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-display',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')
  ? process.env.NEXT_PUBLIC_APP_URL
  : 'https://site-os-opal.vercel.app';

const DESCRIPTION =
  'Paste a URL for a free crawl audit, including AI answer readiness. Sign in to save sites, test whether AI search cites you, and connect Search Console and GA4.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Site-OS | Free website audit', template: '%s | Site-OS' },
  description: DESCRIPTION,
  applicationName: 'Site-OS',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Site-OS',
    title: 'Site-OS | Free website audit',
    description: DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site-OS | Free website audit',
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = { themeColor: '#000000' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Site-OS',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
