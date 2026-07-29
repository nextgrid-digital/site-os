'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', suffix: '' },
  { label: 'Report', suffix: '/report' },
  { label: 'Intake', suffix: '/settings' },
  { label: 'Connect', suffix: '/connect' },
];

export function ProjectNav({ projectId }: { projectId: string; currentPath?: string }) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <nav className="inline-flex min-w-full gap-1 rounded-xl bg-white/4 p-1">
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
                'rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                active
                  ? 'bg-white text-black'
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
