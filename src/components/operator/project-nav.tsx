'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', suffix: '' },
  { label: 'Connect', suffix: '/connect' },
  { label: 'Leads', suffix: '/leads' },
  { label: 'Audit', suffix: '/audit' },
  { label: 'Findings', suffix: '/findings' },
  { label: 'Architecture', suffix: '/architecture' },
  { label: 'Pricing', suffix: '/pricing' },
  { label: 'Report', suffix: '/report' },
  { label: 'Settings', suffix: '/settings' },
];

export function ProjectNav({ projectId }: { projectId: string; currentPath?: string }) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <nav className="inline-flex min-w-full gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {navItems.map((item) => {
          const href = `/operator/projects/${projectId}${item.suffix}`;
          const active =
            item.suffix === ''
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
