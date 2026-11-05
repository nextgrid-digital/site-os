"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { HoverTip, InfoTip } from "@/components/audit/dashboard/info-tip";
import type { FunnelAssessment } from "@/lib/audit/funnel-assessment";
import { EASE_OUT } from "@/lib/ease";

const GOOD = "rgb(31 138 102)";
const OK = "oklch(0.8 0.14 80)";
const LOW = "oklch(0.68 0.17 25)";

/** Colour a step by the share of all visits still in the funnel: higher is greener, lower is redder. */
function stepColor(pct: number | null) {
  if (pct == null) return OK;
  return pct >= 50 ? GOOD : pct >= 20 ? OK : LOW;
}

function rate(part: number, whole: number) {
  return whole > 0 ? (part / whole) * 100 : null;
}

function fmtPct(n: number | null) {
  return n == null ? "—" : `${n < 10 ? n.toFixed(1) : Math.round(n)}%`;
}

/** Block height (0–100 of the cell) for a value, with a floor so tiny steps stay visible. */
function blockHeight(value: number, max: number) {
  return Math.max(6, (value / Math.max(max, 1)) * 84);
}

/** Flat block that eases into the next block's height, like a flow band. */
function bandPath(h0: number, h1: number) {
  const t0 = 50 - h0 / 2;
  const b0 = 50 + h0 / 2;
  const t1 = 50 - h1 / 2;
  const b1 = 50 + h1 / 2;
  return `M0,${t0} L40,${t0} C72,${t0} 68,${t1} 100,${t1} L100,${b1} C68,${b1} 72,${b0} 40,${b0} L0,${b0} Z`;
}

/**
 * Goal funnel (Visit → Engaged → Conversion) drawn as a flow: each block is sized by how many
 * visitors made it that far, and the % pill is the share of all visits still in the flow.
 */
export function DashboardFunnelViews({
  assessment,
}: {
  assessment: FunnelAssessment;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const { sessions, engaged, conversions } = assessment.goalTotals;

  const steps = [
    {
      label: "Visited",
      value: sessions,
      tip: "Every session (visit) recorded by GA4 in this audit window.",
    },
    {
      label: "Engaged",
      value: engaged,
      tip: "Sessions that lasted 10+ seconds, viewed 2+ pages or converted.",
    },
    {
      label: "Converted",
      value: conversions,
      tip: "Sessions where a key event fired (e.g. a lead form).",
    },
  ].map((s, i, all) => ({
    ...s,
    ofAll: rate(s.value, sessions),
    color: stepColor(rate(s.value, sessions)),
    ofPrev: i === 0 ? null : rate(s.value, all[i - 1].value),
  }));

  const overall = rate(conversions, sessions);
  const shown = active == null ? steps[0] : steps[active];
  const dim = (i: number) => (active != null && active !== i ? 0.3 : 1);
  const leakHint =
    assessment.bottlenecks[0]?.title ??
    (assessment.hasFunnelProblem ? assessment.verdict : null);
  const leaks = assessment.landings
    .filter((l) => l.leakLabel === "looks_like_a_leak")
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {leakHint ? (
        <p className="rounded-lg bg-warning-soft/70 px-3 py-2 text-sm text-warning-ink">
          {leakHint}
        </p>
      ) : null}

      <section className="rounded-xl bg-raised p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Visit → conversion
          </h3>
          <InfoTip
            what="A funnel counts how many people make it through each stage toward a goal. Here: visit the site, stay and engage, then convert."
            why="The block that shrinks the most is where you lose people. Low “engaged” = landing pages don’t hold attention. Low “converted” = the offer or form isn’t convincing."
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{shown.label}</p>
        <div className="flex items-baseline gap-3">
          <SpeedCounter
            value={shown.value}
            duration={0.9}
            className="text-3xl font-semibold tracking-tight text-foreground"
          />
          <span className="text-sm text-muted-foreground">
            {active == null ? (
              overall != null ? (
                <>
                  visits ·{" "}
                  <span className="font-medium text-foreground">
                    {fmtPct(overall)}
                  </span>{" "}
                  end in a conversion
                </>
              ) : (
                "visits in this window"
              )
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {fmtPct(shown.ofAll)}
                </span>{" "}
                of all visits
                {shown.ofPrev != null ? (
                  <> · {fmtPct(shown.ofPrev)} of previous step</>
                ) : null}
              </>
            )}
          </span>
        </div>

        <div
          className="mt-5 grid grid-cols-3 gap-1"
          role="img"
          aria-label={steps
            .map((s) => `${s.label}: ${s.value} (${fmtPct(s.ofAll)})`)
            .join(", ")}
        >
          {steps.map((s, i) => {
            const h0 = blockHeight(s.value, sessions);
            const h1 =
              i < steps.length - 1
                ? blockHeight(steps[i + 1].value, sessions)
                : h0;
            return (
              <motion.div
                key={s.label}
                className="relative h-44 origin-left cursor-pointer sm:h-56"
                initial={reduce ? false : { opacity: 0, scaleX: 0.85 }}
                whileInView={{ opacity: dim(i), scaleX: 1 }}
                animate={{ opacity: dim(i) }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.12 }}
                onHoverStart={() => setActive(i)}
                onHoverEnd={() => setActive(null)}
              >
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full"
                  aria-hidden
                >
                  <path
                    d={bandPath(h0 + 10, h1 + 10)}
                    fill={s.color}
                    opacity={0.22}
                  />
                  <path d={bandPath(h0, h1)} fill={s.color} />
                </svg>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-raised px-2.5 py-0.5 text-xs font-semibold tabular-nums text-foreground shadow-sm">
                  {fmtPct(s.ofAll)}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {steps.map((s, i) => (
            <div
              key={s.label}
              tabIndex={0}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="cursor-pointer rounded-lg bg-tint px-3 py-2.5 outline-none transition-[opacity,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                opacity: dim(i),
                background: active === i ? "var(--raised)" : undefined,
              }}
            >
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-2.5 shrink-0 rounded-[3px]"
                  style={{ background: s.color }}
                />
                {s.label}
                <InfoTip what={s.tip} label={`About ${s.label}`} />
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {s.value.toLocaleString()}
              </p>
              {s.ofPrev != null ? (
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  {fmtPct(s.ofPrev)} of previous step
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {leaks.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Landing pages with weak engagement:</span>
            {leaks.map((l) => (
              <HoverTip
                key={l.path}
                text={l.meaning}
                className="max-w-56 truncate rounded-md bg-warning-soft px-2 py-0.5 font-medium text-warning-ink"
              >
                {l.path} · {l.sessions.toLocaleString()} visits ·{" "}
                {fmtPct(rate(l.engagedSessions, l.sessions))} engaged
              </HoverTip>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
