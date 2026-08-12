'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', suffix: '/workflow' },
  { label: 'Brief', suffix: '/brief' },
  { label: 'Work', suffix: '/work' },
  { label: 'Leads', suffix: '/leads' },
  { label: 'Monthly', suffix: '/monthly' },
  { label: 'Setup', suffix: '/connect' },
];

export function ProjectNav({ projectId }: { projectId: string; currentPath?: string }) {
  const pathname = usePathname();
  const base = `/audit/${projectId}`;

  return (
    <div className="overflow-x-auto">
      <nav className="inline-flex min-w-full gap-1 rounded-xl bg-white/4 p-1" aria-label="Project workspace">
        {navItems.map((item) => {
          const href = `${base}${item.suffix}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.label}
              href={href}
              className={cn('rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
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
