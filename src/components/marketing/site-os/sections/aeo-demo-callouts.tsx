"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type RefObject, useEffect, useId, useState } from "react";
import { EASE_OUT } from "@/lib/ease";

export type DemoCallout = {
  id: string;
  /** Matches a `data-aeo-target` attribute inside the demo card. The note only shows while that element exists. */
  target: string;
  side: "left" | "right";
  /** Vertical offset of the note from its target, so the line curves. */
  dy: number;
  /** Where on the target's edge the line lands, 0 (top) to 1 (bottom). */
  at?: number;
  title: string;
  body: string;
};

type Rect = { x: number; y: number; w: number; h: number };
type Layout = { w: number; h: number; fits: boolean; rects: Record<string, Rect> };

const NOTE_W = 200;
const GAP = 16;
const NOTE_SPACING = 8;

function sameLayout(a: Layout, b: Layout) {
  if (a.w !== b.w || a.h !== b.h || a.fits !== b.fits) return false;
  const keys = Object.keys(b.rects);
  if (keys.length !== Object.keys(a.rects).length) return false;
  return keys.every((k) => {
    const p = a.rects[k];
    const q = b.rects[k];
    return p && p.x === q.x && p.y === q.y && p.w === q.w && p.h === q.h;
  });
}

/** Box of the target, or for `data-aeo-fit` targets the box of the content actually inside it, clipped to what is visible. */
function boxOf(t: Element): DOMRect | null {
  const r = t.getBoundingClientRect();
  if (!t.hasAttribute("data-aeo-fit")) return r.width > 0 && r.height > 0 ? r : null;
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  for (const c of Array.from(t.children)) {
    const cr = c.getBoundingClientRect();
    if (cr.height === 0) continue;
    left = Math.min(left, cr.left);
    right = Math.max(right, cr.right);
    top = Math.min(top, cr.top);
    bottom = Math.max(bottom, cr.bottom);
  }
  top = Math.max(top, r.top);
  bottom = Math.min(bottom, r.bottom);
  if (!(right > left) || !(bottom > top)) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

const MIN_VISIBLE = 12;

/** `boxOf`, cut down to what its scrolling or clipping ancestors still show. Null once it has scrolled out of view. */
function visibleBox(t: Element, root: Element): DOMRect | null {
  const box = boxOf(t);
  if (!box) return null;
  let left = box.left;
  let right = box.right;
  let top = box.top;
  let bottom = box.bottom;
  for (let a = t.parentElement; a && a !== root; a = a.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(a);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const ar = a.getBoundingClientRect();
    if (overflowX !== "visible") {
      left = Math.max(left, ar.left);
      right = Math.min(right, ar.right);
    }
    if (overflowY !== "visible") {
      top = Math.max(top, ar.top);
      bottom = Math.min(bottom, ar.bottom);
    }
  }
  if (right - left < MIN_VISIBLE || bottom - top < MIN_VISIBLE) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

function useLayout(root: RefObject<HTMLElement | null>, items: DemoCallout[], noteW: number) {
  const [layout, setLayout] = useState<Layout>({ w: 0, h: 0, fits: false, rects: {} });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const base = el.getBoundingClientRect();
      const ox = base.left + el.clientLeft;
      const oy = base.top + el.clientTop;
      const rects: Record<string, Rect> = {};
      for (const it of items) {
        const t = el.querySelector(`[data-aeo-target="${it.target}"]`);
        const r = t && visibleBox(t, el);
        if (r) rects[it.id] = { x: r.left - ox, y: r.top - oy, w: r.width, h: r.height };
      }
      const room = noteW + GAP + 4;
      const fits = base.left >= room && document.documentElement.clientWidth - base.right >= room;
      const next = { w: el.clientWidth, h: el.clientHeight, fits, rects };
      setLayout((prev) => (sameLayout(prev, next) ? prev : next));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    schedule();
    // Watch the demo content only, never the overlay itself, so its own animation can't retrigger a measure.
    const content = el.querySelector('[role="tabpanel"]') ?? el;
    const mo = new MutationObserver(schedule);
    mo.observe(content, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "aria-expanded", "aria-pressed"],
    });
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener("resize", schedule);
    el.addEventListener("scroll", schedule, true);
    document.fonts?.ready.then(schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      el.removeEventListener("scroll", schedule, true);
    };
  }, [root, items, noteW]);

  return layout;
}

type Placed = DemoCallout & { rect: Rect; tx: number; ty: number; sx: number; sy: number; index: number };

/** Places each present note beside its target, nudging notes on the same side apart so they never stack. */
function place(items: DemoCallout[], layout: Layout): Placed[] {
  const placed = items.flatMap((it, index) => {
    const rect = layout.rects[it.id];
    if (!rect) return [];
    const left = it.side === "left";
    const ty = rect.y + rect.h * (it.at ?? 0.5);
    return [
      {
        ...it,
        rect,
        index,
        tx: left ? rect.x : rect.x + rect.w,
        ty,
        sx: left ? -GAP : layout.w + GAP,
        sy: ty + it.dy,
      },
    ];
  });
  for (const side of ["left", "right"] as const) {
    const col = placed.filter((p) => p.side === side).sort((a, b) => a.sy - b.sy);
    let floor = -Infinity;
    for (const p of col) {
      const half = (56 + Math.ceil(p.body.length / 32) * 20) / 2;
      p.sy = Math.max(p.sy, floor + half);
      floor = p.sy + half + NOTE_SPACING;
    }
  }
  return placed;
}

