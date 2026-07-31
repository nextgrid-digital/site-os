'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function RunAuditButton({
  projectId,
  fullBriefUnlocked = false,
  /** When set, shows a single button that re-runs this audit type. */
  rerunType,
  size = 'default',
  className,
  reportHref,
}: {
  projectId: string;
  fullBriefUnlocked?: boolean;
  rerunType?: 'mini' | 'full';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  className?: string;
  /** Where to navigate after a successful run. */
  reportHref?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const afterRunHref = reportHref ?? `/audit/${projectId}/growth`;

  async function runAudit(runType: 'mini' | 'full') {
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/projects/${projectId}/run-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runType }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Audit failed.');
      return;
    }

    router.push(afterRunHref);
    router.refresh();
  }

  if (rerunType) {
    const effectiveType =
      rerunType === 'full' && !fullBriefUnlocked ? 'mini' : rerunType;

    return (
      <div className={className ?? 'flex flex-wrap items-center gap-2'}>
        <Button size={size} onClick={() => runAudit(effectiveType)} disabled={loading}>
          {loading ? 'Running…' : 'Rerun audit'}
        </Button>
        {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={className ?? 'flex flex-wrap items-center gap-2'}>
      <Button size={size} onClick={() => runAudit('mini')} disabled={loading}>
        {loading ? 'Running…' : 'Run site audit'}
      </Button>
      {fullBriefUnlocked ? (
        <Button
          size={size}
          variant="outline"
          onClick={() => runAudit('full')}
          disabled={loading}
        >
          Run full audit
        </Button>
      ) : null}
      {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
