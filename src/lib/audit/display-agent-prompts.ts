import { generatePromptForFinding } from '@/lib/audit/prompt-generator';
import type { AgentPrompt, Finding } from '@/lib/supabase/types';

/** Display shape for Agents tab — real DB prompts or synthesized from findings. */
export interface DisplayAgentPrompt {
  id: string;
  title: string;
  pagePath: string | null;
  fullPrompt: string;
}

export function agentPromptsFromFindings(
  findings: Finding[],
  website: { domain: string; url: string },
  limit = 5
): DisplayAgentPrompt[] {
  return findings.slice(0, limit).map((finding) => {
    const sections = generatePromptForFinding(
      {
        type: finding.type,
        category: finding.category,
        severity: finding.severity,
        title: finding.title,
        summary: finding.summary,
        page_path: finding.page_path,
        evidence: finding.evidence ?? {},
        buyer_moment: finding.buyer_moment ?? 'Evaluating the offer',
        estimated_value: finding.estimated_value ?? '',
      },
      website.domain,
      website.url
    );
    return {
      id: finding.id,
      title: finding.title,
      pagePath: finding.page_path,
      fullPrompt: sections.full_prompt,
    };
  });
}

export function toDisplayAgentPrompts(
  prompts: AgentPrompt[],
  findings: Finding[],
  website: { domain: string; url: string }
): DisplayAgentPrompt[] {
  if (prompts.length > 0) {
    const byFinding = new Map(findings.map((f) => [f.id, f]));
    return prompts.slice(0, 8).map((p) => ({
      id: p.id,
      title: byFinding.get(p.finding_id)?.title ?? 'Execution prompt',
      pagePath: p.page_path,
      fullPrompt: p.full_prompt,
    }));
  }
  return agentPromptsFromFindings(findings, website);
}
