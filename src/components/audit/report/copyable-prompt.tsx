'use client';

import { useState } from 'react';
import type { DisplayAgentPrompt } from '@/lib/audit/display-agent-prompts';

export function CopyablePrompt({ prompt }: { prompt: DisplayAgentPrompt }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.fullPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">{prompt.title}</p>
          {prompt.pagePath ? (
            <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">{prompt.pagePath}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto px-4 py-3 font-mono text-[11px] leading-5 whitespace-pre-wrap text-zinc-600">
        {prompt.fullPrompt}
      </pre>
    </div>
  );
}
