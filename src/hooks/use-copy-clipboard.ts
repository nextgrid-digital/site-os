"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copies text to the clipboard and exposes a `copied` flag that resets after
 * `resetMs`. `copy` resolves to whether the write succeeded.
 */
export function useCopyClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        timer.current = window.setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetMs],
  );

  return { copied, copy };
}
