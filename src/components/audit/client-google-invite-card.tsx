'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { DEFAULT_OPERATOR_EMAIL } from '@/lib/google/operator-email';

/**
 * Copyable instructions for clients to grant the agency Google account access.
 */
export function ClientGoogleInviteCard({
  operatorEmail,
  className,
}: {
  operatorEmail?: string | null;
  className?: string;
}) {
  const email = (operatorEmail?.trim() || DEFAULT_OPERATOR_EMAIL).trim();
  const [copied, setCopied] = useState(false);

  const blurb = [
    `Please add ${email} to this property:`,
    '',
    '• Google Search Console → Settings → Users and permissions → Add user (Full)',
    '• GA4 → Admin → Property access management → Add users (Viewer)',
    '• Google Ads → Access and security → Add email (or under your MCC)',
    '',
    "Reply when done — we'll pick it up automatically.",
  ].join('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(blurb);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      className={
        className ??
        'rounded-[14px] border border-zinc-200/80 bg-white px-4 py-4 shadow-sm'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-950">Client access instructions</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Paste this to any client so they can grant{' '}
            <span className="font-medium text-zinc-800">{email}</span> access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          {copied ? <Check className="size-3.5" strokeWidth={2} /> : <Copy className="size-3.5" strokeWidth={2} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-3 text-xs leading-5 text-zinc-700">
        {blurb}
      </pre>
    </section>
  );
}
