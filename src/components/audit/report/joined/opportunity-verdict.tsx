"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SIGNAL_BG,
  SIGNAL_BORDER,
  SIGNAL_TEXT,
} from "@/components/audit/report/joined/signal";
import { useHoldPosition } from "@/components/audit/report/joined/use-hold-position";
import { useCopyClipboard } from "@/hooks/use-copy-clipboard";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  type OpportunityItem,
  type OpportunityVerdict as Verdict,
} from "@/lib/audit/opportunity";
import { MouseClickIcon } from "@/components/icons";
import { SpeedCounter } from "@/components/motion/speed-counter";

const PREVIEW_ROWS = 3;
/** Share-bar fills, strongest first. Neutral on purpose: the emerald signal is reserved for the gap markers. */
const SEGMENT_FILLS = ["bg-foreground", "bg-foreground/55", "bg-foreground/30"];

const FOCUS_RING =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function pct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

function pageUrl(domain: string | undefined, path: string) {
  if (!domain) return null;
  const origin = /^https?:\/\//.test(domain) ? domain : `https://${domain}`;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Shared x-axis for every row: 0 to the largest typical CTR, rounded up to a 2% step. */
function axisFor(items: OpportunityItem[]) {
  const maxPct =
    Math.max(...items.flatMap((i) => [i.ctr, i.benchmarkCtr])) * 100;
  const max = Math.max(4, Math.ceil(maxPct / 2) * 2);
  const ticks: number[] = [];
  for (let t = 0; t <= max; t += 2) ticks.push(t);
  return { max, ticks };
}

/** Count-up number that races each digit to its value on first paint. */
function Count({ value, className }: { value: number; className?: string }) {
  return (
    <SpeedCounter
      value={Math.round(value)}
      animateOnMount
      duration={1.2}
      className={className}
    />
  );
}

function MoneyCount({
  amount,
  currency,
}: {
  amount: number;
  currency: string | null;
}) {
  const format: Intl.NumberFormatOptions = currency
    ? {
        style: "currency",
        currency,
        maximumFractionDigits: amount >= 100 ? 0 : 1,
      }
    : { maximumFractionDigits: 1 };
  return (
    <SpeedCounter
      value={amount}
      animateOnMount
      duration={1.2}
      format={format}
    />
  );
}

function Stat({
  value,
  unit,
  label,
}: {
  value: ReactNode;
  unit?: string;
  label: string;
}) {
  return (
    <div className="px-0 py-3 sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0">
      <p className="inline-flex items-center gap-1.5 text-2xl leading-none font-semibold font-mono text-foreground">
        {value}
        {unit ? (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ShareBar({
  items,
  total,
  active,
  onActive,
  onSelect,
}: {
  items: OpportunityItem[];
  total: number;
  active: string | null;
  onActive: (target: string | null) => void;
  onSelect: (target: string) => void;
}) {
  if (items.length < 2 || total <= 0) return null;
  const top = items.slice(0, 3);
  const lead = top[0]!;
  const leadShare = Math.round((lead.missedClicks / total) * 100);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-medium text-foreground">
          Where the missed clicks come from
        </h3>
        {leadShare >= 50 ? (
          <p className="text-sm text-muted-foreground">
            {lead.target === "/" ? "The homepage" : lead.target} is {leadShare}%
            of the gap
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex h-3 gap-0.5 overflow-hidden rounded-full bg-tint-strong">
        {top.map((item, i) => {
          const share = Math.round((item.missedClicks / total) * 100);
          return (
            <button
              key={item.target}
              type="button"
              title={`${item.target}: ${share}% of the gap`}
              aria-label={`${item.target}: ${share}% of the missed clicks. Show details.`}
              style={{ width: `${(item.missedClicks / total) * 100}%` }}
              onMouseEnter={() => onActive(item.target)}
              onMouseLeave={() => onActive(null)}
              onFocus={() => onActive(item.target)}
              onBlur={() => onActive(null)}
              onClick={() => onSelect(item.target)}
              className={cn(
                "h-full min-w-1 cursor-pointer transition-opacity",
                FOCUS_RING,
                SEGMENT_FILLS[i],
                active && active !== item.target && "opacity-40",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function CtrRow({
  item,
  max,
  ticks,
  domain,
  open,
  dimmed,
  onToggle,
  onActive,
}: {
  item: OpportunityItem;
  max: number;
  ticks: number[];
  domain?: string;
  open: boolean;
  dimmed: boolean;
  onToggle: () => void;
  onActive: (target: string | null) => void;
}) {
  const { copied, copy } = useCopyClipboard();
  const reduce = useReducedMotion();
  const { ref: rowRef, hold } = useHoldPosition<HTMLLIElement>();
  const pos = (rate: number) => Math.min(100, (rate * 100 * 100) / max);
  const yoursN = pos(item.ctr);
  const typicalN = pos(item.benchmarkCtr);
  const yours = `${yoursN}%`;
  const typical = `${typicalN}%`;
  // When the two values sit close together their labels would collide, so they split left and right.
  const close = typicalN - yoursN < 16;
  const url = pageUrl(domain, item.target);
  const panelId = `opportunity-${item.target.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <li
      ref={rowRef}
      className={cn(
        "[overflow-anchor:none] transition-opacity",
        dimmed && "opacity-50",
      )}
      onMouseEnter={() => onActive(item.target)}
      onMouseLeave={() => onActive(null)}
    >
      <button
        type="button"
        onClick={() => {
          if (open) hold();
          onToggle();
        }}
        aria-expanded={open}
        aria-controls={panelId}
        onFocus={() => onActive(item.target)}
        onBlur={() => onActive(null)}
        className={cn(
          "grid w-full cursor-pointer items-center gap-x-6 gap-y-2 rounded-lg px-2 py-3 text-left transition-colors hover:bg-tint-strong md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_6.5rem]",
          FOCUS_RING,
          open && "bg-tint-strong",
        )}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">
            {item.target}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Position {item.position.toFixed(1)} ·{" "}
            {item.impressions.toLocaleString()} impressions
          </span>
        </span>

        <span className="relative block h-9" aria-hidden>
          {ticks.map((t) => (
            <span
              key={t}
              style={{ left: `${(t * 100) / max}%` }}
              className="absolute inset-y-0 w-px bg-border"
            />
          ))}
          <span
            style={{ left: yours, width: `calc(${typical} - ${yours})` }}
            className={cn("absolute top-2 h-0.5 -translate-y-1/2", SIGNAL_BG)}
          />
          <span
            style={{ left: yours }}
            className="absolute top-2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
          />
          <span
            style={{ left: typical }}
            className={cn(
              "absolute top-2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card",
              SIGNAL_BORDER,
            )}
          />
          <span
            style={{ left: yours }}
            className={cn(
              "absolute top-5 z-10 rounded bg-card px-1 text-xs font-medium text-foreground tabular-nums",
              close && yoursN >= 12 ? "-translate-x-full" : "-translate-x-1/2",
            )}
          >
            {pct(item.ctr)}
          </span>
          <span
            style={{ left: typical }}
            className={cn(
              "absolute top-5 z-10 rounded bg-card px-1 text-xs text-muted-foreground tabular-nums",
              close ? "translate-x-0" : "-translate-x-1/2",
            )}
          >
            {pct(item.benchmarkCtr)}
          </span>
        </span>

        <span className="text-left md:text-right">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            <MouseClickIcon aria-hidden />
            <Count value={item.missedClicks} />
          </span>
          <span className="ml-1 text-xs text-muted-foreground md:ml-0 md:block">
            clicks/mo missed
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            className="overflow-hidden"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT }}
          >
            <div
              id={panelId}
              className="mx-2 mt-1 mb-2 rounded-lg bg-raised ring-1 ring-foreground/10 dark:bg-tint-strong px-3 py-3 text-sm"
            >
              <p className="text-foreground">
                At position {item.position.toFixed(1)}, pages typically earn
                about {pct(item.benchmarkCtr)} click-through. This one earns{" "}
                {pct(item.ctr)}, roughly {item.missedClicks.toLocaleString()}{" "}
                clicks a month short.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-field"
                    render={
                      <a href={url} target="_blank" rel="noopener noreferrer" />
                    }
                  >
                    <ExternalLinkIcon />
                    Open page
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-field"
                  onClick={() => void copy(item.target)}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Copied" : "Copy path"}
                </Button>
                <span aria-live="polite" className="sr-only">
                  {copied ? "Path copied to clipboard" : ""}
                </span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function CtrChart({
  items,
  domain,
  active,
  onActive,
  open,
  onOpen,
  showAll,
  onShowAll,
}: {
  items: OpportunityItem[];
  domain?: string;
  active: string | null;
  onActive: (target: string | null) => void;
  open: string | null;
  onOpen: (target: string | null) => void;
  showAll: boolean;
  onShowAll: (value: boolean) => void;
}) {
  const { max, ticks } = axisFor(items);
  const shown = showAll ? items : items.slice(0, PREVIEW_ROWS);
  const hidden = items.length - PREVIEW_ROWS;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border pb-3">
        <h3 className="text-base font-medium text-foreground">
          Click-through rate vs. typical for the position
        </h3>
        <ul
          className="flex items-center gap-4 text-xs text-muted-foreground"
          aria-hidden
        >
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground" />
            Your CTR
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className={cn("size-2.5 rounded-full border-2", SIGNAL_BORDER)}
            />
            Typical
          </li>
          <li className="flex items-center gap-1.5">
            <span className={cn("h-0.5 w-3", SIGNAL_BG)} />
            Gap
          </li>
        </ul>
      </div>

      <div
        className="hidden gap-x-6 px-2 pt-3 text-xs text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_6.5rem]"
        aria-hidden
      >
        <span />
        <span className="relative block h-4">
          {ticks.map((t) => (
            <span
              key={t}
              style={{ left: `${(t * 100) / max}%` }}
              className="absolute -translate-x-1/2 tabular-nums"
            >
              {t}%
            </span>
          ))}
        </span>
        <span />
      </div>

      <ul className="mt-1">
        {shown.map((item) => (
          <CtrRow
            key={item.target}
            item={item}
            max={max}
            ticks={ticks}
            domain={domain}
            open={open === item.target}
            dimmed={active !== null && active !== item.target}
            onToggle={() => onOpen(open === item.target ? null : item.target)}
            onActive={onActive}
          />
        ))}
      </ul>

      {hidden > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 hover:bg-tint-strong"
          onClick={() => onShowAll(!showAll)}
        >
          {showAll
            ? "Show fewer pages"
            : `Show ${hidden} more ${hidden === 1 ? "page" : "pages"}`}
        </Button>
      ) : null}
    </div>
  );
}

function ValueNote({
  verdict,
  saving,
  error,
  onSave,
}: {
  verdict: Verdict;
  saving: boolean;
  error: string | null;
  onSave: (value: number | null, currency: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(verdict.currency ?? "USD");
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!amount.trim() || !Number.isFinite(value) || value < 0) {
      setFormError("Enter the amount as a number, e.g. 50.");
      return;
    }
    setFormError(null);
    if (await onSave(value, currency.trim().toUpperCase() || "USD")) {
      setEditing(false);
    }
  }

  let question = "Want this in money?";
  let action = "Add what a conversion is worth";
  if (verdict.valueBasis === "custom" && verdict.valuePerConversion !== null) {
    question = `Using ${formatMoney(verdict.valuePerConversion, verdict.currency)} per conversion, the value you set.`;
    action = "Change";
  } else if (verdict.valueBasis === "ga4_revenue") {
    question = "Using the revenue per conversion recorded in GA4.";
    action = "Set your own value";
  }

  return (
    <div className="max-w-xl text-sm text-muted-foreground">
      <p>
        Estimate from typical click-through rates for each page’s Google
        position, counting only 70% of the gap.
        {verdict.canSetValue && !editing ? (
          <>
            {" "}
            {question}{" "}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={cn(
                "cursor-pointer rounded-sm font-medium text-foreground underline underline-offset-4",
                FOCUS_RING,
              )}
            >
              {action}
            </button>
          </>
        ) : null}
      </p>

      {editing ? (
        <form
          onSubmit={submit}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <label htmlFor="conversion-value">One conversion is worth</label>
          <Input
            id="conversion-value"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50"
            className="w-24"
            autoFocus
          />
          <Input
            aria-label="Currency code"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            maxLength={3}
            className="w-16 uppercase"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
          {formError || error ? (
            <p role="alert" className="w-full text-danger-ink">
              {formError ?? error}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

/** One-line answer to "what is this costing me?", sized from Search Console + GA4. */
export function OpportunityVerdict({
  verdict,
  domain,
  saving,
  error,
  onSaveValue,
}: {
  verdict: Verdict;
  domain?: string;
  saving: boolean;
  error: string | null;
  onSaveValue: (value: number | null, currency: string) => Promise<boolean>;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (!verdict.hasEstimate) return null;

  const { before, highlight, after } = verdict.headlineParts;
  const conversions = verdict.missedConversions;

  return (
    <div className="rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10 sm:p-6">
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Biggest opportunity
      </p>
      <h2 className="mt-2 max-w-3xl font-display text-2xl leading-tight text-balance text-foreground sm:text-3xl">
        {before}
        <span className={SIGNAL_TEXT}>{highlight}</span>
        {after}
      </h2>

      <div className="mt-6 grid divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-4">
        <Stat
          value={
            <>
              <MouseClickIcon aria-hidden />
              <Count value={verdict.missedClicks} />
            </>
          }
          label="extra clicks a month if the gap closed"
        />
        {verdict.monthlyValue !== null ? (
          <Stat
            value={
              <>
                ~
                <MoneyCount
                  amount={verdict.monthlyValue}
                  currency={verdict.currency}
                />
              </>
            }
            unit="/ mo"
            label="estimated value at your conversion value"
          />
        ) : conversions !== null && conversions >= 1 ? (
          <Stat
            value={
              <>
                <MouseClickIcon aria-hidden />
                <Count value={conversions} />
              </>
            }
            unit="/ mo"
            label="conversions at your current rate"
          />
        ) : (
          <Stat
            value="—"
            label="conversions can’t be estimated without GA4 data"
          />
        )}
        <Stat
          value={<Count value={verdict.pageCount} />}
          label="pages ranking without the clicks"
        />
      </div>

      <ShareBar
        items={verdict.items}
        total={verdict.missedClicks}
        active={active}
        onActive={setActive}
        onSelect={(target) => setOpen(open === target ? null : target)}
      />
      <CtrChart
        items={verdict.items}
        domain={domain}
        active={active}
        onActive={setActive}
        open={open}
        onOpen={setOpen}
        showAll={showAll}
        onShowAll={setShowAll}
      />

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ValueNote
          verdict={verdict}
          saving={saving}
          error={error}
          onSave={onSaveValue}
        />
        <Button
          render={<a href="#issues" />}
          className="shrink-0 self-start sm:self-auto"
        >
          See how to fix it
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
