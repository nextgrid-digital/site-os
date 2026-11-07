'use client';

import { Check } from 'lucide-react';
import { FixIcon } from '@/components/icons';
import { useCopyClipboard } from '@/hooks/use-copy-clipboard';

/** Copies a ready-made fix prompt for an issue. Hidden in the PDF export. */
export function PriorityFixButton({ prompt }: { prompt: string }) {
  const { copied, copy } = useCopyClipboard();

  return (
    <button
      type="button"
      onClick={() => void copy(prompt)}
      aria-label={copied ? 'Fix prompt copied' : 'Copy fix prompt'}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-tint print:hidden"
    >
      {copied ? (
        <Check className="size-4 text-success-ink" aria-hidden />
      ) : (
        <FixIcon className="size-4" aria-hidden />
      )}
      {copied ? 'Copied' : 'Fix'}
    </button>
  );
}
