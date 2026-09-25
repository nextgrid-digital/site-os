'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

/** Admin sign-out for the operator shell — /operator is now auth-gated, so
 *  admins need a visible way to leave it, mirroring the client-facing menus. */
export function OperatorSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Sign out failed.');
      router.push('/');
      router.refresh();
    } catch {
      setError('Sign out failed — try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        title="Sign out"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/8 hover:text-white disabled:opacity-50"
      >
        <LogOut className="size-3.5" strokeWidth={2} />
      </button>
      {error ? <p className="text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}
