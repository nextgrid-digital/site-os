'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function UserAccountMenu(_props: { initials?: string } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Sign out failed.');
      setOpen(false);
      router.push('/');
      router.refresh();
    } catch {
      setSignOutError('Sign out failed — please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 pointer-coarse:h-11 items-center gap-1.5 rounded-lg bg-raised px-2.5 text-sm font-medium text-foreground/90 shadow-sm transition hover:bg-muted"
        aria-label="Dashboard menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Dashboard
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl bg-raised py-1 shadow-lg"
        >
          <Link
            href="/app"
            role="menuitem"
            className="block px-3 py-2 text-sm text-foreground/90 transition hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/account"
            role="menuitem"
            className="block px-3 py-2 text-sm text-foreground/90 transition hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/account/billing"
            role="menuitem"
            className="block px-3 py-2 text-sm text-foreground/90 transition hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Billing
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="block w-full px-3 py-2 text-left text-sm text-foreground/90 transition hover:bg-muted disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {signOutError ? (
            <p className="px-3 pb-2 text-xs text-danger-ink">{signOutError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
