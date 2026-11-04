"use client";

import { motion } from "motion/react";
import {
  Check,
  Download,
  Loader,
  MousePointer2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { CrawlFindingsDemo } from "./crawl-findings-demo";
import { useLoop } from "./use-loop";
import {
  ChatgptIcon,
  ClaudeIcon,
  CursorIcon,
  GeminiIcon,
  GlobeIcon,
  MappingIcon,
  PdfIcon,
} from "@/components/icons";

const LOCALE = "en-US";
const PANEL =
  "w-full max-w-sm rounded-[14px] border border-solid border-surface bg-surface-3 p-3 text-xs leading-4";
/** Full-width variant for tiles that span 2 or 3 columns. */
const WIDE =
  "h-full w-full rounded-[14px] border border-solid border-surface bg-surface-3 p-3 text-xs leading-4";
const MUTED = "text-muted-foreground";

/**
 * Counts 0..max, one step per `ms`, then holds. Give the caller a `key` that
 * changes per loop to replay it. The only setState happens inside a timeout.
 */
function useStep(max: number, ms: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= max) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), ms);
    return () => window.clearTimeout(id);
  }, [step, max, ms]);
  return step;
}

/** A browser-style window: traffic lights and a URL bar over the crawled page. */
function MacWindow({
  url,
  className,
  children,
}: {
  url: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-solid border-surface bg-background",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-solid border-surface px-2 py-1.5">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-primary" />
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate rounded bg-surface-3 px-2 py-0.5 text-center font-mono text-[0.625rem]",
            MUTED,
          )}
        >
          {url}
        </span>
      </div>
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </div>
  );
}

/** Shimmer that sweeps across its (relative, overflow-hidden) parent while a page is being read. */
function ScanSweep() {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 w-1/3 [background-image:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]"
      animate={{ x: ["-100%", "300%"] }}
      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
    />
  );
}

export const ProductCrawlFindings = () => <CrawlFindingsDemo />;

/** Revenue impact: each issue's score fills its bar and counts up. */
const ISSUES = [
  {
    label: "Missing proof on /pricing",
    tag: "Critical",
    score: 92,
    tone: "text-red-400",
  },
  {
    label: "No CTA above the fold on /",
    tag: "High",
    score: 74,
    tone: "text-amber-400",
  },
  { label: "Weak H1 on /features", tag: "Medium", score: 48, tone: MUTED },
];

