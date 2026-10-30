'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const ICON_SIZE = 24;

const SOURCES = [
  {
    id: 'gsc' as const,
    label: 'Search Console',
    src: '/icons/google/search-console.png',
  },
  {
    id: 'ga4' as const,
    label: 'Google Analytics',
    src: '/icons/google/analytics.png',
  },
  {
    id: 'ads' as const,
    label: 'Google Ads',
    src: '/icons/google/ads.png',
  },
] as const;

function SourceIcon({
  connected,
  label,
  src,
}: {
  connected: boolean;
  label: string;
  src: string;
}) {
  const status = connected ? 'connected' : 'not connected';
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.15, rotate: -6 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'inline-flex size-9 cursor-default items-center justify-center rounded-lg',
        connected ? '' : 'pointer-events-none opacity-40 grayscale'
      )}
      title={`${label} ${status}`}
      aria-label={`${label} ${status}`}
      aria-disabled={!connected}
    >
      <Image
        src={src}
        alt=""
        width={ICON_SIZE}
        height={ICON_SIZE}
        className="size-6"
        unoptimized
      />
    </motion.div>
  );
}

/**
 * Official Google product icons (gstatic branding) — full color when mapped, gray when not.
 */
export function SiteSourceConnectionIcons({
  gsc,
  ga4,
  ads,
}: {
  gsc: boolean;
  ga4: boolean;
  ads: boolean;
}) {
  const connected = { gsc, ga4, ads };

  return (
    <div className="inline-flex items-center gap-1.5" aria-label="Google data sources">
      {SOURCES.map((source) => (
        <SourceIcon
          key={source.id}
          connected={connected[source.id]}
          label={source.label}
          src={source.src}
        />
      ))}
    </div>
  );
}
