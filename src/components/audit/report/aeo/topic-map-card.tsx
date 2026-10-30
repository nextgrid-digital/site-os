'use client';

import { useState } from 'react';
import { Check, Copy, Lock } from 'lucide-react';
import { buildGapPrompt } from '@/lib/aeo/topic-map';
import type { Topic, TopicCoverage, TopicGap, TopicMap } from '@/lib/aeo/topic-map';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCopyClipboard } from '@/hooks/use-copy-clipboard';

const COVERAGE_LABEL: Record<TopicCoverage, string> = {
  strong: 'Well covered',
  developing: 'Developing',
  thin: 'Thin',
};

const COVERAGE_DOT: Record<TopicCoverage, string> = {
  strong: 'bg-success-ink',
  developing: 'bg-warning-ink',
  thin: 'bg-danger-ink',
};

/** Copying a page-writing prompt is not released yet; flip to false to enable it. */
const PROMPTS_LOCKED = true;

const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_200px_200px] gap-x-10';

function Meter({ value, className }: { value: number; className: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 rounded-full bg-muted" aria-hidden>
      <div className={cn('h-1.5 rounded-full', className)} style={{ width: `${width}%` }} />
    </div>
  );
}

function SummaryTile({
  value,
  label,
  inverted,
}: {
  value: number;
  label: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-[18px] px-6 py-5',
        inverted ? 'bg-foreground text-background' : 'bg-tint text-foreground',
      )}
    >
      <span className="text-[40px] font-bold leading-[44px] tracking-[-0.03em] font-mono">{value}</span>
      <span className={cn('text-sm', inverted ? 'opacity-75' : 'text-muted-foreground')}>{label}</span>
    </div>
  );
}

