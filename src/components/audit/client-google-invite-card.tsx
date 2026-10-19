'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const copyText = [
  'Please accept the Google Ads invitation we sent to your account:',
  '',
  '• Google Ads → Access and security → Managers → Accept',
  '',
  'Search Console and GA4: click "Connect Google" on your Site-OS dashboard and sign in with your Google account.',
].join('\n');

/**
 * Instructions for the client. Google Ads is an invite from our MCC, which the client accepts once.
 * Search Console and GA4 come from the client's own Google sign-in.
 */
export function ClientGoogleInviteCard({
  audience = 'admin',
  className,
}: {
  /** 'client' when a paid customer views this, 'admin' when an operator copies it to send. */
  audience?: 'admin' | 'client';
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      className={
        className ?? 'rounded-[14px] border border-zinc-200/80 bg-white px-4 py-4 shadow-sm'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-950">
            {audience === 'client' ? 'Accept your Google Ads invitation' : 'Client instructions'}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {audience === 'client'
              ? 'Accept the invitation we sent to your Google Ads account. It takes one click.'
              : 'Paste this to any client. Google Ads needs one click on their side.'}
          </p>
        </div>
        {audience === 'admin' ? (
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            {copied ? <Check className="size-3.5" strokeWidth={2} /> : <Copy className="size-3.5" strokeWidth={2} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        ) : null}
      </div>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-3 text-xs leading-5 text-zinc-700">
        {copyText}
      </pre>
    </section>
  );
}
