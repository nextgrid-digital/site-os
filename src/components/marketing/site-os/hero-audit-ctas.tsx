'use client';
// @ts-nocheck

import Link from 'next/link';
import { HomeAuditForm } from '@/components/audit/home-audit-form';

/** Replaces Site-OS hero trial/demo CTAs with Site-OS audit entry. */
export function HeroAuditCtas() {
  return (
    <div className="mx-auto mt-4 w-full max-w-xl" data-cid="n30">
      <HomeAuditForm
        className="flex w-full flex-col gap-2"
        inputClassName="h-8 w-full rounded-lg border border-solid border-clr-0 bg-surface-3 px-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-clr-8"
        buttonClassName="border border-solid border-clr-0 flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg bg-color-002 px-4 text-xs font-medium leading-4 whitespace-nowrap text-color-007 [background-clip:padding-box] hover:bg-clr-24 disabled:opacity-50"
        actionsClassName="flex flex-wrap items-center justify-center gap-2"
        actions={
          <Link
            href="/audit"
            className="border border-solid border-clr-0 flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg bg-surface-3 px-4 text-xs font-medium leading-4 whitespace-nowrap [background-clip:padding-box] hover:bg-background"
            data-cid="n32"
            data-component="button"
          >
            See the demo
          </Link>
        }
        errorClassName="text-center text-xs text-clr-18"
        buttonLabel="Start free audit"
        loadingLabel="Starting…"
        helperText=""
      />
    </div>
  );
}
