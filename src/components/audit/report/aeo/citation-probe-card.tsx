"use client";

import { AlertTriangle, Check, Minus, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProbeResult, ProbeSummary } from "@/lib/aeo/citation-probe";
import {
  CITATION_PROBE_ENABLED,
  MAX_PROBE_PROMPTS,
} from "@/lib/aeo/citation-probe";
import type { AeoAnalysis } from "@/lib/aeo/schema";
import type { CitationProbeRun } from "@/lib/db/aeo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GENERIC_ERROR =
  "Something went wrong on our side. Please try again in a little while.";

interface ProbeResponse {
  run: CitationProbeRun | null;
  summary: ProbeSummary | null;
  rejected?: Array<{ prompt: string; reason: string }>;
  error?: string;
  /** Set when the whole run failed at the AI provider, so nothing was tested. */
  code?: "quota" | "provider";
}

interface Failure {
  status: number;
  message: string;
  code: ProbeResponse["code"] | null;
  /** The questions that were sent; shown as "Not run" when nothing was tested. */
  prompts: string[];
}

function suggestPrompts(
  analysis: AeoAnalysis | null,
  domain: string,
): string[] {
  const offer = analysis?.inferred_primary_offer?.trim();
  const icp = analysis?.inferred_icps?.[0]?.trim();
  if (!offer) return [`What is ${domain}?`, `Is ${domain} any good?`];
  return [
    `Best ${offer}`,
    icp ? `${offer} for ${icp}` : `How to choose ${offer}`,
    `Top ${offer} providers compared`,
  ].slice(0, MAX_PROBE_PROMPTS);
}

const promptLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function StatusIcon({
  status,
}: {
  status: "cited" | "mentioned" | "missing" | "error" | "notrun";
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        status === "cited"
          ? "bg-success-ink text-white"
          : "bg-tint text-muted-foreground",
      )}
      aria-hidden
    >
      {status === "cited" ? (
        <Check className="size-4" />
      ) : status === "missing" ? (
        <X className="size-4" />
      ) : (
        <Minus className="size-4" />
      )}
    </span>
  );
}

function ResultRow({ result }: { result: ProbeResult }) {
  const status = result.error
    ? "error"
    : result.cited
      ? "cited"
      : result.mentioned
        ? "mentioned"
        : "missing";
  const label =
    status === "cited"
      ? "Cited"
      : status === "mentioned"
        ? "Named, not cited"
        : status === "missing"
          ? "Not cited"
          : "Not run";
  const detail =
    status === "cited"
      ? "Your site was cited as a source."
      : status === "mentioned"
        ? "Named in the answer, but not cited as a source."
        : status === "missing"
          ? result.sources.length > 0
            ? `Sources used: ${result.sources
                .slice(0, 4)
                .map((s) => s.domain)
                .join(", ")}`
            : "The answer used no web sources."
          : "Couldn't run this question. Try again in a little while.";
  return (
    <li className="flex items-center gap-4 py-4">
      <StatusIcon status={status} />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-foreground">
          {result.prompt}
        </p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    </li>
  );
}

function NotRunRow({ prompt, reason }: { prompt: string; reason: string }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <StatusIcon status="notrun" />
      <p className="min-w-0 flex-1 text-base font-semibold text-foreground">
        {prompt}
      </p>
      <span className="shrink-0 text-sm text-muted-foreground">
        Not run · {reason}
      </span>
    </li>
  );
}

/** Server messages for 400/429 are about the customer's input or limits, so they are safe to show. */
function failureMessage(failure: Failure): string {
  const userFixable = failure.status === 400 || failure.status === 429;
  return userFixable && failure.message ? failure.message : GENERIC_ERROR;
}

function FailurePanel({ failure }: { failure: Failure }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-4 rounded-2xl border border-danger-ink/30 bg-danger-soft px-5 py-4 text-danger-ink"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-base font-semibold">The probe didn&apos;t run</p>
        <p className="text-sm text-foreground/80">{failureMessage(failure)}</p>
      </div>
    </div>
  );
}

