'use client';

import { useEffect, useRef, useState } from 'react';
import type { AiReferralData } from '@/lib/aeo/ai-referrals';

const HEIGHT = 220;
const PAD = { top: 16, right: 56, bottom: 28, left: 36 };
const DAY_MS = 86_400_000;

interface Point {
  date: string;
  sessions: number;
}

/** GA4 only returns days that had visits; fill the rest with 0 so the line is honest. */
function fillDays(daily: AiReferralData['daily'], start: string, end: string): Point[] {
  const byDate = new Map(daily.map((d) => [d.date, d.sessions]));
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return daily;
  const out: Point[] = [];
  for (let t = from; t <= to; t += DAY_MS) {
    const date = new Date(t).toISOString().slice(0, 10);
    out.push({ date, sessions: byDate.get(date) ?? 0 });
  }
  return out;
}

/** 1/2/5 × 10^k step so axis ticks are clean numbers. */
function niceScale(max: number): { top: number; ticks: number[] } {
  const rough = Math.max(max, 1) / 3;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? pow * 10;
  const top = Math.ceil(Math.max(max, 1) / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  return { top, ticks };
}

const compact = (n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(n));

const fmtDay = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', ...opts });

export function AiVisitsLineChart({
  daily,
  rangeStart,
  rangeEnd,
}: {
  daily: AiReferralData['daily'];
  rangeStart: string;
  rangeEnd: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const points = fillDays(daily, rangeStart, rangeEnd);
  const max = Math.max(...points.map((p) => p.sessions), 0);
  const { top, ticks } = niceScale(max);
  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length > 1 ? (i / (points.length - 1)) * innerW : innerW / 2);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.sessions).toFixed(1)}`).join('');
  const baseY = PAD.top + innerH;
  const area = points.length > 1 ? `${line}L${x(points.length - 1)},${baseY}L${x(0)},${baseY}Z` : '';

  const xTickCount = width < 480 ? 3 : 5;
  const xTicks = points.length > 1
    ? Array.from({ length: xTickCount }, (_, k) => Math.round((k / (xTickCount - 1)) * (points.length - 1)))
    : [];

  const last = points.length - 1;
  const hovered = hover !== null ? points[hover] : null;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(last, Math.round(rel * last))));
  }

  const tipLeft = hover !== null ? x(hover) : 0;
  const flip = tipLeft > width - 150;

  return (
    <div ref={wrapRef} className="relative w-full">
      {width > 0 && points.length > 0 ? (
        <svg width={width} height={HEIGHT} role="img" aria-label={`AI visits per day, peak ${max}`} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[11px] tabular-nums">
                {compact(t)}
              </text>
            </g>
          ))}
          {xTicks.map((i, k) => (
            <text
              key={i}
              x={x(i)}
              y={HEIGHT - 6}
              textAnchor={k === 0 ? 'start' : k === xTicks.length - 1 ? 'end' : 'middle'}
              className="fill-muted-foreground text-[11px]"
            >
              {fmtDay(points[i].date, { month: 'short', day: 'numeric' })}
            </text>
          ))}
          {area ? <path d={area} className="fill-foreground" fillOpacity={0.08} /> : null}
          <path d={line} fill="none" className="stroke-foreground" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null ? (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={baseY} className="stroke-line-strong" strokeWidth={1} />
          ) : null}
          {(() => {
            const i = hover ?? last;
            return (
              <g>
                <circle cx={x(i)} cy={y(points[i].sessions)} r={6} className="fill-raised" />
                <circle cx={x(i)} cy={y(points[i].sessions)} r={4} className="fill-foreground" />
                {hover === null ? (
                  <text x={x(i) + 12} y={y(points[i].sessions)} dominantBaseline="middle" className="fill-foreground text-xs font-semibold tabular-nums">
                    {points[i].sessions}
                  </text>
                ) : null}
              </g>
            );
          })()}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      ) : null}
      {hovered ? (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-md"
          style={{
            left: tipLeft,
            top: Math.max(0, y(hovered.sessions) - 56),
            transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})`,
          }}
        >
          <div className="opacity-75">{fmtDay(hovered.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <div className="font-semibold tabular-nums">
            {hovered.sessions.toLocaleString()} {hovered.sessions === 1 ? 'visit' : 'visits'}
          </div>
        </div>
      ) : null}
      <table className="sr-only">
        <caption>AI visits per day</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Visits</th>
          </tr>
        </thead>
        <tbody>
          {points.filter((p) => p.sessions > 0).map((p) => (
            <tr key={p.date}>
              <td>{p.date}</td>
              <td>{p.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
