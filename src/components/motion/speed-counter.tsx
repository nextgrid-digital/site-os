"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type SpeedCounterProps = {
  /** The number to display. Changing it races every digit to the new value. */
  value: number;
  /** Seconds the slowest digit takes to land. Faster digits finish sooner. */
  duration?: number;
  /** Extra full 0-9 laps each digit runs before settling. */
  spins?: number;
  /** Peak horizontal smear in px, reached by a digit at its top speed. 0 turns it off. */
  blur?: number;
  /** BCP 47 locale(s) used to format the number. Defaults to the runtime locale. */
  locale?: Intl.LocalesArgument;
  /** Intl.NumberFormat options: currency, signDisplay, fraction digits, notation... */
  format?: Intl.NumberFormatOptions;
  /** Race from 0 on mount instead of showing the final number straight away. */
  animateOnMount?: boolean;
  className?: string;
};

type Slot =
  | { kind: "text"; key: string; text: string }
  | { kind: "digit"; key: string; digit: number };

/** The ten digit glyphs of the locale's numbering system (Latin, Arabic-Indic, Devanagari...). */
function getGlyphs(locale: Intl.LocalesArgument): string[] {
  const nf = new Intl.NumberFormat(locale, { useGrouping: false });
  return Array.from({ length: 10 }, (_, d) => nf.format(d));
}

/**
 * Splits the formatted number into static text (commas, decimal marks, signs,
 * currency, compact suffixes) and digit slots. Slots are keyed by place value so
 * "999" -> "1,000" keeps the ones/tens/hundreds columns alive and only adds a new one.
 */
function toSlots(parts: Intl.NumberFormatPart[], glyphs: string[]): Slot[] {
  const intDigits = parts
    .filter((p) => p.type === "integer")
    .reduce((n, p) => n + Array.from(p.value).length, 0);

  const slots: Slot[] = [];
  let intSeen = 0;
  let fracSeen = 0;

  parts.forEach((part, i) => {
    if (part.type !== "integer" && part.type !== "fraction") {
      slots.push({ kind: "text", key: `t${i}`, text: part.value });
      return;
    }
    for (const ch of Array.from(part.value)) {
      const digit = glyphs.indexOf(ch);
      if (digit < 0) {
        slots.push({ kind: "text", key: `t${i}-${slots.length}`, text: ch });
      } else if (part.type === "integer") {
        slots.push({ kind: "digit", key: `i${intDigits - 1 - intSeen}`, digit });
        intSeen++;
      } else {
        slots.push({ kind: "digit", key: `f${fracSeen}`, digit });
        fracSeen++;
      }
    }
  });
  return slots;
}

const mod10 = (n: number) => ((n % 10) + 10) % 10;

/** How far a glyph travels sideways, as a share of its own width, on each step. */
const SLIDE = 70;

