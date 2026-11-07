"use client";

import { useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  CopyIcon,
  UndoIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FixIcon, MouseClickIcon } from "@/components/icons";
import { EASE_OUT } from "@/lib/ease";
import type { FixProof } from "@/lib/audit/fix-proof";
import type { JoinedChainBreak } from "@/lib/audit/joined-traffic-story";
import type { FixActionView } from "@/lib/db/fix-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCopyClipboard } from "@/hooks/use-copy-clipboard";
import { cn } from "@/lib/utils";
import { useHoldPosition } from "@/components/audit/report/joined/use-hold-position";
import { PageContextPanel } from "@/components/audit/report/joined/page-context-panel";
import {
  SIGNAL_BG,
  SIGNAL_BUTTON,
  SIGNAL_SOFT,
} from "@/components/audit/report/joined/signal";
import {
  fixKey,
  useFixActions,
} from "@/components/audit/report/joined/use-fix-tracking";

type FixGuide = { summary: string; steps: string[] };

const FIX_GUIDES: Record<string, FixGuide> = {
  "demand-without-clicks": {
    summary:
      "People see this page in Google but rarely click. The title and description are the pitch, so that is where the gain is.",
    steps: [
      "Rewrite the title so it states the benefit and includes the main query near the front.",
      "Rewrite the meta description as a clear promise with a reason to click (about 120–160 characters).",
      "Check the page really answers the query it ranks for; if intent differs, consider a dedicated page.",
      "Add structured data (FAQ, product, review) if it fits, to earn a richer result.",
    ],
  },
  "clicks-without-sessions": {
    summary:
      "Google says people clicked, but analytics recorded far fewer visits. Visitors are probably dropping off or not being tracked.",
    steps: [
      "Confirm the GA4 tag fires on this page (use GA4 Realtime or Tag Assistant).",
      "Check consent settings aren't blocking analytics for most visitors.",
      "Test load speed on mobile and look for redirects between the result and the page.",
      "Make sure the page URL in Search Console matches the one analytics records.",
    ],
  },
  "sessions-without-conversions": {
    summary:
      "The page gets visitors but none complete a goal. Either the next step is unclear or the goal isn't being measured.",
    steps: [
      "Make one primary call to action obvious above the fold.",
      "Confirm the conversion event actually fires (GA4 DebugView or Tag Assistant).",
      "Check the page matches what visitors expected when they clicked.",
      "Remove competing links or steps that pull attention from the main action.",
    ],
  },
  "conversions-without-search": {
    summary:
      "This page converts well but barely appears in search. Getting more of the right visitors to it is the cheapest win.",
    steps: [
      "Add the queries your converting visitors would use to the title, H1 and opening copy.",
      "Link to this page from your highest-traffic related pages.",
      "Build out supporting content that targets nearby questions.",
      "Check it is indexable and in your sitemap.",
    ],
  },
  "query-demand-without-clicks": {
    summary:
      "People search this phrase and see your page, but few click. The page needs to signal it answers exactly that question.",
    steps: [
      "Put the query, in natural wording, in the title and H1 of the ranking page.",
      "Answer it directly near the top of the page.",
      "Rewrite the meta description to echo the question and promise the answer.",
      "If the intent differs from the current page, create a dedicated page for it.",
    ],
  },
};

const DEFAULT_GUIDE: FixGuide = {
  summary:
    "Compare this issue against your other pages to decide what to change first.",
  steps: [
    "Review the numbers shown, make one change, then re-run the audit to see the effect.",
  ],
};

