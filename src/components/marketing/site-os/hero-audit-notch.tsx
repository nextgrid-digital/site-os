'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;
const ERROR_VISIBLE_MS = 6000;

const IDLE_MAX = 520;
const SCANNING_MAX = 320;
const SCANNING_MIN = 200;

// Notch geometry per state, derived from the space available so the morph is visible
// at every viewport. Height follows the content (the error row animates its own height).
function sizeFor(state: 'idle' | 'error' | 'scanning', available: number) {
  const idle = Math.min(IDLE_MAX, available);
  if (state === 'scanning') {
    const w = Math.min(SCANNING_MAX, Math.max(SCANNING_MIN, available * 0.65));
    return { width: Math.min(w, available), borderRadius: 32 };
  }
  return { width: idle, borderRadius: state === 'error' ? 28 : 32 };
}

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(IDLE_MAX);

  // Track the container width so the pill morphs between sizes that fit it.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setAvailable(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const size = sizeFor(
    scanning ? 'scanning' : error ? 'error' : 'idle',
    available,
  );
  const fade = reduce ? { duration: 0 } : { duration: 0.25, ease: EASE };

  return (
    <div
      ref={wrapRef}
      className="mx-auto mt-6 flex w-full flex-col items-center gap-3"
    >
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
              <div className="flex h-16 shrink-0 items-center gap-2 pr-2 pl-5 sm:pl-6">
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
                  <span className="max-sm:hidden">Start free audit</span>
                  <span className="sm:hidden">Start audit</span>
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
                      className="flex items-start gap-2 px-5 pb-4 text-[13px] sm:px-6 leading-5 font-medium text-background"
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
