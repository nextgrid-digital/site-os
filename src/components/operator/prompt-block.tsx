import type { AgentPrompt } from '@/lib/supabase/types';

export function PromptBlock({ prompt }: { prompt: AgentPrompt }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-6 whitespace-pre-wrap">
      {prompt.full_prompt}
    </pre>
  );
}
