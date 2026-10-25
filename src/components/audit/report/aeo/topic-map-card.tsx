'use client';

import { useState } from 'react';
import type { Topic, TopicCoverage, TopicMap } from '@/lib/aeo/topic-map';
import { cn } from '@/lib/utils';

const COVERAGE_LABEL: Record<TopicCoverage, string> = {
  strong: 'Well covered',
  developing: 'Developing',
  thin: 'Thin',
};

const COVERAGE_TONE: Record<TopicCoverage, string> = {
  strong: 'bg-success-ink',
  developing: 'bg-warning-ink',
  thin: 'bg-danger-ink',
};

function TopicTile({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  const pageLabel = `${topic.paths.length} ${topic.paths.length === 1 ? 'page' : 'pages'}`;
  return (
    <li className="rounded-lg bg-tint p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>
          <span className="block text-sm font-medium text-foreground">{topic.name}</span>
          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{topic.description}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn('size-2 rounded-full', COVERAGE_TONE[topic.coverage])} aria-hidden />
          {COVERAGE_LABEL[topic.coverage]}
        </span>
      </button>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {pageLabel} · AEO readiness {topic.avgScore}
      </p>
      {open ? (
        <ul className="mt-2 space-y-1">
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

  return (
    <section className="rounded-xl bg-raised p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Topic map</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What your pages cover, grouped by topic, and the subjects buyers would expect that no page
            answers yet. AI-drafted from your crawl, so treat it as a starting point.
          </p>
        </div>
        <button
          type="button"
          onClick={build}
          disabled={building}
          className="shrink-0 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {building ? 'Mapping…' : map ? 'Rebuild' : 'Build map'}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger-ink">
          {error}
        </p>
      ) : null}

      {map ? (
        <div className="mt-5 space-y-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            {map.topics.map((topic, index) => (
              <TopicTile key={`${index}-${topic.name}`} topic={topic} />
            ))}
          </ul>
          {map.gaps.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-foreground">Missing topics</h3>
              <ul className="mt-2 space-y-3">
                {map.gaps.map((gap, index) => (
                  <li key={`${index}-${gap.topic}`} className="text-sm leading-6">
                    <span className="font-medium text-foreground">{gap.topic}</span>
                    <span className="block text-xs text-muted-foreground">{gap.why}</span>
                    <span className="block text-xs text-foreground">Write: {gap.suggestedPage}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