function buildFixPrompt(item: JoinedChainBreak) {
  const guide = FIX_GUIDES[item.id] ?? DEFAULT_GUIDE;
  const ctx = item.pageContext;
  return [
    `Fix this website issue: ${item.title}.`,
    "",
    `Data (${item.sources.join(" + ")}): ${item.statement}`,
    ctx?.title ? `Current title: ${ctx.title}` : null,
    ctx?.metaDescription
      ? `Current meta description: ${ctx.metaDescription}`
      : null,
    ctx?.h1 ? `Current H1: ${ctx.h1}` : null,
    ctx?.topQueries.length
      ? `Queries already driving impressions: ${ctx.topQueries.join("; ")}`
      : null,
    "",
    `Goal: ${guide.summary}`,
    "Steps:",
    ...guide.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Find the relevant page or files in this codebase, propose the specific changes, and implement them.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

const LABEL =
  "text-xs font-medium tracking-wider text-muted-foreground uppercase";

function ClicksProjection({
  target,
  projection,
}: {
  target: string;
  projection: NonNullable<JoinedChainBreak["projection"]>;
}) {
  const reduce = useReducedMotion();
  const max = Math.max(projection.clicksPotential, 1);
  const rows = [
    {
      label: `Now (${projection.impressions.toLocaleString()} × ${(projection.ctr * 100).toFixed(1)}%)`,
      value: projection.clicksNow,
      fill: "bg-foreground",
    },
    {
      label: "With a better listing",
      value: projection.clicksPotential,
      fill: SIGNAL_BG,
    },
  ];

  return (
    <div>
      <p className={LABEL}>Clicks per month on {target}</p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] items-center gap-3 text-sm"
          >
            <span className="truncate text-muted-foreground" title={row.label}>
              {row.label}
            </span>
            <span className="h-2 rounded-full bg-tint-strong" aria-hidden>
              <motion.span
                className={cn("block h-full rounded-full", row.fill)}
                initial={reduce ? false : { width: "0%" }}
                animate={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT }}
              />
            </span>
            <span className="text-right font-semibold text-foreground font-mono inline-flex gap-2 items-center">
              <MouseClickIcon className="size-4" />
              {Math.round(row.value).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PROOF_LABEL: Record<FixProof["state"], string> = {
  collecting: "Collecting data",
  improved: "Improved",
  flat: "No clear change",
  worse: "Got worse",
  inconclusive: "Too little data",
};

const PROOF_TONE: Record<
  FixProof["state"],
  "success" | "danger" | "neutral" | "info" | "muted"
> = {
  collecting: "info",
  improved: "success",
  flat: "neutral",
  worse: "danger",
  inconclusive: "muted",
};

function ProofPanel({ proof }: { proof: FixProof }) {
  return (
    <div className="rounded-xl bg-tint-strong p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={PROOF_TONE[proof.state]}>
          {PROOF_LABEL[proof.state]}
        </StatusBadge>
        <p className="text-foreground">{proof.summary}</p>
      </div>
      {proof.rows.length > 0 ? (
        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="pb-1.5 font-medium">Metric</th>
              <th className="pb-1.5 font-medium">Before fix</th>
              <th className="pb-1.5 font-medium">Latest audit</th>
            </tr>
          </thead>
          <tbody>
            {proof.rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="py-1.5 text-muted-foreground">{row.label}</td>
                <td className="py-1.5 text-foreground tabular-nums">
                  {row.before}
                </td>
                <td
                  className={cn(
                    "py-1.5 tabular-nums",
                    row.better === true && "font-medium text-success-ink",
                    row.better === false && "font-medium text-danger-ink",
                    row.better === null && "text-foreground",
                  )}
                >
                  {row.after}
                  {row.better === true ? (
                    <span className="sr-only"> (better)</span>
                  ) : null}
                  {row.better === false ? (
                    <span className="sr-only"> (worse)</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {proof.state !== "collecting" && proof.daysSinceFix < 28 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Each audit reads the last 28 days, so this window still includes some
          days before your change.
        </p>
      ) : null}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FixCard({
  item,
  done,
  open,
  pending,
  onToggle,
  onMarkDone,
  onReopen,
}: {
  item: JoinedChainBreak;
  done: FixActionView | null;
  open: boolean;
  pending: boolean;
  onToggle: () => void;
  onMarkDone: () => void;
  onReopen: () => void;
}) {
  const guide = FIX_GUIDES[item.id] ?? DEFAULT_GUIDE;
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const { copied, copy } = useCopyClipboard();
  const reduce = useReducedMotion();
  const { ref: cardRef, hold } = useHoldPosition<HTMLLIElement>();
  const bodyId = `fix-${fixKey(item.id, item.target).replace(/[^a-z0-9]/gi, "-")}`;
  const expanded = open || Boolean(done);

  function toggleStep(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <li
      ref={cardRef}
      className="[overflow-anchor:none] rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {item.sources.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="h-5 rounded-md px-2 text-xs font-semibold"
              >
                {s}
              </Badge>
            ))}
            {item.missedClicks && item.missedClicks > 0 ? (
              <StatusBadge className={SIGNAL_SOFT}>
                <MouseClickIcon className="size-2" />
                {item.missedClicks.toLocaleString()} clicks/mo at stake
              </StatusBadge>
            ) : null}
            {done ? (
              <StatusBadge tone="success">
                <CircleCheckIcon aria-hidden />
                Fixed {formatDate(done.doneAt)}
              </StatusBadge>
            ) : null}
          </div>
          <h3 className="mt-2 text-base font-medium text-foreground">
            {item.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {item.statement}
          </p>
        </div>

        {done ? (
          <Button
            variant="outline"
            onClick={onReopen}
            disabled={pending}
            className="shrink-0"
          >
            <UndoIcon />
            Reopen
          </Button>
        ) : (
          <Button
            variant={open ? "outline" : "default"}
            onClick={() => {
              // Collapsing shrinks the page; keep this card steady instead of letting the view jump.
              if (open) hold();
              onToggle();
            }}
            aria-expanded={open}
            aria-controls={bodyId}
            className={cn(
              "shrink-0",
              open
                ? "hover:bg-tint-strong aria-expanded:bg-transparent aria-expanded:hover:bg-tint-strong"
                : SIGNAL_BUTTON,
            )}
          >
            {open ? <ChevronDownIcon className="rotate-180" /> : <FixIcon />}
            {open ? "Close" : "Fix"}
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="body"
            id={bodyId}
            className="overflow-hidden"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT }}
          >
            <div className="mt-4 border-t border-border pt-4">
              {done ? (
                done.proof ? (
                  <ProofPanel proof={done.proof} />
                ) : (
                  <p className="rounded-xl bg-tint-strong p-4 text-sm text-foreground">
                    We saved today&apos;s numbers for this {item.targetKind}.
                    Re-run the audit in about two weeks and the before/after
                    will show up here.
                  </p>
                )
              ) : (
                <div
                  className={cn(
                    "grid gap-6",
                    item.pageContext &&
                      "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
                  )}
                >
                  <div className="space-y-5">
                    {item.projection ? (
                      <ClicksProjection
                        target={item.target}
                        projection={item.projection}
                      />
                    ) : (
                      <p className="text-sm text-foreground">{guide.summary}</p>
                    )}

                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={LABEL}>How to fix it</p>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {checked.size} of {guide.steps.length} done
                        </p>
                      </div>
                      <ul className="mt-2 divide-y divide-border">
                        {guide.steps.map((step, i) => (
                          <li key={step}>
                            <label className="flex cursor-pointer items-start gap-3 py-2.5 text-sm">
                              <input
                                type="checkbox"
                                checked={checked.has(i)}
                                onChange={() => toggleStep(i)}
                                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-foreground"
                              />
                              <span
                                className={
                                  checked.has(i)
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground"
                                }
                              >
                                {step}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button onClick={onMarkDone} disabled={pending}>
                        <CheckIcon />
                        {pending ? "Saving…" : "Mark as fixed"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => void copy(buildFixPrompt(item))}
                      >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        {copied ? "Copied" : "Copy fix prompt"}
                      </Button>
                      <span aria-live="polite" className="sr-only">
                        {copied ? "Fix prompt copied to clipboard" : ""}
                      </span>
                    </div>
                  </div>

                  {item.pageContext ? (
                    <PageContextPanel ctx={item.pageContext} />
                  ) : null}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function ProgressStrip({ actions }: { actions: FixActionView[] }) {
  if (actions.length === 0) return null;
  const improved = actions.filter((a) => a.proof?.state === "improved").length;
  const waiting = actions.filter(
    (a) => !a.proof || a.proof.state === "collecting",
  ).length;
  const parts = [`${actions.length} fixed`];
  if (waiting > 0) parts.push(`${waiting} waiting for the next audit`);
  if (improved > 0) parts.push(`${improved} improved`);
  return (
    <p className="rounded-lg bg-tint px-3 py-2 text-sm text-foreground/80">
      {parts.join(" · ")}
    </p>
  );
}

export function JoinedChainBreaks({
  projectId,
  breaks,
}: {
  projectId: string;
  breaks: JoinedChainBreak[];
}) {
  const { actions, pendingKey, error, markDone, reopen } =
    useFixActions(projectId);
  // Cards open independently so several fixes can be worked on side by side. The first
  // open issue starts expanded so the page never opens as a wall of closed cards.
  const [openKeys, setOpenKeys] = useState<Set<string> | null>(null);

  function toggleOpen(key: string, current: Set<string>) {
    const next = new Set(current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpenKeys(next);
  }

  const doneByKey = new Map(
    actions.map((a) => [fixKey(a.issueId, a.target), a]),
  );
  const currentKeys = new Set(breaks.map((b) => fixKey(b.id, b.target)));
  // A fixed issue usually disappears from the next audit, so its proof lives here.
  const resolved = actions.filter(
    (a) => !currentKeys.has(fixKey(a.issueId, a.target)),
  );

  const firstOpen = breaks.find((b) => !doneByKey.has(fixKey(b.id, b.target)));
  const expanded =
    openKeys ??
    new Set(firstOpen ? [fixKey(firstOpen.id, firstOpen.target)] : []);

  if (breaks.length === 0 && resolved.length === 0) {
    return (
      <div className="rounded-xl bg-card px-4 py-5 text-center ring-1 ring-foreground/10">
        <p className="text-sm text-muted-foreground">
          No clear chain breaks in this window.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProgressStrip actions={actions} />
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-ink"
        >
          {error}
        </p>
      ) : null}

      {breaks.length > 0 ? (
        <ul className="space-y-3">
          {breaks.map((item) => {
            const key = fixKey(item.id, item.target);
            return (
              <FixCard
                key={key}
                item={item}
                done={doneByKey.get(key) ?? null}
                open={expanded.has(key)}
                pending={pendingKey === key}
                onToggle={() => toggleOpen(key, expanded)}
                onMarkDone={() => void markDone(item)}
                onReopen={() => void reopen(item)}
              />
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl bg-card px-4 py-4 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No open chain breaks in this window.
        </p>
      )}

      {resolved.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">
            Fixed and tracked
          </h3>
          <ul className="space-y-3">
            {resolved.map((action) => (
              <li
                key={fixKey(action.issueId, action.target)}
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
              >
                <p className="text-base font-medium text-foreground">
                  {action.title}
                </p>
                <p className="mb-3 text-sm break-all text-muted-foreground">
                  {action.target} · fixed {formatDate(action.doneAt)}
                </p>
                {action.proof ? (
                  <ProofPanel proof={action.proof} />
                ) : (
                  <p className="rounded-xl bg-tint-strong p-4 text-sm text-foreground">
                    Starting numbers saved. Re-run the audit in about two weeks
                    to see the result.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Fix guidance is general advice based on the numbers shown. Before/after
        results compare two 28-day Google windows and are an indication, not
        proof of cause.
      </p>
    </div>
  );
}
