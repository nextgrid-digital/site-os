'use client';

import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ProbeResult, ProbeSummary } from '@/lib/aeo/citation-probe';
import { MAX_PROBE_PROMPTS } from '@/lib/aeo/citation-probe';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { CitationProbeRun } from '@/lib/db/aeo';
import { cn } from '@/lib/utils';

interface ProbeResponse {
  run: CitationProbeRun | null;
  summary: ProbeSummary | null;
  rejected?: Array<{ prompt: string; reason: string }>;
  error?: string;
}

function suggestPrompts(analysis: AeoAnalysis | null, domain: string): string[] {
  const offer = analysis?.inferred_primary_offer?.trim();
  const icp = analysis?.inferred_icps?.[0]?.trim();
  if (!offer) return [`What is ${domain}?`, `Is ${domain} any good?`];
  return [
    `Best ${offer}`,
    icp ? `${offer} for ${icp}` : `How to choose ${offer}`,
    `Top ${offer} providers compared`,
  ].slice(0, MAX_PROBE_PROMPTS);
}

function ResultRow({ result }: { result: ProbeResult }) {
  const status = result.error ? 'error' : result.cited ? 'cited' : result.mentioned ? 'mentioned' : 'missing';
  return (
    <li className="flex items-start gap-3 py-3">
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
          status === 'cited' ? 'bg-success-ink text-white' : 'bg-tint text-muted-foreground'
        )}
        aria-hidden
      >
        {status === 'cited' ? <Check className="size-3" /> : <X className="size-3" />}
      </span>
      <div className="min-w-0 text-sm leading-6">
        <p className="font-medium text-foreground">{result.prompt}</p>
        <p className="text-xs text-muted-foreground">
          {status === 'cited' && 'Your site was cited as a source.'}
          {status === 'mentioned' && 'Named in the answer, but not cited as a source.'}
          {status === 'missing' &&
            (result.sources.length > 0
              ? `Not cited. Sources used: ${result.sources.slice(0, 4).map((s) => s.domain).join(', ')}`
              : 'Not cited. The answer used no web sources.')}
          {status === 'error' && `Couldn't run this question: ${result.error}`}
        </p>
      </div>
    </li>
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
  const [text, setText] = useState(() => suggestPrompts(analysis, domain).join('\n'));
  const [data, setData] = useState<ProbeResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<Array<{ prompt: string; reason: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}/citation-probe`)
      .then((res) => (res.ok ? (res.json() as Promise<ProbeResponse>) : null))
      .then((json) => {
        if (!cancelled && json?.run) {
          setData(json);
          setText(json.run.results.map((r) => r.prompt).join('\n'));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function run() {
    setRunning(true);
    setError(null);
    setRejected([]);
    try {
      const res = await fetch(`/api/projects/${projectId}/citation-probe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts: text.split('\n') }),
      });
      const json = (await res.json()) as ProbeResponse;
      setRejected(json.rejected ?? []);
      if (!res.ok) throw new Error(json.error ?? 'Probe failed.');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Probe failed.');
    } finally {
      setRunning(false);
    }
  }

  const summary = data?.summary;
  return (
    <section className="rounded-xl bg-raised p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Citation probe</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask an AI search engine the questions your customers ask, and see whether it cites {domain}.
        Answers vary between runs, so treat one result as a sample.
      </p>

      <label htmlFor="probe-prompts" className="mt-4 block text-xs font-medium text-muted-foreground">
        Questions to test, one per line (up to {MAX_PROBE_PROMPTS})
      </label>
      <textarea
        id="probe-prompts"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="mt-1 w-full resize-y rounded-lg bg-tint p-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="cursor-pointer rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {running ? 'Asking…' : data?.run ? 'Run again' : 'Run probe'}
        </button>
        {error ? (
          <p role="alert" className="text-sm text-danger-ink">
            {error}
          </p>
        ) : null}
      </div>

      {rejected.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {rejected.map((item) => (
            <li key={item.prompt}>
              <span className="font-medium text-foreground">Skipped “{item.prompt}”:</span> {item.reason}
            </li>
          ))}
        </ul>
      ) : null}

      {data?.run && summary ? (
        <div className="mt-5">
          <p className="text-sm text-foreground">
            <span className="text-2xl font-semibold tabular-nums">{summary.citationRate}%</span>{' '}
            cited in {summary.cited} of {summary.total} answers
            {summary.mentioned > summary.cited ? ` · named in ${summary.mentioned}` : ''}
          </p>
          {summary.topCompetitors.length > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Cited instead: {summary.topCompetitors.map((c) => `${c.domain} (${c.count})`).join(', ')}
            </p>
          ) : null}
          <ul className="mt-2 divide-y divide-border">
            {data.run.results.map((result) => (
              <ResultRow key={result.prompt} result={result} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
