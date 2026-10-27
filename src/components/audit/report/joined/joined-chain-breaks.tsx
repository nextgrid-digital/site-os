import type { JoinedChainBreak } from "@/lib/audit/joined-traffic-story";

export function JoinedChainBreaks({ breaks }: { breaks: JoinedChainBreak[] }) {
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
    <div className="rounded-xl bg-raised p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Source</th>
              <th className="pb-2 font-medium">Issue</th>
              <th className="pb-2 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {breaks.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="py-2 pr-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {item.sources.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-2 pr-3 align-top font-medium whitespace-nowrap text-foreground">
                  {item.title}
                </td>
                <td
                  className="py-2 align-top text-muted-foreground"
                  title={item.statement}
                >
                  {item.statement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
