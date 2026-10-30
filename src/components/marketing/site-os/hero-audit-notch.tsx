'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

// Notch geometry per state: width morphs, height stays put so the layout never jumps.
const SIZE = {
  idle: { width: 520, borderRadius: 32 },
  scanning: { width: 320, borderRadius: 32 },
} as const;

function hostOf(raw: string) {
  return raw.trim().replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '') || 'your site';
}

/**
 * Hero audit entry. A light pill that morphs from a URL field into a
 * "Crawling…" status while the audit starts, then hands off to the report.
 */
export function HeroAuditNotch() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError('Enter a website URL');
      return;
    }
    setError('');
    setScanning(true);

    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      const sessionId = typeof data.sessionId === 'string' ? data.sessionId : '';
      if (!res.ok || !sessionId) {
        setError(data.error || 'Something went wrong');
        setScanning(false);
        return;
      }
      // Stay in the scanning state until the route changes.
      router.push(`/audit/${sessionId}`);
    } catch {
      setError('Failed to start audit. Please try again.');
      setScanning(false);
    }
  }

  const size = scanning ? SIZE.scanning : SIZE.idle;
  const fade = reduce ? { duration: 0 } : { duration: 0.25, ease: EASE };

  return (
    <div className="mx-auto mt-6 flex w-full flex-col items-center gap-3">
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        initial={false}
        animate={size}
        transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
        className="h-16 max-w-full overflow-hidden bg-foreground text-background shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {scanning ? (
            <motion.div
              key="scanning"
              role="status"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="flex h-full items-center justify-center gap-3 px-6"
            >
              <svg
                className="size-5 animate-spin motion-reduce:animate-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
              <span className="truncate text-[15px] font-medium">
                Crawling {hostOf(url)}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="flex h-full items-center gap-2 pr-2 pl-6"
            >
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="Website URL"
                aria-invalid={Boolean(error)}
                className="h-12 min-w-0 flex-1 bg-transparent text-base text-background placeholder:text-background/50 focus:outline-none"
              />
              <button
                type="submit"
                className="h-12 shrink-0 cursor-pointer rounded-full bg-background px-5 text-[15px] font-semibold whitespace-nowrap text-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background max-sm:px-4"
              >
                Start free audit
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <p
        role="alert"
        className="min-h-4 text-center text-xs text-clr-18"
      >
        {error}
      </p>
    </div>
  );
}
