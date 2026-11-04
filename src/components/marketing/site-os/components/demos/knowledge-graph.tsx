"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { LOCALE, MUTED, PANEL, useStep } from "./kit";

/**
 * Knowledge graph: a buyer walks ICP → Offer → Proof → CTA. At the missing
 * proof link they drop off. The gap then heals and the next buyer reaches the CTA.
 * The buyer is shown by a strong border on the node they are at. Click a node to
 * jump the buyer there.
 */
const CHAIN = ["ICP", "Offer", "Proof", "CTA"];
const NODE_W = 52;
const GAP = 40;
const STEP = NODE_W + GAP;
const GRAPH_W = CHAIN.length * NODE_W + (CHAIN.length - 1) * GAP;
const GRAPH_H = 76;
const MID_Y = 34;
const NODE_CX = CHAIN.map((_, i) => i * STEP + NODE_W / 2);
const LAST_STEP = 9;
/** Node the buyer is at on each step; -1 while the gap is being fixed. */
const ACTIVE_NODE = [-1, 0, 1, 2, 2, -1, 0, 1, 2, 3];

function GraphBody({ held, hold }: { held: boolean; hold: () => void }) {
  // 1-3: buyer walks the chain · 4: dropped at the gap · 5: gap healed · 6-9: next buyer arrives.
  const [step, goTo] = useStep(LAST_STEP, 700, held);
  const clipBase = useId().replace(/[^a-zA-Z0-9]/g, "");
  const lost = step >= 3 && step < 5;
  const fixed = step >= 5;
  const reached = step >= LAST_STEP;
  const active = ACTIVE_NODE[step];

  const caption = reached
    ? { text: "Buyer reaches the CTA", tone: "text-primary" }
    : fixed
      ? { text: "Proof added on /pricing", tone: "text-primary" }
      : lost
        ? { text: "Buyer lost: no proof before the CTA", tone: "text-red-400" }
        : { text: "Following a buyer through the chain…", tone: MUTED };

  const linkLength = (i: number) =>
    i === CHAIN.length - 2 ? (fixed ? 1 : step >= 3 ? 0.5 : 0) : step >= i + 1 ? 1 : 0;

  const jumpTo = (i: number) => {
    hold();
    goTo(fixed ? 6 + i : i < 3 ? i + 1 : LAST_STEP);
  };

  return (
    <>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium">Graph</span>
        <span
          className={cn(
            "font-medium tabular-nums transition-colors duration-500",
            fixed ? "text-primary" : "text-red-400",
          )}
        >
          <SpeedCounter
            value={fixed ? 11 : 12}
            duration={0.6}
            spins={0}
            blur={0}
            locale={LOCALE}
          />{" "}
          gaps
        </span>
      </div>
      <svg
        viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
        className="block w-full overflow-visible"
        role="group"
        aria-label="Commercial chain"
      >
        {/* Dotted links are revealed left to right by a growing clip. */}
        <defs>
          {CHAIN.slice(0, -1).map((_, i) => (
            <clipPath key={i} id={`${clipBase}-${i}`}>
              <motion.rect
                x={i * STEP + NODE_W}
                y={0}
                height={GRAPH_H}
                initial={{ width: 0 }}
                animate={{ width: linkLength(i) * GAP }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              />
            </clipPath>
          ))}
        </defs>
        {CHAIN.slice(0, -1).map((_, i) => {
          const x1 = i * STEP + NODE_W;
          const broken = i === CHAIN.length - 2 && !fixed;
          return (
            <path
              key={`link-${i}`}
              d={`M${x1} ${MID_Y} q 10 -7 20 0 t 20 0`}
              fill="none"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeDasharray="0.1 5"
              clipPath={`url(#${clipBase}-${i})`}
              className={cn(
                "transition-colors duration-500",
                broken ? "stroke-red-400" : "stroke-primary",
              )}
            />
          );
        })}

        <motion.path
          d={`M${2 * STEP + NODE_W + 16} ${MID_Y - 4} l 8 8 M${2 * STEP + NODE_W + 24} ${MID_Y - 4} l -8 8`}
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          className="stroke-red-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: lost ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {CHAIN.map((node, i) => {
          const x = i * STEP;
          const tone =
            i === 2 ? (fixed ? "ok" : "bad") : i === 3 && reached ? "ok" : "idle";
          const here = active === i;
          return (
            <g
              key={node}
              role="button"
              tabIndex={0}
              aria-label={`Show the buyer at ${node}`}
              className="group/node cursor-pointer outline-none"
              onClick={() => jumpTo(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  jumpTo(i);
                }
              }}
            >
              <motion.rect
                x={x}
                y={MID_Y - 15}
                width={NODE_W}
                height={30}
                rx={9}
                strokeDasharray={tone === "bad" ? "4 3" : undefined}
                className={cn(
                  "transition-[stroke,fill,stroke-width] duration-300",
                  here ? "[stroke-width:2.75]" : "[stroke-width:1.25]",
                  tone === "bad" && "fill-background stroke-red-400",
                  tone === "ok" && "fill-primary/10 stroke-primary",
                  tone === "idle" &&
                    (here
                      ? "fill-primary/5 stroke-primary"
                      : "fill-background stroke-surface group-hover/node:stroke-primary/70"),
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12, duration: 0.3 }}
              />
              <motion.text
                x={x + NODE_W / 2}
                y={MID_Y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                className={cn(
                  "pointer-events-none transition-colors duration-300",
                  tone === "bad" && "fill-red-400",
                  tone === "ok" && "fill-primary",
                  tone === "idle" && (here ? "fill-primary" : "fill-foreground"),
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 + 0.1, duration: 0.3 }}
              >
                {node}
              </motion.text>
            </g>
          );
        })}

        <motion.text
          x={NODE_CX[3]}
          y={2}
          textAnchor="middle"
          fontSize={10}
          className="pointer-events-none fill-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: reached ? 1 : 0, y: reached ? 8 : 14 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          +1 sale
        </motion.text>
      </svg>
      <motion.p
        key={caption.text}
        className={cn("mt-1 truncate", caption.tone)}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {caption.text}
      </motion.p>
    </>
  );
}

export const ProductKnowledgeGraph = () => {
  const { ref, cycle, held, hold, bind } = useLoop(9000);
  return (
    <div ref={ref} {...bind} className={PANEL}>
      <GraphBody key={cycle} held={held} hold={hold} />
    </div>
  );
};
