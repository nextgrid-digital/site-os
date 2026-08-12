'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const AddSiteAuditDialog = dynamic(
  () =>
    import('@/components/audit/add-site-audit-dialog').then((mod) => mod.AddSiteAuditDialog),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-medium text-zinc-400">
        Add site
      </span>
    ),
  }
);

export function AddSiteAuditDialogLazy(props: ComponentProps<typeof AddSiteAuditDialog>) {
  return <AddSiteAuditDialog {...props} />;
}
