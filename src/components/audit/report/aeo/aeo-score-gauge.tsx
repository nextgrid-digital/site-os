'use client';

import { animate, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { EASE_OUT } from '@/lib/ease';
import { bandFor, SCORE_BANDS, type ScoreBandId } from '@/lib/aeo/score-bands';
import { cn } from '@/lib/utils';

export type ScoreTone = ScoreBandId;

export function scoreTone(score: number): ScoreTone {
  return bandFor(score).id;
}

export const TONE_TEXT = Object.fromEntries(
  SCORE_BANDS.map((band) => [band.id, band.text])
) as Record<ScoreTone, string>;

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Animated radial gauge: the ring sweeps and the number counts up on mount. */
export function AeoScoreGauge({
  score,
  label,
  size = 144,
  className,
}: {
  score: number;
  label: string;
  size?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [counted, setShown] = useState(0);
  const shown = reduced ? score : counted;
  const tone = scoreTone(score);

  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, score, {
      duration: 1.1,
      ease: EASE_OUT,
      onUpdate: (value) => setShown(Math.round(value)),
    });
    return () => controls.stop();
  }, [score, reduced]);

  return (
    <div
      className={cn('relative shrink-0', TONE_TEXT[tone], className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${score} out of 100`}
    >
      <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-tint-strong"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: reduced ? CIRCUMFERENCE * (1 - score / 100) : CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - score / 100) }}
          transition={{ duration: reduced ? 0 : 1.1, ease: EASE_OUT }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold font-mono tracking-tight">{shown}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
