'use client';

import { useState } from 'react';
import type { AiReferralData } from '@/lib/aeo/ai-referrals';

export interface AiReferralsPayload {
  data: AiReferralData;
  fetchedAt: string;
}

function Sparkline({ daily }: { daily: AiReferralData['daily'] }) {
  if (daily.length < 2) return null;
  const max = Math.max(...daily.map((d) => d.sessions), 1);
  return (
    <div
      className="mt-4 flex h-12 items-end gap-px"
      role="img"
      aria-label={`AI visits per day, peak ${max}`}
    >
      {daily.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.sessions}`}
          className="min-w-px flex-1 rounded-sm bg-foreground/70"
          style={{ height: `${Math.max(6, (d.sessions / max) * 100)}%` }}
        />
      ))}
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
    <section className="rounded-xl bg-raised p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Visits from AI tools</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real visitors your Google Analytics attributes to ChatGPT, Perplexity, Gemini and other AI
            assistants.
          </p>
        </div>
        {ga4Connected ? (
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="shrink-0 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {loading ? 'Loading…' : data ? 'Refresh' : 'Load AI traffic'}
          </button>
        ) : null}
      </div>

      {!ga4Connected ? (
        <p className="mt-4 text-sm text-muted-foreground">
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
        <p role="alert" className="mt-3 text-sm text-danger-ink">
          {error}
        </p>
      ) : null}

      {data ? (
        <div className="mt-5">
          <p className="text-sm text-foreground">
            <span className="text-2xl font-semibold tabular-nums">
              {data.aiSessions.toLocaleString()}
            </span>{' '}
            visits from AI tools in the last 90 days
            {data.totalSessions > 0 ? ` · ${data.sharePct}% of all traffic` : ''}
          </p>
          <Sparkline daily={data.daily} />

          {data.aiSessions === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No AI-referred visits found. Some AI apps hide where visitors come from, so this can
              undercount.
            </p>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">By AI tool</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {data.engines.map((engine) => (
                    <li key={engine.id} className="flex justify-between gap-3">
                      <span className="text-foreground">{engine.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {engine.sessions.toLocaleString()}
                        {engine.conversions > 0 ? ` · ${engine.conversions} conv.` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Pages they land on</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {data.pages.slice(0, 6).map((page) => (
                    <li key={page.landingPage} className="flex justify-between gap-3">
                      <span className="truncate font-mono text-xs text-foreground">{page.landingPage}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {page.sessions.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Updated {new Date(payload.fetchedAt).toLocaleDateString()}. Counts are a floor: some AI
            apps strip the referrer, so those visits show up as direct traffic.
          </p>
        </div>
      ) : null}
    </section>
  );
}
