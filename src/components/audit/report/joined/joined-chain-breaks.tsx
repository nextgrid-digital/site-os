import type { JoinedChainBreak } from '@/lib/audit/joined-traffic-story';

export function JoinedChainBreaks({ breaks }: { breaks: JoinedChainBreak[] }) {
  if (breaks.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-surface bg-surface-5 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No clear chain breaks detected from the stored GSC/GA4 rows in this audit window.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {breaks.map((item) => (
        <article
          key={item.id}
          className="rounded-[14px] border border-solid border-surface bg-surface-3 p-4 transition hover:border-zinc-300"
        >
          <div className="flex flex-wrap gap-1">
            {item.sources.map((s) => (
              <span
                key={s}
                className="rounded bg-surface-5 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
              >
                {s}
              </span>
            ))}
          </div>
          <h3 className="mt-2 text-sm font-medium">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.statement}</p>
        </article>
      ))}
    </div>
  );
}
