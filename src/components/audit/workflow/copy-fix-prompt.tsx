'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Icon-only button that copies a ready-made prompt a customer can paste into
 * Cursor, Claude or ChatGPT to fix a task. Hidden in the PDF export.
 */
export function CopyFixPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={copy}
          aria-label={copied ? 'Prompt copied' : 'Copy prompt'}
          className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-tint hover:text-foreground print:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? 'check' : 'copy'}
              initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className={copied ? 'text-success-ink' : undefined}
            >
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
            </motion.span>
          </AnimatePresence>
        </TooltipTrigger>
        <TooltipContent>{copied ? 'Copied!' : 'Copy prompt'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