export function SpeedCounter({
  value,
  duration = 1.4,
  spins = 1,
  blur = 6,
  locale,
  format,
  animateOnMount = false,
  className,
}: SpeedCounterProps) {
  const reduce = useReducedMotion();
  const formatKey = JSON.stringify(format);
  // Direction of the latest change: +1 counting up (digits slide left), -1 down.
  // `changed` stays false until the first update, so the page loads showing the final number.
  const [last, setLast] = useState({ value, dir: 1 as 1 | -1, changed: false });
  if (last.value !== value) {
    setLast({ value, dir: value > last.value ? 1 : -1, changed: true });
  }

  const { slots, glyphs, label } = useMemo(() => {
    const nf = new Intl.NumberFormat(locale, format);
    const glyphs = getGlyphs(locale);
    return {
      glyphs,
      slots: toSlots(nf.formatToParts(value), glyphs),
      label: nf.format(value),
    };
    // `format` is usually an inline object; key it by content, not identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, locale, formatKey]);

  const total = slots.filter((s) => s.kind === "digit").length;
  let k = -1;

  return (
    <span className={cn("relative inline-flex items-baseline tabular-nums", className)}>
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        <AnimatePresence initial={false}>
          {slots.map((slot) => {
            if (slot.kind === "digit") k++;
            return (
              <motion.span
                key={slot.key}
                className="inline-flex"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
              >
                {slot.kind === "text" ? (
                  <span className="whitespace-pre">{slot.text}</span>
                ) : (
                  <Digit
                    digit={slot.digit}
                    glyphs={glyphs}
                    dir={last.dir}
                    // Left digits land first, right digits run the full duration.
                    duration={duration * (total > 1 ? 0.6 + 0.4 * (k / (total - 1)) : 1)}
                    spins={spins}
                    blur={blur}
                    reduce={!!reduce}
                    animateIn={animateOnMount || last.changed}
                  />
                )}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </span>
    </span>
  );
}

type DigitProps = {
  digit: number;
  glyphs: string[];
  dir: 1 | -1;
  duration: number;
  spins: number;
  blur: number;
  reduce: boolean;
  /** False on the very first render so the page loads showing the final number. */
  animateIn: boolean;
};

function Digit({ digit, glyphs, dir, duration, spins, blur, reduce, animateIn }: DigitProps) {
  const filterId = `speed${useId()}`;
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const curRef = useRef<HTMLSpanElement>(null);
  const nextRef = useRef<HTMLSpanElement>(null);
  const peak = useRef(1);

  // Unbounded position along the 0-9 loop. Its integer part picks the glyph pair on
  // screen, its fraction slides the pair sideways. A column born after first paint
  // starts at 0 and races up to its digit.
  const pos = useMotionValue(animateIn ? 0 : digit);
  // React renders the glyph text once; from then on it is rewritten imperatively so
  // a new `digit` prop never flashes before the race starts.
  const [initial] = useState(() => mod10(Math.floor(pos.get())));

  const frac = (p: number) => p - Math.floor(p);
  const curX = useTransform(pos, (p) => `${-frac(p) * SLIDE}%`);
  const curO = useTransform(pos, (p) => 1 - frac(p));
  const nextX = useTransform(pos, (p) => `${(1 - frac(p)) * SLIDE}%`);
  const nextO = useTransform(pos, (p) => frac(p));

  useEffect(() => {
    let shown = Math.floor(pos.get());
    return pos.on("change", (p) => {
      const i = Math.floor(p);
      if (i !== shown) {
        shown = i;
        if (curRef.current) curRef.current.textContent = glyphs[mod10(i)];
        if (nextRef.current) nextRef.current.textContent = glyphs[mod10(i + 1)];
      }
      // Smear scales with this digit's own current speed, so slower digits stay sharper.
      if (blur > 0 && blurRef.current) {
        const speed = Math.min(1, Math.abs(pos.getVelocity()) / peak.current);
        blurRef.current.setAttribute("stdDeviation", `${(speed * blur).toFixed(2)} 0`);
      }
    });
  }, [pos, glyphs, blur]);

  useEffect(() => {
    const from = pos.get();
    const smear = blurRef.current;
    if (reduce) {
      pos.set(digit);
      return;
    }
    // Always travel in the direction of change, then add whole laps.
    const gap = mod10(dir * (digit - from)) + spins * 10;
    if (gap < 1e-6) return;

    const target = Math.round(from + dir * gap);
    // Speed that counts as "full blur" for this run: roughly the peak of the ease-out.
    peak.current = (gap / duration) * 3;
    const stop = animate(pos, target, {
      duration,
      ease: EASE_OUT,
      onComplete: () => pos.set(target),
    });
    return () => {
      stop.stop();
      smear?.setAttribute("stdDeviation", "0 0");
    };
  }, [digit, dir, duration, spins, reduce, pos]);

  return (
    <span className="relative inline-block">
      {blur > 0 && (
        <svg aria-hidden="true" className="absolute size-0">
          <filter id={filterId} x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0.00 0.00" />
          </filter>
        </svg>
      )}
      {/* Sizer: reserves one tabular digit of width. */}
      <span className="invisible">0</span>
      <span
        className="absolute inset-0 will-change-transform"
        style={{ filter: blur > 0 ? `url(#${filterId})` : undefined }}
      >
        <motion.span ref={curRef} className="absolute inset-0 text-center" style={{ x: curX, opacity: curO }}>
          {glyphs[initial]}
        </motion.span>
        <motion.span ref={nextRef} className="absolute inset-0 text-center" style={{ x: nextX, opacity: nextO }}>
          {glyphs[mod10(initial + 1)]}
        </motion.span>
      </span>
    </span>
  );
}
