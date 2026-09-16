'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function UserAccountMenu(_props: { initials?: string } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setOpen(false);
      router.push('/');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
        aria-label="Dashboard menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Dashboard
        <ChevronDown
          className={`size-3.5 text-zinc-500 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-lg"
        >
          <Link
            href="/account"
            role="menuitem"
            className="block px-3 py-2 text-sm text-zinc-800 transition hover:bg-zinc-50"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/account/billing"
            role="menuitem"
            className="block px-3 py-2 text-sm text-zinc-800 transition hover:bg-zinc-50"
            onClick={() => setOpen(false)}
          >
            Billing
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="block w-full px-3 py-2 text-left text-sm text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
