'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const PLAN_BADGE: Record<'free' | 'paid', string> = {
  free: 'bg-white/8 text-white/60 hover:bg-white/14',
  paid: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25',
};

/** Click-to-toggle plan badge for admins — a manual override for deals closed
 *  outside Paddle or while a webhook delivery is still retrying. */
export function PlanToggle({ projectId, plan }: { projectId: string; plan: 'free' | 'paid' | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!plan || pending) return;
    const nextPlan = plan === 'paid' ? 'free' : 'paid';
    setPending(true);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: nextPlan }),
      });
      if (response.ok) {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  if (!plan) {
    return (
      <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-white/45">
        unclaimed
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title="Click to toggle plan (manual override)"
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize transition disabled:opacity-50',
        PLAN_BADGE[plan]
      )}
    >
      {plan}
    </button>
  );
}
