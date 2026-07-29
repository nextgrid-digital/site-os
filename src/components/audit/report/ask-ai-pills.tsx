import { ArrowUpRight } from 'lucide-react';
import {
  askAiProviderLinks,
  type AskAiWidgetModel,
} from '@/lib/audit/ask-ai-widget';

function ChatGptIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.898 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.774-4.23 5.986 5.986 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.049zM13.26 22.3a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.368v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.787a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.784-2.782a.776.776 0 0 0-.785 0L9.409 9.229V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.055V6.074a4.499 4.499 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.004 2.25c-.42 0-.82.16-1.12.44L4.38 8.9a1.55 1.55 0 0 0-.04 2.2l6.5 6.68c.62.64 1.64.64 2.26 0l6.5-6.68a1.55 1.55 0 0 0-.04-2.2l-6.5-6.21a1.58 1.58 0 0 0-1.09-.44zm0 3.2 4.74 4.53-4.74 4.87-4.74-4.87z" />
      <path d="M4.2 14.35a1.1 1.1 0 0 0-.78 1.88l7.1 6.95c.8.78 2.08.78 2.88 0l7.1-6.95a1.1 1.1 0 0 0-.78-1.88H4.2z" />
    </svg>
  );
}

function PerplexityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M4.5 3.5h3.2v6.4L12 5.8l4.3 4.1V3.5h3.2v17h-3.2v-6.5L12 18.2l-4.3-4.2v6.5H4.5z" />
    </svg>
  );
}

function ProviderIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case 'chatgpt':
      return <ChatGptIcon className={className} />;
    case 'claude':
      return <ClaudeIcon className={className} />;
    case 'perplexity':
      return <PerplexityIcon className={className} />;
    default:
      return null;
  }
}

interface AskAiPillsProps {
  askAi: AskAiWidgetModel;
  question?: string;
  className?: string;
}

export function AskAiPills({ askAi, question, className = '' }: AskAiPillsProps) {
  const q = question ?? askAi.primaryQuestion;
  const links = askAiProviderLinks(q);

  return (
    <div className={className}>
      <p className="text-sm font-semibold text-zinc-950">Ask AI about {askAi.brand}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3.5 py-2 text-sm text-zinc-900 transition hover:bg-zinc-200"
          >
            <ProviderIcon id={link.id} className="h-4 w-4 shrink-0 text-zinc-800" />
            <span>{link.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  );
}
