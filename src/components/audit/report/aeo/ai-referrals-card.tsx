'use client';

import { useState } from 'react';
import type { AiReferralData } from '@/lib/aeo/ai-referrals';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AiVisitsLineChart } from '@/components/audit/report/aeo/ai-visits-line-chart';

export interface AiReferralsPayload {
  data: AiReferralData;
  fetchedAt: string;
}

const COLLAPSED_TILES = 8;

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

const TILE_GRID =
  'grid grid-flow-dense grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2';

/** One small rounded tile; shade = share of the busiest tile (heatmap). */
function HeatTile({
  label,
  mono,
  note,
  value,
  total,
  max,
  wide,
  dashed,
}: {
  label: string;
  mono?: boolean;
  note?: string | null;
  value: number;
  total: number;
  max: number;
  wide?: boolean;
  dashed?: boolean;
}) {
  const heat = max > 0 ? 10 + (value / max) * 90 : 10;
  const dark = heat > 48 && !dashed;
  const share = pct(value, total);
  return (
    <li
      title={`${label}${note ? ` (${note})` : ''}: ${value.toLocaleString()} ${value === 1 ? 'visit' : 'visits'} · ${share}%`}
      className={cn(
        'flex h-[92px] flex-col justify-between overflow-hidden rounded-2xl p-3',
        wide && 'col-span-2',
        dashed && 'border-2 border-dashed border-line-strong',
        dark ? 'text-background' : 'text-foreground',
      )}
      style={{
        backgroundColor: dashed
          ? 'var(--color-tint)'
          : `color-mix(in oklab, var(--color-foreground) ${heat}%, var(--color-muted))`,
      }}
    >
      <span className={cn('truncate text-xs font-medium', mono && 'font-mono')}>
        {label}
        {note ? <span className="ml-1.5 font-sans font-normal opacity-70">{note}</span> : null}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold leading-none tabular-nums">{value.toLocaleString()}</span>
        <span className="text-xs opacity-70 tabular-nums">{share}%</span>
      </span>
    </li>
  );
}

function LandingPages({ pages, total }: { pages: AiReferralData['pages']; total: number }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...pages].filter((p) => p.sessions > 0).sort((a, b) => b.sessions - a.sessions);
  const max = sorted[0]?.sessions ?? 0;
  const visible = expanded ? sorted : sorted.slice(0, COLLAPSED_TILES);
  const hidden = sorted.length - visible.length;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[17px] font-semibold text-foreground">Pages they land on</h3>
      <ul className={TILE_GRID}>
        {visible.map((page, i) => {
          const unset = page.landingPage === '(not set)';
          return (
            <HeatTile
              key={page.landingPage}
              label={page.landingPage}
              mono
              note={unset ? 'not recorded' : page.landingPage === '/' ? 'home' : null}
              value={page.sessions}
              total={total}
              max={max}
              wide={i === 0 && sorted.length > 2}
              dashed={unset}
            />
          );
        })}
      </ul>
      {sorted.length > COLLAPSED_TILES ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="self-start rounded text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? 'Show fewer' : `Show ${hidden} more ${hidden === 1 ? 'page' : 'pages'}`}
        </button>
      ) : null}
    </div>
  );
}

function Engines({ data }: { data: AiReferralData }) {
  const engines = [...data.engines].filter((e) => e.sessions > 0).sort((a, b) => b.sessions - a.sessions);
  const max = engines[0]?.sessions ?? 0;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[17px] font-semibold text-foreground">Which AI tool</h3>
      <ul className={TILE_GRID}>
        {engines.map((engine) => (
          <HeatTile
            key={engine.id}
            label={engine.name}
            note={engine.conversions > 0 ? `${engine.conversions} conv.` : null}
            value={engine.sessions}
            total={data.aiSessions}
            max={max}
          />
        ))}
      </ul>
    </div>
  );
}

export function AiReferralsCard({
  projectId,
  ga4Connected,
  initial,
}: {
  projectId: string;
  ga4Connected: boolean;
  initial: AiReferralsPayload | null;
}) {
  const [payload, setPayload] = useState<AiReferralsPayload | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/ai-referrals`, { method: 'POST' });
      const json = (await res.json()) as { aiReferrals?: AiReferralsPayload; error?: string };
      if (!res.ok || !json.aiReferrals) throw new Error(json.error ?? 'Could not load AI traffic.');
      setPayload(json.aiReferrals);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load AI traffic.');
    } finally {
      setLoading(false);
    }
  }

  const data = payload?.data;
  return (
    <section className="flex flex-col gap-8 rounded-3xl bg-raised p-9 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold leading-[26px] text-foreground">Visits from AI tools</h2>
          <p className="max-w-[680px] text-[15px] leading-[22px] text-muted-foreground text-pretty">
            Real visitors your Google Analytics attributes to ChatGPT, Perplexity, Gemini and other AI
            assistants.
          </p>
        </div>
        {ga4Connected ? (
          <Button
            type="button"
            onClick={load}
            disabled={loading}
          >
            {loading ? 'Loading…' : data ? 'Refresh' : 'Load AI traffic'}
          </Button>
        ) : null}
      </div>

      {!ga4Connected ? (
        <p className="text-sm text-muted-foreground">
          Connect Google Analytics to see this.{' '}
          <a
            href={`/audit/${projectId}/connect`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Connect Google
          </a>
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger-ink">
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <div className="flex flex-col gap-5 rounded-[18px] bg-tint px-6 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="flex flex-wrap items-baseline gap-x-3 text-base text-muted-foreground">
                <span className="text-[40px] font-bold leading-[44px] tracking-[-0.03em] font-mono text-foreground">
                  {data.aiSessions.toLocaleString()}
                </span>
                <span>visits from AI tools in the last 90 days</span>
              </p>
              {data.totalSessions > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {data.sharePct}% of all {data.totalSessions.toLocaleString()} visits
                </span>
              ) : null}
            </div>
            {data.aiSessions > 0 ? (
              <AiVisitsLineChart daily={data.daily} rangeStart={data.rangeStart} rangeEnd={data.rangeEnd} />
            ) : null}
          </div>

          {data.aiSessions === 0 ? (
            <p className="text-sm text-muted-foreground">
              No AI-referred visits found. Some AI apps hide where visitors come from, so this can
              undercount.
            </p>
          ) : (
            <div className="grid gap-x-12 gap-y-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <LandingPages pages={data.pages} total={data.aiSessions} />
              <Engines data={data} />
            </div>
          )}
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            Updated {new Date(payload.fetchedAt).toLocaleDateString()}. Counts are a floor: some AI
            apps strip the referrer, so those visits show up as direct traffic.
          </p>
        </>
      ) : null}
    </section>
  );
}
