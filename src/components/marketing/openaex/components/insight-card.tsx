"use client";

import CardTitleIcon from "./card-title-icon";
import { RevealCard } from "./reveal";
import {
  fmtCount,
  fmtMoney,
  fmtShare,
  TOTAL_VIEWS,
  type InsightTable,
} from "../demo/insight-tables";

/** Table card in the hero card style. Click or press Enter to show how its numbers are calculated. */
export default function InsightCard({
  table,
  open,
  onToggle,
}: {
  table: InsightTable;
  open: boolean;
  onToggle: () => void;
}) {
  const maxViews = Math.max(...table.rows.map((r) => r.views));
  const cols = table.revenue
    ? "minmax(0,1fr) 3.5rem 3.5rem 4.25rem"
    : "minmax(0,1fr) 3.5rem 3.5rem";
  const num = "text-right text-[0.6875rem] leading-[0.6875rem] tabular-nums text-muted-foreground";

  return (
    <RevealCard
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${table.title}. Show how this is calculated`}
      data-aeo-target={table.id}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="group/card flex h-full cursor-pointer flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5 outline-none transition-colors focus-visible:bg-tint data-[open=true]:bg-tint"
      data-open={open}
    >
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 max-md:px-3 max-md:pt-4 max-md:pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <CardTitleIcon kind={table.icon} />
          <h3 className="min-w-0 truncate text-[clamp(0.875rem,0.82rem+0.2vw,1rem)] font-medium leading-[1.3] tracking-[-0.005em]">
            {table.title}
          </h3>
        </div>
      </div>

      <div className="min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
        <div
          className="grid items-center gap-3 px-2.5 pb-1 text-[0.6875rem] font-medium text-muted-foreground"
          style={{ gridTemplateColumns: cols }}
        >
          <span>{table.nameHeader}</span>
          <span className="text-right">Views</span>
          <span className="text-right">Share</span>
          {table.revenue ? <span className="text-right">Revenue</span> : null}
        </div>
        <ul className="flex list-outside flex-col [list-style-type:none]">
          {table.rows.map((r) => (
            <li key={r.label} className="list-item">
              <div className="relative block w-full overflow-hidden rounded-lg">
                <div
                  className="pointer-events-none absolute top-1 left-0 block h-6 rounded-md bg-color-001"
                  style={{ width: `${Math.max(10, (r.views / maxViews) * 92)}%` }}
                  aria-hidden
                />
                <div
                  className="relative z-10 grid items-center gap-3 px-2.5 py-2"
                  style={{ gridTemplateColumns: cols }}
                >
                  <span className="flex min-w-0 items-center gap-2 text-xs leading-4">
                    {r.imageKind === "src" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="block size-4 shrink-0 rounded-md object-contain" alt="" src={r.image} />
                    ) : r.imageKind === "css" ? (
                      <span
                        aria-hidden
                        className="block h-3 w-4 shrink-0 rounded-[3px] bg-cover bg-center"
                        style={{ backgroundImage: r.image }}
                      />
                    ) : null}
                    {table.id === "top-sources" && !r.image ? (
                      <span aria-hidden className="block size-4 shrink-0 rounded-full bg-surface-7" />
                    ) : null}
                    <span className="min-w-0 truncate">{r.label}</span>
                  </span>
                  <span className={num}>{fmtCount(r.views)}</span>
                  <span className={num}>{fmtShare(r.views, TOTAL_VIEWS)}</span>
                  {table.revenue ? (
                    <span className={num}>{r.revenue != null ? fmtMoney(r.revenue) : "—"}</span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </RevealCard>
  );
}
