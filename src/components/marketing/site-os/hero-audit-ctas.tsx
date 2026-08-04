'use client';
// @ts-nocheck

import { HomeAuditForm } from '@/components/audit/home-audit-form';

/** Replaces Site-OS hero trial/demo CTAs with Site-OS audit entry. */
export function HeroAuditCtas() {
  return (
    <div className="mx-auto mt-4 w-full max-w-xl" data-cid="n30">
      <HomeAuditForm
        className="flex w-full flex-col gap-2"
        rowClassName="flex w-full items-stretch gap-2 max-sm:flex-col"
        inputClassName="h-11 min-w-0 flex-1 rounded-lg border border-solid border-clr-0 bg-surface-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-clr-8"
        buttonClassName="border border-solid border-clr-0 flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-color-002 px-5 text-sm font-medium leading-4 whitespace-nowrap text-color-007 [background-clip:padding-box] hover:bg-clr-24 disabled:opacity-50 max-sm:w-full"
        errorClassName="text-center text-xs text-clr-18"
        buttonLabel="Start free audit"
        loadingLabel="Starting…"
        helperText=""
      />
    </div>
  );
}
