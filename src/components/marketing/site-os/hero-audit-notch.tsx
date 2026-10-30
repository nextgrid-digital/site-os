'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;
const ERROR_VISIBLE_MS = 6000;

// Notch geometry per state. Height follows the content (the error row animates its own height).
const SIZE = {
  idle: { width: 520, borderRadius: 32 },
  error: { width: 520, borderRadius: 28 },
  scanning: { width: 320, borderRadius: 32 },
} as const;

function hostOf(raw: string) {
  return (
    raw
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/[/?#].*$/, '') || 'your site'
  );
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

  // Errors close themselves; a new error restarts the timer.
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), ERROR_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [error]);

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
      const sessionId =
        typeof data.sessionId === 'string' ? data.sessionId : '';
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

  const size = scanning ? SIZE.scanning : error ? SIZE.error : SIZE.idle;
  const fade = reduce ? { duration: 0 } : { duration: 0.25, ease: EASE };

  return (
    <div className="mx-auto mt-6 flex w-full flex-col items-center gap-3">
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        initial={false}
        animate={size}
        transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
        className="max-w-full overflow-hidden bg-foreground text-background shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
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
              className="flex h-16 items-center justify-center gap-3 px-6"
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
              className="flex flex-col"
            >
              <div className="flex h-16 shrink-0 items-center gap-2 pr-2 pl-6">
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="yourwebsite.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError('');
                  }}
                  aria-label="Website URL"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'hero-audit-error' : undefined}
                  className="h-12 min-w-0 flex-1 bg-transparent text-base text-background placeholder:text-background/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-12 shrink-0 cursor-pointer rounded-full bg-background px-5 text-[15px] font-semibold whitespace-nowrap text-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background max-sm:px-4"
                >
                  Start free audit
                </button>
              </div>
              <AnimatePresence initial={false}>
                {error ? (
                  <motion.div
                    key="error"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={
                      reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }
                    }
                    className="overflow-hidden"
                  >
                    <p
                      id="hero-audit-error"
                      role="alert"
                      className="flex items-start gap-2 px-6 pb-4 text-[13px] leading-5 font-medium text-background"
                    >
                      <CircleAlert
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {error}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
