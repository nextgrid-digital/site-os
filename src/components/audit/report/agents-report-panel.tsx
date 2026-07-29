import { CopyablePrompt } from '@/components/audit/report/copyable-prompt';
import { ReportSection } from '@/components/audit/report/report-section';
import type { DisplayAgentPrompt } from '@/lib/audit/display-agent-prompts';
import type { FreeReportViewModel } from '@/lib/audit/free-report-view';

export function AgentsReportPanel({
  view,
  prompts,
}: {
  view: FreeReportViewModel;
  prompts: DisplayAgentPrompt[];
}) {
  return (
    <div className="space-y-10">
      <ReportSection
        index={1}
        title="How agents parse this site"
        lead="Clarity and answerability for AI answer engines and crawlers."
      >
        <div className="mb-5 flex flex-wrap gap-8">
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">Clarity</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-zinc-950">
              {view.aiScores.clarity != null ? Math.round(view.aiScores.clarity) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              Answerability
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-zinc-950">
              {view.aiScores.answerability != null ? Math.round(view.aiScores.answerability) : '—'}
            </p>
          </div>
        </div>
        {view.aiSummary ? (
          <p className="max-w-3xl text-sm leading-7 text-zinc-700">{view.aiSummary}</p>
        ) : (
          <p className="text-sm text-zinc-500">No agent summary available yet.</p>
        )}
      </ReportSection>

      <ReportSection
        index={2}
        title="Citability & entity notes"
        lead="What answer engines can (and cannot) confidently say about this business."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              Agent signals
            </p>
            {view.aiBullets.length === 0 ? (
              <p className="text-sm text-zinc-500">No AEO bullets yet.</p>
            ) : (
              <ul className="space-y-2">
                {view.aiBullets.map((item) => (
                  <li key={item} className="text-sm leading-6 text-zinc-700">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              AEO improvements
            </p>
            {view.layeredRecs.aeo.length === 0 ? (
              <p className="text-sm text-zinc-500">No AEO rewrites suggested.</p>
            ) : (
              <ul className="space-y-2">
                {view.layeredRecs.aeo.map((item) => (
                  <li key={item} className="text-sm leading-6 text-zinc-700">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ReportSection>

      <ReportSection
        index={3}
        title="Machine / crawl signals"
        lead="Structural cues machines use when indexing and linking the site."
      >
        {view.machineBullets.length === 0 ? (
          <p className="text-sm text-zinc-500">No machine signals yet.</p>
        ) : (
          <ul className="max-w-3xl space-y-2">
            {view.machineBullets.map((item) => (
              <li key={item} className="text-sm leading-6 text-zinc-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </ReportSection>

      <ReportSection
        index={4}
        title="Execution prompts"
        lead="Universal prompts you can paste into any AI coding or writing agent."
      >
        {prompts.length === 0 ? (
          <p className="text-sm text-zinc-500">No prompts available for this run yet.</p>
        ) : (
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <CopyablePrompt key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </ReportSection>

      <ReportSection
        index={5}
        title="Ship an Ask AI block"
        lead="Put this above your site footer so visitors can ask answer engines about the brand."
      >
        <p className="text-sm leading-6 text-zinc-600">
          Use the <span className="font-medium text-zinc-900">Ask AI</span> block below the report —
          pick a question, try the pills, then copy the HTML for your site.
        </p>
      </ReportSection>
    </div>
  );
}