export function CitationProbeCard({
  projectId,
  domain,
  analysis,
}: {
  projectId: string;
  domain: string;
  analysis: AeoAnalysis | null;
}) {
  const [text, setText] = useState(() =>
    suggestPrompts(analysis, domain).join("\n"),
  );
  const [data, setData] = useState<ProbeResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [rejected, setRejected] = useState<
    Array<{ prompt: string; reason: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}/citation-probe`)
      .then((res) => (res.ok ? (res.json() as Promise<ProbeResponse>) : null))
      .then((json) => {
        if (!cancelled && json?.run) {
          setData(json);
          setText(json.run.results.map((r) => r.prompt).join("\n"));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function run() {
    const prompts = promptLines(text).slice(0, MAX_PROBE_PROMPTS);
    setRunning(true);
    setFailure(null);
    setRejected([]);
    try {
      const res = await fetch(`/api/projects/${projectId}/citation-probe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: text.split("\n") }),
      });
      const json = (await res.json()) as ProbeResponse;
      setRejected(json.rejected ?? []);
      if (!res.ok) {
        setFailure({
          status: res.status,
          message: json.error ?? "Probe failed.",
          code: json.code ?? null,
          prompts,
        });
        return;
      }
      setData(json);
    } catch (e) {
      setFailure({
        status: 0,
        message: e instanceof Error ? e.message : "Probe failed.",
        code: null,
        prompts,
      });
    } finally {
      setRunning(false);
    }
  }

  const count = promptLines(text).length;
  const summary = data?.summary;
  // When the provider failed outright nothing was tested, so show the questions as "Not run".
  const nothingTested =
    failure?.code === "quota" || failure?.code === "provider";
  const showResults = !nothingTested && data?.run && summary;

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-raised p-9 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold leading-[26px] text-foreground">
          Citation probe
        </h2>
        <p className="max-w-[680px] text-[15px] leading-[22px] text-muted-foreground text-pretty">
          Ask an AI search engine the questions your customers ask, and see
          whether it cites {domain}. Answers vary between runs, so treat one
          result as a sample.
        </p>
      </div>

      {!CITATION_PROBE_ENABLED ? (
        <p
          role="status"
          className="rounded-2xl bg-tint px-5 py-4 text-sm text-muted-foreground"
        >
          The citation probe is paused for now. Your last saved results are
          shown below.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <label
            htmlFor="probe-prompts"
            className="text-[17px] font-semibold text-foreground"
          >
            Questions to test
          </label>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            One per line · {count} of {MAX_PROBE_PROMPTS}
          </span>
        </div>
        <textarea
          id="probe-prompts"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          disabled={!CITATION_PROBE_ENABLED}
          className="w-full resize-y rounded-2xl border border-border bg-tint px-5 py-4 text-[15px] leading-6 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-4">
          <Badge variant="default">Gemini</Badge>{" "}
          <Button
            type="button"
            onClick={run}
            disabled={running || !CITATION_PROBE_ENABLED}
          >
            <RefreshCw className={cn(running && "animate-spin")} aria-hidden />
            {running
              ? "Asking…"
              : data?.run || failure
                ? "Run again"
                : "Run probe"}
          </Button>
        </div>
      </div>

      {failure ? <FailurePanel failure={failure} /> : null}

      {rejected.length > 0 ? (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {rejected.map((item) => (
            <li key={item.prompt}>
              <span className="font-medium text-foreground">
                Skipped “{item.prompt}”:
              </span>{" "}
              {item.reason}
            </li>
          ))}
        </ul>
      ) : null}

      {nothingTested && failure ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 pb-4">
            <div className="h-2 w-20 rounded-full bg-muted" aria-hidden />
            <p className="text-base text-muted-foreground">
              No citation rate yet · 0 of {failure.prompts.length} questions ran
            </p>
          </div>
          <ul className="divide-y divide-border border-t border-border">
            {failure.prompts.map((prompt) => (
              <NotRunRow
                key={prompt}
                prompt={prompt}
                reason="try again later"
              />
            ))}
          </ul>
        </div>
      ) : null}

      {showResults ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 pb-4">
            <div className="h-2 w-20 rounded-full bg-muted" aria-hidden>
              <div
                className="h-2 rounded-full bg-foreground"
                style={{
                  width: `${Math.max(0, Math.min(100, summary.citationRate))}%`,
                }}
              />
            </div>
            <p className="text-base text-muted-foreground">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {summary.citationRate}%
              </span>{" "}
              cited in {summary.cited} of {summary.total} answers
              {summary.mentioned > summary.cited
                ? ` · named in ${summary.mentioned}`
                : ""}
            </p>
          </div>
          {summary.topCompetitors.length > 0 ? (
            <p className="pb-3 text-sm text-muted-foreground">
              Cited instead:{" "}
              {summary.topCompetitors
                .map((c) => `${c.domain} (${c.count})`)
                .join(", ")}
            </p>
          ) : null}
          <ul className="divide-y divide-border border-t border-border">
            {data.run?.results.map((result) => (
              <ResultRow key={result.prompt} result={result} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
