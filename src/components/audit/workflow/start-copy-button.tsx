'use client';

import { Check } from 'lucide-react';
import { FixIcon } from '@/components/icons';
import { useCopyClipboard } from '@/hooks/use-copy-clipboard';

/** Labelled "Copy fix prompt" button for the Start here card. Hidden in the PDF export. */
export function StartCopyButton({ prompt }: { prompt: string }) {
  const { copied, copy } = useCopyClipboard();

  return (
    <button
      type="button"
      onClick={() => void copy(prompt)}
      className="bg-raised inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-tint print:hidden"
    >
      {copied ? (
        <Check className="size-4 text-success-ink" aria-hidden />
      ) : (
        <FixIcon className="size-4" aria-hidden />
      )}
      {copied ? 'Copied' : 'Copy fix prompt'}
    </button>
  );
}
