'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import {
  parseAuditPrimaryTabSuffix,
  useAuditTabCache,
  type AuditPrimaryTabSuffix,
} from '@/components/audit/audit-tab-cache';

type SoftAuditTabLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  /** When set, used instead of parsing href. */
  suffix?: AuditPrimaryTabSuffix;
};

/**
 * Link that soft-switches primary audit tabs (pushState) when the SPA shell is mounted.
 * Falls back to normal navigation outside the shell.
 */
export function SoftAuditTabLink({
  href,
  suffix,
  onClick,
  children,
  ...rest
}: SoftAuditTabLinkProps) {
  const tab = useAuditTabCache();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const next = suffix ?? parseAuditPrimaryTabSuffix(href);
    if (!tab || !next) return;
    event.preventDefault();
    tab.setTab(next);
  }

  return (
    <Link href={href} onClick={handleClick} prefetch={false} {...rest}>
      {children}
    </Link>
  );
}
