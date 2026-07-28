import { SectionFrame } from '@/components/operator/report/section-frame';
import type { CommercialGraphBriefSlice } from '@/lib/graph/types';

export function GraphExecutiveMemo({ memo }: { memo: CommercialGraphBriefSlice['executiveMemo'] }) {
  const rows: Array<[string, string]> = [
    ['What the site is saying', memo.whatTheSiteIsSaying],
    ['What search demand shows', memo.whatSearchConsoleIsSaying],
    ['What engagement shows', memo.whatGa4IsSaying],
    ['What AI is likely inferring', memo.whatAiIsInferring],
    ['Why leads are stuck', memo.whatTheGraphShows],
    ['What matters most for leads', memo.whatMattersMost],
    ['What to fix first', memo.whatToFixFirst],
    ['Which page plays to build', memo.whatPageSystemsToBuild],
    ['What NextGrid should execute', memo.whatNextgridShouldExecute],
  ];

  return (
    <SectionFrame id="graph-executive-memo" title="Why leads are stuck">
      <SectionFrame.Visual>
        <div className="divide-y divide-white/8 rounded-lg border border-white/8 bg-white/[0.02]">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 px-3 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)]"
            >
              <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                {label}
              </p>
              <p className="text-sm leading-snug text-white/85">{value}</p>
            </div>
          ))}
        </div>
      </SectionFrame.Visual>
      <SectionFrame.Interpretation>
        <p>Lead-path read across site, search, engagement, and AI signals.</p>
      </SectionFrame.Interpretation>
      <SectionFrame.Action>
        <p>{memo.whatNextgridShouldExecute}</p>
      </SectionFrame.Action>
    </SectionFrame>
  );
}
