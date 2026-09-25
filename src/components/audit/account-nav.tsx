'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Account information', href: '/account' },
  { label: 'Password', href: '/account/password' },
  { label: 'Billing', href: '/account/billing' },
] as const;

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setSignOutError(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Sign out failed.');
      router.push('/');
      router.refresh();
    } catch {
      setSignOutError('Sign out failed — please try again.');
    }
  }

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-lg px-3 py-2 text-sm transition',
              isActive
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={() => void handleSignOut()}
        className="mt-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        Sign out
      </button>
      {signOutError ? <p className="px-3 text-xs text-red-600">{signOutError}</p> : null}
    </nav>
  );
}
