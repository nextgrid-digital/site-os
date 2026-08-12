'use client';

import { useState } from 'react';
import { AskAiPills } from '@/components/audit/report/ask-ai-pills';
import {
  buildAskAiHtmlSnippet,
  type AskAiWidgetModel,
} from '@/lib/audit/ask-ai-widget';

interface AskAiImplementProps {
  askAi: AskAiWidgetModel;
}

export function AskAiImplement({ askAi }: AskAiImplementProps) {
  const [selected, setSelected] = useState(askAi.primaryQuestion);
  const [copied, setCopied] = useState(false);
  const snippet = buildAskAiHtmlSnippet({ brand: askAi.brand, question: selected });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-6 text-zinc-600">
        Place this above your site footer so visitors can ask ChatGPT, Claude, or Perplexity about{''}
        {askAi.brand}. Use a question buyers already ask — the audit suggests one from your offer and
        AEO signals.
      </p>

      <div>
        <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
          Question for the links
        </p>
        <ul className="space-y-2">
          {askAi.questions.map((question) => {
            const active = question === selected;
            return (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => setSelected(question)}
                  className={[
                    'w-full rounded-xl border px-3.5 py-2.5 text-left text-sm leading-6 transition',
                    active
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700',
                  ].join('')}
                >
                  {question}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <AskAiPills askAi={askAi} question={selected} />

      <div className="overflow-hidden rounded-xl bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <p className="text-sm font-medium text-zinc-900">HTML for your site</p>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            {copied ? 'Copied' : 'Copy HTML'}
          </button>
        </div>
        <pre className="max-h-64 overflow-auto px-4 py-3 font-mono text-[11px] leading-5 whitespace-pre-wrap text-zinc-600">
          {snippet}
        </pre>
      </div>
    </div>
  );
}
