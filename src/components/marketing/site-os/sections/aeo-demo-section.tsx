"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AeoScoreGauge } from "@/components/audit/report/aeo/aeo-score-gauge";
import { bandFor, SCORE_BANDS } from "@/lib/aeo/score-bands";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  DEMO_GAPS,
  DEMO_PAGES,
  DEMO_PROBES,
  DEMO_SITE,
  DEMO_TOPICS,
  type DemoGap,
  type DemoTopic,
} from "../demo/aeo-demo-data";

const TABS = [
  { id: "readiness", label: "Readiness" },
  { id: "topics", label: "Topic map" },
  { id: "probe", label: "Citation probe" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const COVERAGE = {
  strong: { label: "Well covered", dot: "bg-success-ink" },
  developing: { label: "Developing", dot: "bg-warning-ink" },
  thin: { label: "Thin", dot: "bg-danger-ink" },
} as const;

const CARD = "rounded-[14px] border border-solid border-surface bg-surface-3";

function Readiness() {
  const reduced = useReducedMotion();
  const [band, setBand] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>("/pricing");

  const avg = Math.round(DEMO_PAGES.reduce((a, p) => a + p.score, 0) / DEMO_PAGES.length);
  const counts = SCORE_BANDS.map((b) => ({
    ...b,
    count: DEMO_PAGES.filter((p) => p.score >= b.min && p.score <= b.max).length,
  }));
  const max = Math.max(...counts.map((b) => b.count), 1);
  const active = counts.find((b) => b.id === band) ?? null;
  const pages = DEMO_PAGES.filter((p) => !active || (p.score >= active.min && p.score <= active.max)).toSorted(
    (a, b) => a.score - b.score,
  );

  return (
    <div className="grid gap-6 lg:h-full lg:grid-cols-[16rem_1fr] lg:grid-rows-[minmax(0,1fr)]">
      <div className="flex w-full flex-col items-center gap-6 lg:w-64">
        <AeoScoreGauge score={avg} label="AI readiness" />
        <div className="w-full">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Pages by score. Click a bar to filter.
          </p>
          <div className="flex gap-2" role="group" aria-label="Pages by readiness score">
            {counts.map((b) => {
              const selected = band === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${b.label}: ${b.count} pages`}
                  onClick={() => setBand(selected ? null : b.id)}
                  className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* The tallest bar fills this whole plot, so every bar shares one baseline. */}
                  <span className="flex h-28 w-full items-end">
                    <motion.span
                      className={cn(
                        "block w-full rounded-t-md",
                        b.bar,
                        band && !selected ? "opacity-30" : "opacity-100",
                      )}
                      initial={{ height: reduced ? `${(b.count / max) * 100}%` : 0 }}
                      whileInView={{ height: `${(b.count / max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: reduced ? 0 : 0.6, ease: EASE_OUT }}
                    />
                  </span>
                  <span className="text-center font-mono text-xs font-semibold tabular-nums">{b.count}</span>
                  <span className="whitespace-nowrap text-center font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                    {b.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="space-y-2 lg:h-full lg:overflow-y-auto lg:p-1">
        {pages.map((p) => {
          const isOpen = open === p.path;
          const failed = p.checks.filter((c) => !c.passed);
          return (
            <li key={p.path} className={cn(CARD, "overflow-hidden")}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.path)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={cn("w-8 font-mono text-sm font-semibold tabular-nums", bandFor(p.score).text)}>
                  {p.score}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{p.path}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {failed.length === 0 ? "All checks pass" : `${failed.length} to fix`}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.28, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1.5 px-3 pb-3 text-xs leading-5">
                      {p.checks.map((c) => (
                        <li key={c.label} className="flex gap-2">
                          <span
                            aria-hidden
                            className={cn("mt-0.5 font-semibold", c.passed ? "text-success-ink" : "text-danger-ink")}
                          >
                            {c.passed ? "✓" : "×"}
                          </span>
                          <span>
                            <span className="font-medium">{c.label}</span>
                            {c.passed ? null : (
                              <span className="block text-muted-foreground">{c.fix}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type Selection = { kind: "topic"; topic: DemoTopic } | { kind: "gap"; gap: DemoGap } | null;

function TopicMap() {
  const reduced = useReducedMotion();
  const [sel, setSel] = useState<Selection>({ kind: "topic", topic: DEMO_TOPICS[3] });
  const isTopic = (t: DemoTopic) => sel?.kind === "topic" && sel.topic.id === t.id;
  const isGap = (g: DemoGap) => sel?.kind === "gap" && sel.gap.id === g.id;

  return (
    <div className="grid gap-4 lg:h-full lg:grid-cols-[1.4fr_1fr] lg:grid-rows-[minmax(0,1fr)]">
      <div className="lg:h-full lg:overflow-y-auto lg:p-1">
        <ul className="grid grid-cols-2 gap-2">
          {DEMO_TOPICS.map((t) => {
            const size = t.paths.length >= 3 ? "col-span-2" : "";
            return (
              <li key={t.id} className={size}>
                <motion.button
                  type="button"
                  aria-pressed={isTopic(t)}
                  onClick={() => setSel({ kind: "topic", topic: t })}
                  whileHover={reduced ? undefined : { y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  transition={SPRING_PRESS}
                  className={cn(
                    CARD,
                    "flex h-full w-full flex-col justify-between gap-3 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isTopic(t) && "border-foreground",
                  )}
                >
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 whitespace-nowrap text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden className={cn("size-2 rounded-full", COVERAGE[t.coverage].dot)} />
                      {COVERAGE[t.coverage].label}
                    </span>
                    <span className="shrink-0">
                      <span className="font-mono tabular-nums">{t.paths.length}</span>{" "}
                      {t.paths.length === 1 ? "page" : "pages"}
                    </span>
                  </span>
                </motion.button>
              </li>
            );
          })}
          {DEMO_GAPS.map((g) => (
            <li key={g.id}>
              <motion.button
                type="button"
                aria-pressed={isGap(g)}
                onClick={() => setSel({ kind: "gap", gap: g })}
                whileHover={reduced ? undefined : { y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                transition={SPRING_PRESS}
                className={cn(
                  "flex h-full w-full flex-col justify-between gap-3 rounded-[14px] border border-dashed border-muted-foreground/50 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isGap(g) && "border-foreground",
                )}
              >
                <span className="text-sm font-medium">{g.topic}</span>
                <span className="text-xs text-muted-foreground">Missing: no page covers this</span>
              </motion.button>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn(CARD, "min-h-48 overflow-y-auto p-4 lg:h-full")} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {sel?.kind === "topic" ? (
            <motion.div
              key={sel.topic.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2, ease: EASE_OUT }}
            >
              <p className="text-sm font-semibold">{sel.topic.name}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{sel.topic.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                AI readiness{" "}
                <span className={cn("font-mono font-semibold tabular-nums", bandFor(sel.topic.avgScore).text)}>
                  {sel.topic.avgScore}
                </span>
              </p>
              <ul className="mt-2 space-y-1">
                {sel.topic.paths.map((path) => (
                  <li key={path} className="truncate font-mono text-xs">
                    {path}
                  </li>
                ))}
              </ul>
              {sel.topic.coverage === "thin" ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Only one page covers this. AI answers rarely cite a topic with a single thin page.
                </p>
              ) : null}
            </motion.div>
          ) : sel?.kind === "gap" ? (
            <motion.div
              key={sel.gap.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2, ease: EASE_OUT }}
            >
              <p className="text-sm font-semibold">{sel.gap.topic}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{sel.gap.why}</p>
              <p className="mt-3 text-xs font-medium">Write this page</p>
              <p className="mt-1 text-sm">{sel.gap.suggestedPage}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

type RunState = { status: "idle" | "running" | "done"; shown: number };

function Probe() {
  const reduced = useReducedMotion();
  const [run, setRun] = useState<RunState>({ status: "idle", shown: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function start() {
    if (timer.current) clearInterval(timer.current);
    if (reduced) {
      setRun({ status: "done", shown: DEMO_PROBES.length });
      return;
    }
    setRun({ status: "running", shown: 0 });
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setRun({ status: n >= DEMO_PROBES.length ? "done" : "running", shown: n });
      if (n >= DEMO_PROBES.length && timer.current) clearInterval(timer.current);
    }, 650);
  }

  const cited = DEMO_PROBES.slice(0, run.shown).filter((p) => p.cited).length;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Sample questions a buyer might ask an AI search engine.
        </p>
        <button
          type="button"
          onClick={start}
          disabled={run.status === "running"}
          className="rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {run.status === "running" ? "Asking…" : run.status === "done" ? "Run again" : "Run sample probe"}
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {DEMO_PROBES.map((p, i) => {
          const revealed = i < run.shown;
          return (
            <li key={p.id} className={cn(CARD, "flex items-start gap-3 px-3 py-2.5")}>
              <motion.span
                aria-hidden
                animate={{ scale: revealed ? 1 : 0.8, opacity: revealed ? 1 : 0.35 }}
                transition={SPRING_LAYOUT}
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold",
                  revealed && p.cited ? "bg-success-ink text-background" : "bg-tint text-muted-foreground",
                )}
              >
                {revealed ? (p.cited ? "✓" : "×") : "?"}
              </motion.span>
              <div className="min-w-0 text-sm leading-6">
                <p className="font-medium">{p.question}</p>
                <p className="text-xs text-muted-foreground">
                  {!revealed
                    ? "Not asked yet"
                    : p.cited
                      ? `${DEMO_SITE} was cited as a source.`
                      : `Not cited. Cited instead: ${p.citedInstead.join(", ")}`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      {run.shown > 0 ? (
        <p className="mt-4 text-sm">
          <span className="font-mono text-2xl font-semibold tabular-nums">
            {Math.round((cited / run.shown) * 100)}%
          </span>{" "}
          cited in <span className="font-mono tabular-nums">{cited}</span> of{" "}
          <span className="font-mono tabular-nums">{run.shown}</span> answers
        </p>
      ) : null}
    </div>
  );
}

/** Interactive sample of the AEO tools, on fictional data. */
export default function AeoDemoSection() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<TabId>("readiness");

  return (
    <section className="block pt-8" id="aeo" aria-labelledby="aeo-heading">
      <div className="block max-w-280 mx-auto py-20 px-8">
        <div className="block mx-auto text-center max-w-2xl text-balance">
          <h2
            id="aeo-heading"
            className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15"
          >
            See how AI answers read your site.
          </h2>
          <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7">
            Score every page for AI answers, map the topics you cover and the ones you miss, and test
            whether AI search cites you. Try it on a sample site.
          </p>
        </div>

        <div className={cn(CARD, "mx-auto mt-12 max-w-4xl p-4 sm:p-6")}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="AEO demo" className="flex gap-1 rounded-full bg-tint p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className="relative rounded-full px-3.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {tab === t.id ? (
                    <motion.span
                      layoutId="aeo-demo-pill"
                      transition={reduced ? { duration: 0 } : SPRING_LAYOUT}
                      className="absolute inset-0 rounded-full bg-foreground"
                    />
                  ) : null}
                  <span className={cn("relative", tab === t.id ? "text-background" : "text-muted-foreground")}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Sample data for <span className="font-mono">{DEMO_SITE}</span>, a fictional site
            </span>
          </div>

          <div role="tabpanel" className="h-[30rem] overflow-hidden max-lg:overflow-y-auto max-lg:p-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.22, ease: EASE_OUT }}
              >
                {tab === "readiness" ? <Readiness /> : tab === "topics" ? <TopicMap /> : <Probe />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="#audit"
            className="inline-flex rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Run a free audit on your site
          </a>
        </div>
      </div>
    </section>
  );
}
