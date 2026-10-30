"use client";

import { useState } from "react";
import { CheckIcon, WrenchIcon } from "lucide-react";
import type { JoinedChainBreak } from "@/lib/audit/joined-traffic-story";
import { Badge } from "@/components/ui/badge";
import { useCopyClipboard } from "@/hooks/use-copy-clipboard";

const FIX_GUIDANCE: Record<string, string> = {
  "demand-without-clicks":
    "Rewrite the title tag and meta description to match search intent and promise a clear benefit. Check that the page ranks for the right queries, and add structured data for richer results.",
  "clicks-without-sessions":
    "Verify GA4 is installed on this page and consent settings aren't blocking it. Check for slow load, redirects or broken tracking that could drop visits after the click.",
  "sessions-without-conversions":
    "Make the primary call to action clearer, confirm the conversion event actually fires, and check that the page matches what visitors expected to find.",
  "conversions-without-search":
    "This page converts but isn't found in search. Improve its on-page SEO, add internal links to it, and target the queries your converting visitors use.",
  "query-demand-without-clicks":
    "Put this query in the title and H1 of the ranking page, answer it directly near the top, and consider a dedicated page if intent differs from the current one.",
};

const DEFAULT_GUIDANCE =
  "Review the numbers in this issue and compare them against your other pages to decide what to change first.";

function buildFixPrompt(item: JoinedChainBreak) {
  return [
    `Fix this website issue: ${item.title}.`,
    "",
    `Data (${item.sources.join(" + ")}): ${item.statement}`,
    "",
    `Guidance: ${FIX_GUIDANCE[item.id] ?? DEFAULT_GUIDANCE}`,
    "",
    "Find the relevant page or files in this codebase, propose the specific changes, and implement them.",
  ].join("\n");
}

export function JoinedChainBreaks({ breaks }: { breaks: JoinedChainBreak[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const { copied, copy } = useCopyClipboard();

  function handleFix(item: JoinedChainBreak) {
    setOpenId(item.id);
    void copy(buildFixPrompt(item));
  }

  if (breaks.length === 0) {
    return (
      <div className="rounded-xl bg-raised px-4 py-5 text-center">
        <p className="text-sm text-muted-foreground">
          No clear chain breaks in this window.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-raised px-5 py-4 shadow-sm ring-1 ring-border/60 sm:px-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs tracking-wider text-muted-foreground uppercase">
                <th className="w-28 pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Issue</th>
                <th className="pb-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {breaks.map((item) => {
                const open = openId === item.id;
                return (
                  <tr key={item.id} className="border-t border-border">
                    <td className="py-4 pr-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {item.sources.map((s) => (
                          <Badge
                            key={s}
                            className="rounded-md bg-foreground/80 px-2.5 py-1 text-xs font-semibold tracking-wide text-background"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <p className="font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        {item.statement}
                      </p>
                      {open ? (
                        <div className="mt-3 rounded-xl bg-muted px-3 py-2 text-muted-foreground">
                          <p>{FIX_GUIDANCE[item.id] ?? DEFAULT_GUIDANCE}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs">
                            <span aria-live="polite">
                              {copied ? "Prompt copied to clipboard" : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => setOpenId(null)}
                              className="font-medium text-foreground underline-offset-2 hover:underline"
                            >
                              Hide
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="py-4 text-right align-top">
                      <button
                        type="button"
                        onClick={() => handleFix(item)}
                        aria-expanded={open}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-raised"
                      >
                        {open && copied ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <WrenchIcon className="size-4" />
                        )}
                        {open && copied ? "Copied" : "Fix"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Fix guidance is general advice based on the numbers shown for each
        issue.
      </p>
    </div>
  );
}
