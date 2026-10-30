'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  CreditCard,
  Globe,
  LayoutGrid,
  Loader2,
  LogOut,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

const ITEM_CLASS =
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition hover:bg-foreground/8 focus-visible:bg-foreground/8 focus-visible:outline-none disabled:opacity-50';

interface MenuLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function UserAccountMenu({ initials = 'SO' }: { initials?: string } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const auditId = /^\/audit\/([^/]+)/.exec(pathname)?.[1];
  const primary: MenuLink[] = [
    { href: '/app', label: 'Projects', icon: LayoutGrid },
    ...(auditId
      ? [{ href: `/audit/${auditId}`, label: 'Site audit', icon: Globe }]
      : []),
  ];
  const secondary: MenuLink[] = [
    { href: '/account', label: 'Account', icon: UserRound },
    { href: '/account/billing', label: 'Billing', icon: CreditCard },
  ];
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

  function renderLink({ href, label, icon: Icon }: MenuLink) {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        role="menuitem"
        aria-current={active ? 'page' : undefined}
        className={`${ITEM_CLASS} text-foreground/90 ${active ? 'bg-foreground/8' : ''}`}
        onClick={() => setOpen(false)}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 pointer-coarse:h-11 items-center gap-1.5 rounded-full bg-raised py-1 pr-2 pl-1 text-foreground/90 shadow-sm transition hover:bg-foreground/8"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
          {initials}
        </span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 w-44 rounded-lg bg-raised p-1 shadow-lg"
        >
          {primary.map(renderLink)}
          <div role="separator" className="my-1 h-px bg-foreground/10" />
          {secondary.map(renderLink)}
          <div role="separator" className="my-1 h-px bg-foreground/10" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className={`${ITEM_CLASS} text-danger-ink hover:bg-danger-ink/10`}
          >
            {signingOut ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4 shrink-0" aria-hidden />
            )}
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {signOutError ? (
            <p className="px-2.5 pt-1 pb-1 text-xs text-danger-ink">{signOutError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