function TopicRow({
  topic,
  maxPages,
  note,
}: {
  topic: Topic;
  maxPages: number;
  note: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pages = topic.paths.length;
  return (
    <li className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          ROW_GRID,
          'w-full items-center rounded py-[18px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <span className="flex flex-col gap-1">
          <span className="text-base font-semibold text-foreground">{topic.name}</span>
          <span className="text-sm leading-5 text-muted-foreground text-pretty">{topic.description}</span>
        </span>
        <span className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold tabular-nums text-foreground">{pages}</span>
          <Meter value={maxPages ? (pages / maxPages) * 100 : 0} className="bg-muted-foreground/60" />
        </span>
        <span className="flex flex-col gap-2">
          <span className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tabular-nums text-foreground">{topic.avgScore}</span>
            {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
          </span>
          <Meter
            value={topic.avgScore}
            className={note === 'lowest of your topics' ? 'bg-muted-foreground/40' : 'bg-foreground'}
          />
        </span>
      </button>
      {open ? (
        <ul className="space-y-1 pb-4">
          {topic.paths.map((path) => (
            <li key={path} className="truncate font-mono text-xs text-foreground">
              {path}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function GapCard({ gap }: { gap: TopicGap }) {
  const { copied, copy } = useCopyClipboard();

  const rowClass =
    'flex min-h-11 w-full items-center gap-2 rounded-xl border px-4 py-2 text-left text-sm font-medium outline-none';
  return (
    <li className="flex flex-col justify-between gap-[18px] rounded-[18px] bg-tint p-[22px]">
      <div className="flex flex-col gap-1.5">
        <span className="text-base font-semibold text-foreground">{gap.topic}</span>
        <span className="text-sm leading-[21px] text-muted-foreground text-pretty">{gap.why}</span>
      </div>
      {PROMPTS_LOCKED ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              aria-disabled="true"
              aria-label={`Copy prompt: ${gap.suggestedPage} (locked)`}
              onClick={(event) => event.preventDefault()}
              className={cn(rowClass, 'cursor-not-allowed border-border bg-raised text-muted-foreground')}
            >
              <span className="flex-1">Write: {gap.suggestedPage}</span>
              <Lock className="size-4 shrink-0" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>Locked for now — coming soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <button
          type="button"
          onClick={() => void copy(buildGapPrompt(gap))}
          className={cn(
            rowClass,
            'border-foreground bg-raised text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <span className="flex-1">Write: {gap.suggestedPage}</span>
          {copied ? <Check className="size-4 shrink-0" aria-hidden /> : <Copy className="size-4 shrink-0" aria-hidden />}
          <span className="sr-only" aria-live="polite">{copied ? 'Prompt copied' : ''}</span>
        </button>
      )}
    </li>
  );
}

export function TopicMapCard({
  projectId,
  initial,
}: {
  projectId: string;
  initial: TopicMap | null;
}) {
  const [map, setMap] = useState<TopicMap | null>(initial);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function build() {
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/topic-map`, { method: 'POST' });
      const json = (await res.json()) as { topicMap?: TopicMap; error?: string };
      if (!res.ok || !json.topicMap) throw new Error(json.error ?? 'Could not build the topic map.');
      setMap(json.topicMap);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build the topic map.');
    } finally {
      setBuilding(false);
    }
  }

  const topics = map?.topics ?? [];
  const gaps = map?.gaps ?? [];
  const pagesMapped = topics.reduce((sum, t) => sum + t.paths.length, 0);
  const maxPages = Math.max(0, ...topics.map((t) => t.paths.length));
  const scores = topics.map((t) => t.avgScore);
  const lowest = Math.min(...scores);
  const highest = Math.max(...scores);
  const coverages = [...new Set(topics.map((t) => t.coverage))];
  const allStrong = topics.length > 0 && coverages.length === 1 && coverages[0] === 'strong';

  function scoreNote(topic: Topic): string | null {
    if (topics.length < 2 || lowest === highest) return null;
    if (topic.avgScore === lowest) return 'lowest of your topics';
    if (topic.avgScore === highest) return 'highest';
    return null;
  }

  return (
    <section className="flex flex-col gap-8 rounded-3xl bg-raised p-9 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold leading-[26px] text-foreground">Topic map</h2>
          <p className="max-w-[680px] text-[15px] leading-[22px] text-muted-foreground text-pretty">
            What your pages cover, grouped by topic, and the subjects buyers would expect that no page
            answers yet. AI-drafted from your crawl, so treat it as a starting point.
          </p>
        </div>
        <Button
          type="button"
          onClick={build}
          disabled={building}
        >
          {building ? 'Mapping…' : map ? 'Rebuild' : 'Build map'}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger-ink">
          {error}
        </p>
      ) : null}

      {map ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <SummaryTile
              value={topics.length}
              label={allStrong ? 'topics covered, all well covered' : 'topics covered'}
            />
            <SummaryTile value={pagesMapped} label="pages mapped to a topic" />
            <SummaryTile value={gaps.length} label="topics buyers expect that no page answers" inverted />
          </div>

          {topics.length > 0 ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 pb-3.5">
                <h3 className="text-[17px] font-semibold text-foreground">What you cover</h3>
                {coverages.map((c) => (
                  <span key={c} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <i className={cn('size-2 rounded-full', COVERAGE_DOT[c])} aria-hidden />
                    {COVERAGE_LABEL[c]}
                  </span>
                ))}
              </div>
              <div
                className={cn(
                  ROW_GRID,
                  'border-b border-border pb-2.5 text-xs uppercase tracking-[0.04em] text-muted-foreground',
                )}
              >
                <span>Topic</span>
                <span>Pages</span>
                <span>AEO readiness</span>
              </div>
              <ul>
                {topics.map((topic, index) => (
                  <TopicRow
                    key={`${index}-${topic.name}`}
                    topic={topic}
                    maxPages={maxPages}
                    note={scoreNote(topic)}
                  />
                ))}
              </ul>
            </div>
          ) : null}

          {gaps.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[17px] font-semibold text-foreground">What&apos;s missing</h3>
                <span className="text-[13px] text-muted-foreground">Each gap comes with a page to write</span>
              </div>
              <ul className="grid grid-cols-3 gap-3">
                {gaps.map((gap, index) => (
                  <GapCard key={`${index}-${gap.topic}`} gap={gap} />
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