function Connector({
  p,
  hot,
  reduced,
  maskId,
  noteW,
  outline,
}: {
  p: Placed;
  hot: boolean;
  reduced: boolean | null;
  maskId: string;
  noteW: number;
  outline: boolean;
}) {
  const { rect: r, tx, ty, sx, sy } = p;
  const mx = (sx + tx) / 2;
  const d = `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`;
  const delay = reduced ? 0 : 0.3 + Math.min(p.index, 2) * 0.15;

  return (
    <motion.g exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-noteW - GAP * 2} y={-60} width={9999} height={9999}>
          <motion.path
            d={d}
            fill="none"
            stroke="white"
            strokeWidth={6}
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 0.7, delay, ease: EASE_OUT }}
          />
        </mask>
      </defs>

      {outline ? (
        <>
          {/* Outline of the target: flashes once when the line lands, then again on hover. */}
          <motion.rect
            x={r.x - 4}
            y={r.y - 4}
            width={r.w + 8}
            height={r.h + 8}
            rx={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="2 6"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: hot ? 0.9 : 0 }}
            transition={{ duration: 0.2 }}
          />
          {reduced ? null : (
            <motion.rect
              x={r.x - 4}
              y={r.y - 4}
              width={r.w + 8}
              height={r.h + 8}
              rx={16}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 1, delay: delay + 0.6, ease: "easeOut" }}
            />
          )}
        </>
      ) : null}

      <g mask={`url(#${maskId})`}>
        <motion.path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeDasharray="0.1 7"
          initial={false}
          animate={{ opacity: hot ? 1 : 0.55, strokeDashoffset: reduced ? 0 : [0, -7.1] }}
          transition={{
            opacity: { duration: 0.2 },
            strokeDashoffset: { duration: hot ? 0.5 : 0.9, ease: "linear", repeat: Infinity },
          }}
        />
      </g>

      {/* The end dot fades in once the line lands, then fades out and in for as long as the note is shown. */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.3, delay: delay + 0.55 }}
      >
        <motion.circle
          cx={tx}
          cy={ty}
          r={3.5}
          fill="currentColor"
          animate={reduced ? undefined : { opacity: [1, 0.15] }}
          transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        />
      </motion.g>
    </motion.g>
  );
}

function Note({
  p,
  reduced,
  onHover,
  noteW,
}: {
  p: Placed;
  reduced: boolean | null;
  onHover: (id: string | null) => void;
  noteW: number;
}) {
  const left = p.side === "left";
  return (
    <motion.div
      className="absolute"
      style={{ top: p.sy, width: noteW, ...(left ? { left: -(noteW + GAP) } : { right: -(noteW + GAP) }) }}
      initial={false}
      animate={{ top: p.sy }}
      transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, x: reduced ? 0 : left ? -14 : 14, scale: reduced ? 1 : 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: reduced ? 0 : left ? -8 : 8 }}
        whileHover={reduced ? undefined : { y: -2 }}
        transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.2 + Math.min(p.index, 2) * 0.15, ease: EASE_OUT }}
        onHoverStart={() => onHover(p.id)}
        onHoverEnd={() => onHover(null)}
        className="pointer-events-auto -translate-y-1/2 cursor-default rounded-[14px] border border-solid border-border bg-raised p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_28px_-8px_rgba(0,0,0,0.16)] dark:bg-tint dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_32px_-8px_rgba(0,0,0,0.75)]"
      >
        <p className="text-xs font-semibold">{p.title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{p.body}</p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Explainer notes tied to the demo by dotted, flowing lines. A note exists only while the thing it
 * describes is on screen, so lines appear and retract as the demo changes. Without room beside the
 * card, the same notes show as a numbered list underneath.
 */
export default function AeoCallouts({
  root,
  items,
  noteWidth = NOTE_W,
  outline = true,
}: {
  root: RefObject<HTMLElement | null>;
  items: DemoCallout[];
  /** Width of each note beside the card. */
  noteWidth?: number;
  /** Draw the dashed outline around the target. Off when the target should stay unframed. */
  outline?: boolean;
}) {
  const reduced = useReducedMotion();
  const maskBase = useId().replace(/:/g, "");
  const [hot, setHot] = useState<string | null>(null);
  const layout = useLayout(root, items, noteWidth);
  const placed = place(items, layout);

  if (!layout.fits) {
    return (
      <ol className="mt-5 grid gap-3 border-t border-solid border-surface pt-5 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {placed.map((p, i) => (
            <motion.li
              key={p.id}
              layout={!reduced}
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: EASE_OUT }}
              className="flex gap-2.5"
            >
              <span
                aria-hidden
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-tint font-mono text-[0.625rem] font-semibold tabular-nums"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{p.body}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    );
  }

  return (
    <div aria-hidden>
      <svg
        className="pointer-events-none absolute left-0 top-0 overflow-visible text-foreground"
        width={layout.w}
        height={layout.h}
      >
        <AnimatePresence>
          {placed.map((p) => (
            <Connector
              key={p.id}
              p={p}
              hot={hot === p.id}
              reduced={reduced}
              maskId={`${maskBase}-${p.id}`}
              noteW={noteWidth}
              outline={outline}
            />
          ))}
        </AnimatePresence>
      </svg>
      <AnimatePresence>
        {placed.map((p) => (
          <Note key={p.id} p={p} reduced={reduced} onHover={setHot} noteW={noteWidth} />
        ))}
      </AnimatePresence>
    </div>
  );
}
