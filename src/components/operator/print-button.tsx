'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

function isUnsafePrintHost() {
  if (typeof window === 'undefined') return true;
  // Cursor / VS Code Simple Browser and other Electron webviews crash on window.print().
  const ua = navigator.userAgent;
  if (/Electron/i.test(ua)) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  return false;
}

export function PrintButton() {
  const [blocked, setBlocked] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    setBlocked(isUnsafePrintHost());
  }, []);

  return (
    <div className="relative print:hidden">
      <Button
        size="sm"
        variant="outline"
        className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        onClick={() => {
          if (isUnsafePrintHost()) {
            setBlocked(true);
            setHint(true);
            void navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
            return;
          }
          window.print();
        }}
      >
        Print
      </Button>
      {blocked && hint ? (
        <p className="absolute top-full right-0 z-10 mt-2 w-64 rounded-xl border border-white/10 bg-[#18181b] p-3 text-xs leading-relaxed text-white/70 shadow-lg">
          Print is disabled in Cursor&apos;s preview (it crashes the IDE). URL copied — open it in
          Chrome/Safari and use File → Print.
          <button
            type="button"
            className="mt-2 block text-white underline-offset-2 hover:underline"
            onClick={() => setHint(false)}
          >
            Dismiss
          </button>
        </p>
      ) : null}
    </div>
  );
}
