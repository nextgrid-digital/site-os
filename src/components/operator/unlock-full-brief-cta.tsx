'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { shouldShowReportNextStep } from '@/lib/reports/report-next-step';

export function UnlockFullBriefCta({
  projectId,
  projectName,
  alreadyUnlocked,
  executionPrompt,
  gscConnected = false,
  ga4Connected = false,
  isTeaser = false,
}: {
  projectId: string;
  projectName: string;
  alreadyUnlocked: boolean;
  executionPrompt?: string | null;
  gscConnected?: boolean;
  ga4Connected?: boolean;
  isTeaser?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectHref = `/operator/projects/${projectId}/connect`;
  const reviewMailto = `mailto:nextgrid.digital@gmail.com?subject=${encodeURIComponent(
    `NextGrid review request — ${projectName}`
  )}`;

  const bothConnected = gscConnected && ga4Connected;
  const showConnectFraming = !bothConnected;

  if (!shouldShowReportNextStep({ gscConnected, ga4Connected, isTeaser })) {
    return null;
  }

  async function ensureUnlockedThen(path: string) {
    if (alreadyUnlocked) {
      router.push(path);
      return;
    }
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/projects/${projectId}/unlock-full-brief`, {
      method: 'POST',
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? 'Could not open data connections.');
      return;
    }
    router.push(path);
    router.refresh();
  }

  async function copyPrompt() {
    if (!executionPrompt) {
      document.getElementById('agent-prompts')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    try {
      await navigator.clipboard.writeText(executionPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the execution prompt.');
    }
  }

  const title = showConnectFraming
    ? 'Unlock stronger lead diagnosis'
    : 'Fix the first lead blocker';
  const body = showConnectFraming
    ? 'Connect Search Console and GA4 for a stronger presale readiness read — or copy the execution prompt and unblock the first lead path now.'
    : 'Data sources are connected. Copy the execution prompt to fix the first lead blocker, or request a NextGrid review.';

  return (
    <section className="rounded-2xl border border-white/12 bg-white/5 p-5">
      <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">Next step</p>
      <h2 className="font-display mt-2 text-xl text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-white/55">{body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {showConnectFraming && !gscConnected ? (
          <Button onClick={() => ensureUnlockedThen(connectHref)} disabled={loading}>
            {loading ? 'Opening…' : 'Connect Search Console'}
          </Button>
        ) : null}
        {showConnectFraming && !ga4Connected ? (
          <Button
            variant="outline"
            onClick={() => ensureUnlockedThen(connectHref)}
            disabled={loading}
          >
            {loading ? 'Opening…' : 'Connect GA4'}
          </Button>
        ) : null}
        <Button variant={showConnectFraming ? 'outline' : 'default'} onClick={copyPrompt}>
          {copied ? 'Copied' : 'Copy Execution Prompt'}
        </Button>
        <Button variant="ghost" render={<a href={reviewMailto} />}>
          Request NextGrid Review
        </Button>
        {isTeaser ? (
          <Button
            variant="ghost"
            render={<Link href={`/operator/projects/${projectId}/audit`} />}
          >
            Run full audit
          </Button>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
