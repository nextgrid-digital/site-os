"use client";

import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  PencilIcon,
  PlusIcon,
  Undo2Icon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { JoinedBreakPageContext } from "@/lib/audit/joined-traffic-story";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCopyClipboard } from "@/hooks/use-copy-clipboard";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  SIGNAL_BG,
  SIGNAL_INK,
  SIGNAL_RANGE,
} from "@/components/audit/report/joined/signal";

const LABEL =
  "text-xs font-medium tracking-wider text-muted-foreground uppercase";

/** Where the character count falls against the recommended range, and a note saying so. */
function Gauge({
  length,
  min,
  max,
}: {
  length: number;
  min: number;
  max: number;
}) {
  const reduce = useReducedMotion();
  const scale = Math.max(max * 1.4, length * 1.1);
  const state =
    length === 0
      ? "missing"
      : length < min
        ? "short"
        : length > max
          ? "long"
          : "good";
  const note =
    state === "missing"
      ? "empty"
      : state === "short"
        ? `${length} chars · too short`
        : state === "long"
          ? `${length} chars · may be cut off`
          : `${length} chars · good length`;

  return (
    <div>
      <div
        className="relative mt-2 h-1.5 rounded-full bg-foreground/10"
        aria-hidden
      >
        <span
          className={cn("absolute inset-y-0 rounded-full", SIGNAL_RANGE)}
          style={{
            left: `${(min / scale) * 100}%`,
            width: `${((max - min) / scale) * 100}%`,
          }}
        />
        {length > 0 ? (
          <motion.span
            className={cn(
              "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-raised dark:ring-tint-strong",
              SIGNAL_BG,
            )}
            initial={reduce ? false : { left: "0%" }}
            animate={{ left: `${Math.min(100, (length / scale) * 100)}%` }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
          />
        ) : null}
      </div>
      <p className="mt-1.5 flex justify-between gap-2 text-xs">
        <span
          className={cn(
            "font-medium",
            state === "good" ? SIGNAL_INK : "text-foreground/80",
          )}
        >
          {note}
        </span>
        <span className="text-muted-foreground">
          aim for {min}–{max}
        </span>
      </p>
    </div>
  );
}

/** One page element (title or description): current text, a length gauge and a live draft editor. */
function DraftField({
  label,
  original,
  draft,
  onDraft,
  min,
  max,
  multiline,
}: {
  label: string;
  original: string | null;
  /** null = not editing. */
  draft: string | null;
  onDraft: (value: string | null) => void;
  min: number;
  max: number;
  multiline?: boolean;
}) {
  const { copied, copy } = useCopyClipboard();
  const reduce = useReducedMotion();
  const editing = draft !== null;
  const shown = editing ? draft : (original ?? "");
  const id = `draft-${label.toLowerCase()}`;
  const changed = editing && draft !== (original ?? "");

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={editing ? id : undefined}
          className="text-sm text-muted-foreground"
        >
          {label}
          {changed ? <span className="ml-1.5 text-xs">(draft)</span> : null}
        </label>
        {editing ? (
          <Button variant="ghost" size="xs" onClick={() => onDraft(null)}>
            <Undo2Icon />
            Reset
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onDraft(original ?? "")}
          >
            <PencilIcon />
            Try a rewrite
          </Button>
        )}
      </div>

      {editing ? (
        multiline ? (
          <Textarea
            id={id}
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            className="mt-1 min-h-20"
          />
        ) : (
          <Input
            id={id}
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            className="mt-1"
          />
        )
      ) : (
        <p
          className={cn(
            "mt-0.5 text-sm",
            original ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {original ?? "Not found"}
        </p>
      )}

      <Gauge length={shown.length} min={min} max={max} />

      <AnimatePresence initial={false}>
        {changed ? (
          <motion.div
            key="actions"
            className="overflow-hidden"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }}
          >
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-field"
                onClick={() => void copy(draft)}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied" : `Copy ${label.toLowerCase()}`}
              </Button>
              <span aria-live="polite" className="sr-only">
                {copied ? `${label} copied to clipboard` : ""}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** What the page currently says in search, with live drafting so a fix can start from real text. */
export function PageContextPanel({ ctx }: { ctx: JoinedBreakPageContext }) {
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [descDraft, setDescDraft] = useState<string | null>(null);

  const originalTitle = (ctx.title ?? "").toLowerCase();
  const missingQueries = ctx.topQueries.filter(
    (q) => !originalTitle.includes(q.toLowerCase()),
  );

  function addToTitle(query: string) {
    const current = titleDraft ?? ctx.title ?? "";
    if (current.toLowerCase().includes(query.toLowerCase())) return;
    setTitleDraft(current ? `${query} | ${current}` : query);
  }

  return (
    <div className="space-y-4 rounded-xl bg-raised ring-1 ring-foreground/10 dark:bg-tint-strong p-4">
      <p className={LABEL}>What the page says now</p>

      <DraftField
        label="Title"
        original={ctx.title}
        draft={titleDraft}
        onDraft={setTitleDraft}
        min={30}
        max={60}
      />
      <DraftField
        label="Description"
        original={ctx.metaDescription}
        draft={descDraft}
        onDraft={setDescDraft}
        min={120}
        max={160}
        multiline
      />

      <div>
        <p className="text-sm text-muted-foreground">H1</p>
        <p
          className={cn(
            "mt-0.5 text-sm",
            ctx.h1 ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {ctx.h1 ?? "Not found"}
        </p>
      </div>

      {missingQueries.length > 0 ? (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Searches this page shows for that the title doesn&apos;t mention.
            Tap one to add it to a title draft.
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {missingQueries.map((q) => {
              const added = (titleDraft ?? "")
                .toLowerCase()
                .includes(q.toLowerCase());
              return (
                <li key={q}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-field"
                    onClick={() => addToTitle(q)}
                    disabled={added}
                    aria-label={
                      added
                        ? `${q} added to title draft`
                        : `Add ${q} to title draft`
                    }
                  >
                    {added ? <CheckIcon /> : <PlusIcon />}
                    {q}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