export const ProductRevenueImpact = () => {
  const { ref, cycle } = useLoop(6000);
  return (
    <div ref={ref} className={PANEL}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">Revenue impact</span>
        <span className="font-medium text-primary tabular-nums">
          <SpeedCounter
            key={cycle}
            value={34}
            animateOnMount
            duration={0.9}
            spins={0}
            blur={0}
            locale={LOCALE}
          />
          %<span className={cn("ml-1 font-normal", MUTED)}>at risk</span>
        </span>
      </div>
      <ul key={cycle} className="flex flex-col gap-1.5 [list-style-type:none]">
        {ISSUES.map((issue, i) => (
          <li
            key={issue.label}
            className="relative overflow-hidden rounded-lg border border-solid border-surface bg-background px-2.5 py-2"
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-full origin-left bg-color-001/15"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: issue.score / 100 }}
              transition={{
                delay: 0.3 + i * 0.18,
                duration: 0.9,
                ease: EASE_OUT,
              }}
            />
            <div className="relative flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">{issue.label}</span>
              <span className="flex shrink-0 items-baseline gap-1.5 text-[0.6875rem] tabular-nums">
                <span className={issue.tone}>{issue.tag}</span>
                <span className="font-medium">
                  <SpeedCounter
                    value={issue.score}
                    animateOnMount
                    duration={0.9}
                    spins={0}
                    blur={0}
                    locale={LOCALE}
                  />
                  <span className={MUTED}>/100</span>
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Knowledge graph: a buyer walks ICP → Offer → Proof → CTA. At the missing
 * proof link they drop off. The gap then heals and the next buyer reaches the CTA.
 */
const CHAIN = ["ICP", "Offer", "Proof", "CTA"];
const NODE_W = 52;
const GAP = 40;
const STEP = NODE_W + GAP;
const GRAPH_W = CHAIN.length * NODE_W + (CHAIN.length - 1) * GAP;
const GRAPH_H = 76;
const MID_Y = 34;
const NODE_CX = CHAIN.map((_, i) => i * STEP + NODE_W / 2);

function GraphBody() {
  // 1-3: buyer walks the chain · 4: dropped at the gap · 5: gap healed · 6-7: next buyer arrives.
  const step = useStep(7, 800);
  const clipBase = useId().replace(/[^a-zA-Z0-9]/g, "");
  const lost = step >= 3 && step < 5;
  const fixed = step >= 5;
  const reached = step >= 7;

  const caption = reached
    ? { text: "Buyer reaches the CTA", tone: "text-primary" }
    : fixed
      ? { text: "Proof added on /pricing", tone: "text-primary" }
      : lost
        ? { text: "Buyer lost: no proof before the CTA", tone: "text-red-400" }
        : { text: "Following a buyer through the chain…", tone: MUTED };

  // Node the ring sits on: ICP, Offer, Proof (stuck), then the next buyer runs to the CTA.
  const ringIndex = step < 2 ? 0 : step < 3 ? 1 : step < 5 ? 2 : step < 6 ? 0 : 3;
  const ringOn = step >= 1 && step !== 5;

  const linkLength = (i: number) =>
    i === CHAIN.length - 2 ? (fixed ? 1 : step >= 3 ? 0.5 : 0) : step >= i + 1 ? 1 : 0;

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
        aria-hidden="true"
      >
        {CHAIN.map((node, i) => {
          const x = i * STEP;
          const tone =
            i === 2 ? (fixed ? "ok" : "bad") : i === 3 && reached ? "ok" : "idle";
          return (
            <g key={node}>
              <motion.rect
                x={x}
                y={MID_Y - 15}
                width={NODE_W}
                height={30}
                rx={9}
                strokeWidth={1.25}
                strokeDasharray={tone === "bad" ? "4 3" : undefined}
                className={cn(
                  "transition-colors duration-500",
                  tone === "bad" && "fill-background stroke-red-400",
                  tone === "ok" && "fill-primary/10 stroke-primary",
                  tone === "idle" && "fill-background stroke-surface",
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
                  "transition-colors duration-500",
                  tone === "bad" && "fill-red-400",
                  tone === "ok" && "fill-primary",
                  tone === "idle" && "fill-foreground",
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

        {/* The buyer: one strong ring over a node's border that moves node to node. */}
        <motion.rect
          y={MID_Y - 18}
          width={NODE_W + 8}
          height={36}
          rx={12}
          fill="none"
          strokeWidth={2.5}
          className={cn(
            "transition-colors duration-300",
            lost ? "stroke-red-400" : "stroke-primary",
          )}
          initial={{ x: -4, opacity: 0 }}
          animate={{ x: ringIndex * STEP - 4, opacity: ringOn ? 1 : 0 }}
          transition={{
            x: { duration: step >= 6 ? 1.3 : 0.6, ease: EASE_OUT },
            opacity: { duration: 0.2 },
          }}
        />
        <motion.text
          x={NODE_CX[3]}
          y={2}
          textAnchor="middle"
          fontSize={10}
          className="fill-primary"
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
  const { ref, cycle } = useLoop(9000);
  return (
    <div ref={ref} className={PANEL}>
      <GraphBody key={cycle} />
    </div>
  );
};

/** Visits from AI assistants: counts tick live and bars rescale. */
const SOURCES = [
  { label: "ChatGPT", icon: ChatgptIcon, base: 142, step: 4 },
  { label: "Claude", icon: ClaudeIcon, base: 61, step: 2 },
  { label: "Gemini", icon: GeminiIcon, base: 24, step: 1 },
];

export const ProductAiTraffic = () => {
  const { ref, cycle } = useLoop(2400);
  const visits = SOURCES.map((s) => s.base + s.step * (cycle % 6));
  const max = Math.max(...visits);
  return (
    <div ref={ref} className={PANEL}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">Visits from AI tools</span>
        <span className={cn("text-[0.6875rem]", MUTED)}>live</span>
      </div>
      <ul className="flex flex-col gap-1.5 [list-style-type:none]">
        {SOURCES.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.label} className="group flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-solid border-surface bg-background transition-colors duration-200 group-hover:border-primary/60 group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-solid border-surface bg-background py-1.5 pr-2 pl-2.5 transition-colors duration-200 group-hover:border-primary/60">
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 rounded-lg bg-color-001/15 transition-[width,background-color] duration-700 ease-out group-hover:bg-primary/20"
                  style={{ width: `${(visits[i] / max) * 100}%` }}
                />
                <div className="relative flex items-center justify-between gap-2">
                  <span className="truncate">{s.label}</span>
                  <span className="tabular-nums font-medium">
                    <SpeedCounter
                      value={visits[i]}
                      duration={0.6}
                      spins={0}
                      blur={0}
                      locale={LOCALE}
                    />
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * AI answer readiness, wide: the scanner reads the page and the score ring fills
 * as each check lands. Then an assistant answers a buyer question and cites the page.
 */
const PAGE_LINE_WIDTHS = ["88%", "62%", "92%", "74%", "84%", "58%"];
const READINESS_CHECKS = [
  { label: "Direct answer", ok: true, line: 0 },
  { label: "FAQ schema", ok: false, line: 2 },
  { label: "Author and date", ok: true, line: 4 },
];
/** Score after each check lands. Index 0 is before any check. */
const READINESS_SCORES = [0, 34, 51, 68];
const LINE_PITCH = 16;
const ANSWER_WORDS = "Acme is a CRM built for small agencies, with client reporting included.".split(" ");

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative size-14 shrink-0">
      <svg viewBox="0 0 40 40" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-surface-4" />
        <motion.circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums">
        <SpeedCounter value={score} duration={0.8} spins={0} blur={0} locale={LOCALE} />
      </span>
    </div>
  );
}

function ReadinessBody() {
  // 1-3: checks land · 4: the assistant answers · 5: it cites the page.
  const step = useStep(5, 800);
  const scanLine = step >= READINESS_CHECKS.length ? 5 : (READINESS_CHECKS[step]?.line ?? 0);
  const score = READINESS_SCORES[Math.min(step, READINESS_CHECKS.length)];
  const answering = step >= 4;
  const cited = step >= 5;

  return (
    <div className="flex h-full flex-col gap-3 @sm:flex-row">
      <MacWindow url="example.com/pricing" className="w-full @sm:w-[38%]">
        <div className="relative flex flex-col gap-2 overflow-hidden">
          <motion.div
            aria-hidden="true"
            className="absolute right-0 left-0 rounded-sm bg-color-001/20"
            style={{ height: LINE_PITCH + 2 }}
            animate={{ top: scanLine * LINE_PITCH - 3, opacity: answering ? 0 : 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
          {PAGE_LINE_WIDTHS.map((w, i) => (
            <div key={i} className="relative flex h-2 items-center">
              <span
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-500",
                  cited && i <= 1 ? "bg-primary/60" : "bg-surface-4",
                )}
                style={{ width: w }}
              />
            </div>
          ))}
        </div>
      </MacWindow>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-center gap-3">
          <ScoreRing score={score} />
          <ul className="flex min-w-0 flex-1 flex-col [list-style-type:none]">
            {READINESS_CHECKS.map((c, i) => {
              const shown = step > i;
              return (
                <li
                  key={c.label}
                  className="flex items-center justify-between gap-2 py-0.5 text-[0.6875rem]"
                >
                  <span className="truncate">{c.label}</span>
                  <span
                    className={cn(
                      "transition-colors duration-500",
                      !shown ? MUTED : c.ok ? "text-primary" : "text-red-400",
                    )}
                  >
                    {!shown ? "…" : c.ok ? "Pass" : "Fix"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-lg border border-solid border-surface bg-background px-2.5 py-1.5">
          <div className="mb-0.5 flex items-center justify-between gap-2 text-[0.6875rem]">
            <span className={cn("flex min-w-0 items-center gap-1", MUTED)}>
              <GeminiIcon className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">AI answer</span>
            </span>
            {cited && (
              <motion.span
                className="flex shrink-0 items-center gap-1 rounded-md border border-solid border-primary/40 bg-primary/10 px-1.5 text-[0.625rem] text-primary"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <Check className="size-2.5" aria-hidden="true" />
                Cited: example.com
              </motion.span>
            )}
          </div>
          <p className="min-h-8 text-[0.6875rem] leading-4">
            {answering ? (
              ANSWER_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.2 }}
                >
                  {word}{" "}
                </motion.span>
              ))
            ) : (
              <span className={cn("animate-pulse", MUTED)}>Reading example.com/pricing…</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export const ProductAnswerReadiness = () => {
  const { ref, cycle } = useLoop(7500);
  return (
    <div ref={ref} className={WIDE}>
      <ReadinessBody key={cycle} />
    </div>
  );
};

/** Citation probe: a buyer question is typed, checked, and one competitor-only result is missed. */
const QUERY = "crm for small agencies";
const RESULTS = [
  { q: "best crm for small agencies", cited: true },
  { q: "crm with client reporting", cited: false },
  { q: "how to choose an agency crm", cited: true },
];

/** Types `QUERY` out one character at a time. Remounted per loop via `key`, so it restarts from empty. */
function TypedQuery() {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (typed >= QUERY.length) return;
    const id = window.setTimeout(() => setTyped(typed + 1), 70);
    return () => window.clearTimeout(id);
  }, [typed]);
  return (
    <span className="min-w-0 flex-1 truncate">
      {QUERY.slice(0, typed)}
      <span className="ml-px inline-block h-3 w-px translate-y-0.5 animate-pulse bg-foreground" />
    </span>
  );
}

export const ProductCitationProbe = () => {
  const { ref, cycle } = useLoop(7000);

  return (
    <div ref={ref} className={cn(PANEL, "relative overflow-hidden")}>
      <div className="mb-2 flex h-7 items-center gap-2 rounded-lg border border-solid border-surface bg-background pr-1 pl-2.5">
        <Search className={cn("size-3.5 shrink-0", MUTED)} aria-hidden="true" />
        <TypedQuery key={cycle} />
        <motion.span
          key={`btn-${cycle}`}
          className="rounded-md bg-primary px-2 py-0.5 text-[0.6875rem] font-medium text-background"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 0.92, 1] }}
          transition={{ delay: 2.6, duration: 0.3 }}
        >
          Check
        </motion.span>
      </div>
      <ul key={cycle} className="flex flex-col gap-1.5 [list-style-type:none]">
        {RESULTS.map((r, i) => (
          <motion.li
            key={r.q}
            className="flex items-center justify-between gap-2 rounded-lg border border-solid border-surface bg-background px-2.5 py-1.5"
            initial={{ opacity: 0, y: 6 }}
            animate={
              r.cited
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0, x: [0, -5, 0, 0] }
            }
            transition={{
              opacity: { delay: 3 + i * 0.3, duration: 0.35, ease: EASE_OUT },
              y: { delay: 3 + i * 0.3, duration: 0.35, ease: EASE_OUT },
              x: { delay: 4.4, duration: 0.5, ease: "easeInOut" },
            }}
          >
            <span className="min-w-0 truncate">{r.q}</span>
            <motion.span
              className={cn(
                "flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium",
                r.cited ? "text-primary" : "text-red-400",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.6 + i * 0.3, duration: 0.3 }}
            >
              {r.cited ? (
                <Check className="size-3" aria-hidden="true" />
              ) : (
                <X className="size-3" aria-hidden="true" />
              )}
              {r.cited ? "Cited" : "Missed"}
            </motion.span>
          </motion.li>
        ))}
      </ul>
      <motion.span
        key={`cursor-${cycle}`}
        className="pointer-events-none absolute top-0 left-0 text-foreground"
        initial={{ left: "55%", top: 150, opacity: 0 }}
        animate={{ left: "78%", top: 14, opacity: [0, 1, 1, 0] }}
        transition={{
          delay: 1.6,
          duration: 2.4,
          ease: EASE_OUT,
          times: [0, 0.2, 0.9, 1],
        }}
      >
        <MousePointer2 className="size-4 fill-foreground" aria-hidden="true" />
      </motion.span>
    </div>
  );
};

/** Topic map: uncovered topics light up as the next pages get written. */
const TOPICS = [
  { label: "Pricing", covered: true },
  { label: "Integrations", covered: true },
  { label: "Case studies", covered: false },
  { label: "Security", covered: false },
];

export const ProductTopicMap = () => {
  const { ref, cycle } = useLoop(3600);
  const filled = cycle % 2 === 1;
  const missing = filled ? 0 : TOPICS.filter((t) => !t.covered).length;
  return (
    <div ref={ref} className={PANEL}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">Topic map</span>
        <span className="font-medium tabular-nums">
          {missing ? (
            <>
              <SpeedCounter
                value={missing}
                duration={0.5}
                spins={0}
                blur={0}
                locale={LOCALE}
              />{" "}
              missing
            </>
          ) : (
            <span className="text-primary">All covered</span>
          )}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-1.5 [list-style-type:none]">
        {TOPICS.map((t) => {
          const on = t.covered || filled;
          return (
            <li
              key={t.label}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-solid px-2 py-1.5 transition-colors duration-700",
                on
                  ? "border-surface bg-background"
                  : "border-dashed border-red-400/50 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full transition-colors duration-700",
                  on ? "bg-primary" : "bg-red-400",
                )}
              />
              {t.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/** Fix prompts: pick a model, see a shimmer while it "generates", then the prompt. Dummy copy, no API. */
const PROVIDERS = [
  {
    name: "Claude",
    icon: ClaudeIcon,
    text: "In the /pricing template, add one H1 that names the offer and the buyer it is for. Keep it under 70 characters.",
  },
  {
    name: "ChatGPT",
    icon: ChatgptIcon,
    text: "Add one H1 to /pricing that names the offer and the buyer. Reuse the hero offer name. Do not add new claims.",
  },
  {
    name: "Cursor",
    icon: CursorIcon,
    text: "Update /pricing: one H1 naming the offer and its buyer, matching the existing hero copy. Leave the layout unchanged.",
  },
];

function Shimmer() {
  return (
    <div className="flex flex-col gap-1.5" aria-label="Generating">
      {[100, 92, 60].map((w) => (
        <div
          key={w}
          className="relative h-2.5 overflow-hidden rounded bg-surface-4"
          style={{ width: `${w}%` }}
        >
          <motion.div
            className="absolute inset-0 [background-image:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
        </div>
      ))}
    </div>
  );
}

/** Shows a shimmer for a moment, then the prompt. Remounted per model pick via `key`. */
function Generation({ provider }: { provider: (typeof PROVIDERS)[number] }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), 1100);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-medium">Missing H1 on /pricing</span>
        <span
          className={cn(
            "shrink-0 rounded-md border border-solid border-surface px-1.5 py-0.5 text-[0.6875rem]",
            MUTED,
          )}
        >
          {done ? provider.name : "Draft"}
        </span>
      </div>
      {done ? (
        <p className={cn("font-mono text-[0.6875rem] leading-4", MUTED)}>
          {provider.text}
        </p>
      ) : (
        <>
          <Shimmer />
          <p className={cn("mt-2 text-[0.6875rem]", MUTED)}>
            Generating with {provider.name}…
          </p>
        </>
      )}
    </>
  );
}

export const ProductFixPrompts = () => {
  const { ref, cycle } = useLoop(4800);
  const [pick, setPick] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const active = pick ?? cycle % PROVIDERS.length;
  const provider = PROVIDERS[active];

  return (
    <div ref={ref} className={PANEL}>
      <div className="mb-2 flex gap-1" role="group" aria-label="Model">
        {PROVIDERS.map((p, i) => {
          const Icon = p.icon;
          const on = i === active;
          return (
            <button
              key={p.name}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setPick(i);
                setRun((r) => r + 1);
              }}
              className={cn(
                "pointer-events-auto flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-solid px-1.5 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                on
                  ? "border-primary bg-primary/10 text-primary"
                  : cn("border-surface hover:border-primary/60 hover:bg-primary/10 hover:text-primary", MUTED),
              )}
            >
              <Icon className="size-3" aria-hidden="true" />
              {p.name}
            </button>
          );
        })}
      </div>
      <div className="rounded-lg border border-solid border-surface bg-background p-2.5 transition-colors duration-200 hover:border-primary/50">
        <Generation key={`${active}-${run}`} provider={provider} />
      </div>
    </div>
  );
};

/**
 * Growth brief, wide: the four stages of building the report run in turn,
 * then the cursor clicks Download, the PDF generates, and the values land.
 */
const BRIEF_STAGES = [
  { label: "Crawl the site", note: "82 pages", icon: GlobeIcon },
  { label: "Score every finding", note: "47 findings", icon: GeminiIcon },
  { label: "Map the commercial graph", note: "12 gaps", icon: MappingIcon },
  { label: "Write the brief", note: "PDF ready", icon: PdfIcon },
];
const BRIEF_LINES = [
  { value: 12, text: "graph gaps ranked by revenue" },
  { value: 47, text: "findings, 6 critical" },
  { value: null, text: "Next: add proof to /pricing" },
];

function GrowthBriefBody() {
  // 1-4: stages finish · 5: cursor presses Download · 6: generating · 7: ready.
  const step = useStep(7, 800);
  const pressed = step === 5;
  const generating = step === 6;
  const ready = step >= 7;
  const cursorVisible = step >= 4 && step < 7;

  return (
    <div className="flex h-full flex-col gap-2 @sm:flex-row">
      <ol className="relative flex w-full flex-col @sm:w-[44%]">
        {/* Dotted spine through the stage icons (icon centres sit at 12.5%, 37.5%, ...). */}
        <svg aria-hidden="true" className="absolute top-0 left-0 h-full w-6 overflow-visible">
          <motion.line
            x1="12"
            x2="12"
            y1="12.5%"
            y2="87.5%"
            className="stroke-primary"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeDasharray="0.1 5"
            animate={{ strokeDashoffset: [0, -10.2] }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </svg>
        {BRIEF_STAGES.map((s, i) => {
          const done = step > i;
          const Icon = s.icon;
          return (
            <li key={s.label} className="relative flex min-h-7 flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md border border-solid transition-colors duration-500",
                  done
                    ? "border-primary bg-primary text-background"
                    : "border-surface bg-background",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <span
                className={cn(
                  "shrink-0 text-[0.6875rem] tabular-nums transition-opacity duration-500",
                  done ? "text-primary opacity-100" : "opacity-0",
                )}
              >
                {s.note}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Dotted path carrying the finished stages across to the brief. */}
      <div className="relative hidden w-8 shrink-0 @sm:block">
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          {BRIEF_STAGES.map((s, i) => (
            <motion.line
              key={s.label}
              x1="0"
              x2="100%"
              y1={`${12.5 + i * 25}%`}
              y2={`${12.5 + i * 25}%`}
              className="stroke-primary"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeDasharray="0.1 5"
              animate={{ strokeDashoffset: [0, -10.2] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          ))}
        </svg>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border border-solid border-surface bg-background p-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="font-medium">Growth brief</span>
            <span className="flex items-center gap-0.5 text-[0.6875rem] text-primary">
              <TrendingUp className="size-3" aria-hidden="true" />
              +18.4%
            </span>
          </span>
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium transition-[transform,background-color] duration-300",
              ready ? "bg-surface-4 text-foreground" : "bg-primary text-background",
              pressed && "scale-95",
            )}
          >
            {ready ? (
              <>
                <Check className="size-3" aria-hidden="true" />
                Downloaded
              </>
            ) : generating ? (
              <>
                <motion.span
                  className="flex"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                >
                  <Loader className="size-3" aria-hidden="true" />
                </motion.span>
                Generating…
              </>
            ) : (
              <>
                <Download className="size-3" aria-hidden="true" />
                Download PDF
              </>
            )}
          </div>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col [list-style-type:none]">
          {BRIEF_LINES.map((l) => (
            <li
              key={l.text}
              className="flex min-h-7 flex-1 items-center gap-1.5 border-t border-solid border-surface text-[0.8125rem]"
            >
              {l.value !== null &&
                (ready ? (
                  <span className="font-medium tabular-nums">
                    <SpeedCounter
                      value={l.value}
                      animateOnMount
                      duration={0.7}
                      spins={0}
                      blur={0}
                      locale={LOCALE}
                    />
                  </span>
                ) : (
                  <span className={cn("font-medium", MUTED)}>—</span>
                ))}
              <span>{l.text}</span>
            </li>
          ))}
        </ul>

        <MousePointer2
          aria-hidden="true"
          className="pointer-events-none absolute size-4 fill-foreground text-foreground transition-[left,top,opacity] duration-700 ease-out"
          style={{
            left: cursorVisible ? "80%" : "100%",
            top: cursorVisible ? "6%" : "100%",
            opacity: cursorVisible ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}

export const ProductGrowthBrief = () => {
  const { ref, cycle } = useLoop(9000);
  return (
    <div ref={ref} className={WIDE}>
      <GrowthBriefBody key={cycle} />
    </div>
  );
};

/**
 * Search Console, wide: a crawler walks the site page by page, and the queries
 * each page earns show up on the right with their clicks counting in.
 */
const CRAWL_PAGES = ["/", "/features", "/pricing", "/blog/crm-guide"];
const FOUND_QUERIES = [
  { q: "privacy friendly analytics", clicks: 764, up: true, at: 2 },
  { q: "cookieless analytics", clicks: 612, up: true, at: 3 },
  { q: "ga4 alternative", clicks: 341, up: false, at: 4 },
];

function SearchConsoleBody() {
  const step = useStep(CRAWL_PAGES.length, 800);
  const done = step >= CRAWL_PAGES.length;
  const current = CRAWL_PAGES[Math.min(step, CRAWL_PAGES.length - 1)];

  return (
    <div className="flex h-full flex-col gap-2 @sm:flex-row">
      <MacWindow url={`example.com${current}`} className="w-full @sm:w-[44%]">
        <ul className="flex h-full flex-col [list-style-type:none]">
          {CRAWL_PAGES.map((p, i) => {
            const crawled = step > i;
            const scanning = step === i && !done;
            return (
              <li
                key={p}
                className={cn(
                  "relative flex min-h-6 flex-1 items-center justify-between gap-2 overflow-hidden rounded px-1.5 text-xs leading-4 transition-colors duration-300",
                  scanning && "bg-surface-3",
                )}
              >
                <span className="min-w-0 truncate font-mono">{p}</span>
                {crawled && (
                  <Check className="size-3 shrink-0 text-primary" aria-hidden="true" />
                )}
                {scanning && <ScanSweep />}
              </li>
            );
          })}
        </ul>
      </MacWindow>

      {/* Dotted paths carrying each page's queries across; they light up as the queries land. */}
      <div className="hidden w-8 shrink-0 flex-col gap-1.5 @sm:flex" aria-hidden="true">
        <div className="h-4" />
        {FOUND_QUERIES.map((item) => (
          <div
            key={item.q}
            className={cn(
              "flex flex-1 items-center transition-opacity duration-500",
              step >= item.at ? "opacity-100" : "opacity-25",
            )}
          >
            <svg className="h-1 w-full overflow-visible">
              <motion.line
                x1="0"
                x2="100%"
                y1="2"
                y2="2"
                className="stroke-primary"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeDasharray="0.1 5"
                animate={{ strokeDashoffset: [0, -10.2] }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex h-4 items-center justify-between text-[0.6875rem]">
          <span className="font-medium">Queries</span>
          <span className={MUTED}>{done ? "Crawl complete" : "Crawling…"}</span>
        </div>
        {FOUND_QUERIES.map((item) => {
          const shown = step >= item.at;
          return (
            <div
              key={item.q}
              className="flex min-h-8 flex-1 items-center justify-between gap-2 rounded-md border border-solid border-surface bg-background px-2.5"
            >
              {shown ? (
                <>
                  <span className="min-w-0 truncate">{item.q}</span>
                  <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
                    <span className={item.up ? "text-primary" : "text-red-400"}>
                      {item.up ? "▲" : "▼"}
                    </span>
                    <span className="font-medium">
                      <SpeedCounter
                        value={item.clicks}
                        animateOnMount
                        duration={0.7}
                        spins={0}
                        blur={0}
                        locale={LOCALE}
                      />
                    </span>
                  </span>
                </>
              ) : (
                <span className="h-2 w-40 rounded bg-surface-4" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ProductSearchConsole = () => {
  const { ref, cycle } = useLoop(7000);
  return (
    <div ref={ref} className={WIDE}>
      <SearchConsoleBody key={cycle} />
    </div>
  );
};

/**
 * GA4: interactive, no loop. Pick a date range and a day; the totals and
 * drop-off count to the new values.
 */
const GA4_RANGES = [
  {
    label: "7d",
    days: [212, 248, 231, 274, 296, 288, 332],
    conv: 2.1,
    drop: 58,
  },
  {
    label: "28d",
    days: [812, 904, 877, 1011, 968, 1054, 1326],
    conv: 2.4,
    drop: 61,
  },
  {
    label: "90d",
    days: [2410, 2680, 2555, 2990, 2844, 3110, 3751],
    conv: 2.8,
    drop: 54,
  },
];
const DECIMAL = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

export const ProductGA4 = () => {
  const { ref, cycle } = useLoop(1600);
  // Until the visitor touches it, the tile walks through ranges and days on a loop.
  const [touched, setTouched] = useState(false);
  const [picked, setPicked] = useState<{ range: number; day: number | null }>({
    range: 1,
    day: null,
  });
  const range = touched ? picked.range : Math.floor(cycle / 7) % GA4_RANGES.length;
  const day = touched ? picked.day : cycle % 7;
  const r = GA4_RANGES[range];
  const total = r.days.reduce((a, b) => a + b, 0);
  const peak = Math.max(...r.days);

  return (
    <div ref={ref} className={PANEL}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={MUTED}>Sessions</p>
          <p className="flex items-baseline gap-1.5 text-base font-medium leading-5 tracking-[-0.4px] tabular-nums">
            <SpeedCounter
              value={total}
              duration={0.8}
              spins={0}
              blur={0}
              locale={LOCALE}
            />
            <span className="rounded-md border border-solid border-surface bg-background px-1.5 py-0.5 text-[0.6875rem] font-normal tracking-normal">
              <SpeedCounter
                value={r.conv}
                format={DECIMAL}
                duration={0.5}
                spins={0}
                blur={0}
                locale={LOCALE}
              />
              % conv.
            </span>
          </p>
        </div>
        <div role="group" aria-label="Date range" className="flex gap-1">
          {GA4_RANGES.map((g, i) => {
            const on = i === range;
            return (
              <button
                key={g.label}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setTouched(true);
                  setPicked({ range: i, day: null });
                }}
                className={cn(
                  "pointer-events-auto cursor-pointer rounded-md border border-solid px-1.5 py-0.5 text-[0.6875rem] transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                  on
                    ? "border-color-008 bg-background text-foreground"
                    : cn("border-surface hover:text-foreground", MUTED),
                )}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 flex h-12 items-end gap-1.5">
        {r.days.map((v, i) => {
          const on = day === i;
          return (
            <button
              key={`${range}-${i}`}
              type="button"
              aria-label={`Day ${i + 1}: ${v} sessions`}
              aria-pressed={on}
              onClick={() => {
                setTouched(true);
                setPicked({ range, day: on ? null : i });
              }}
              className={cn(
                "pointer-events-auto flex-1 cursor-pointer rounded-sm p-0 transition-[height,background-color] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                on ? "bg-primary" : "bg-surface-4 hover:bg-muted-foreground/40",
              )}
              style={{ height: `${(v / peak) * 100}%` }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-solid border-surface pt-1.5">
        <span className={cn("flex items-baseline gap-1", MUTED)}>
          {day === null ? (
            "Pick a day"
          ) : (
            <>
              Day {day + 1}:
              <span className="font-medium text-foreground tabular-nums">
                <SpeedCounter
                  value={r.days[day]}
                  duration={0.5}
                  spins={0}
                  blur={0}
                  locale={LOCALE}
                />
              </span>
            </>
          )}
        </span>
        <span className={MUTED}>
          Drop-off before pricing{" "}
          <span className="font-medium text-red-400 tabular-nums">
            <SpeedCounter
              value={r.drop}
              duration={0.5}
              spins={0}
              blur={0}
              locale={LOCALE}
            />
            %
          </span>
        </span>
      </div>
    </div>
  );
};

/** Header mockup shown above each product tile, keyed by product variant. */
export const ProductHeader = ({ variant }: { variant: string }) => {
  switch (variant) {
    case "traffic-overview":
      return <ProductCrawlFindings />;
    case "conversions":
      return <ProductRevenueImpact />;
    case "pin-notes-to-specific-days-on-your-traffic":
      return <ProductKnowledgeGraph />;
    case "connect-search-console-to-see-which-querie":
      return <ProductSearchConsole />;
    case "see-who-is-on-your-site-right-now-where-th":
      return <ProductGA4 />;
    case "flag-your-not-found-page-once-then-see-bro":
      return <ProductFixPrompts />;
    case "connect-cursor-claude-code-or-codex-to-pul":
      return <ProductGrowthBrief />;
    case "ai-answer-readiness":
      return <ProductAnswerReadiness />;
    case "citation-probe":
      return <ProductCitationProbe />;
    case "topic-map":
      return <ProductTopicMap />;
    case "ai-traffic":
      return <ProductAiTraffic />;
    default:
      return null;
  }
};
