'use client';

import { useState } from 'react';
import { googleFaviconUrl } from '@/lib/audit/site-identity';

export function SiteCardFavicon({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const letter = (domain || name || 'S').charAt(0).toUpperCase();

  if (failed || !domain) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tint text-sm font-semibold text-foreground/70">
        {letter}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Google favicon proxy; hosts vary
    <img
      src={googleFaviconUrl(domain, 64)}
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-lg bg-raised object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}
