'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Link2,
  ScrollText,
} from 'lucide-react';
import { SITE_NAV_LINKS } from '@/components/audit/site-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OperatorSignOut } from '@/components/operator/operator-sign-out';
import { cn } from '@/lib/utils';

const primaryPills = [
  { title: 'Dashboard', suffix: '/workflow', icon: Building2 },
  { title: 'Brief', suffix: '/brief', icon: ScrollText },
  { title: 'Setup', suffix: '/connect', icon: Link2 },
] as const;

function getProjectId(pathname: string) {
  const auditMatch = pathname.match(/^\/audit\/([^/]+)/);
  if (auditMatch) return auditMatch[1];
  const match = pathname.match(/^\/operator\/projects\/([^/]+)/);
  if (!match || match[1] === 'new') return null;
  return match[1];
}

function isPillActive(pathname: string, projectId: string, suffix: string) {
  const href = `/audit/${projectId}${suffix}`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OperatorTopbar() {
  const pathname = usePathname();
  const projectId = getProjectId(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 md:px-6">
        <Link href="/operator" prefetch className="flex shrink-0 items-center gap-2.5 text-foreground">
          <span className="flex size-7 items-center justify-center rounded-full bg-foreground/10 text-[11px] font-semibold tracking-wide">
            SO
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">Site-OS</span>
        </Link>

        {projectId ? (
          <nav
            aria-label="Project"
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto"
          >
            {primaryPills.map((pill) => {
              const href = `/audit/${projectId}${pill.suffix}`;
              const active = isPillActive(pathname, projectId, pill.suffix);
              return (
                <Link
                  key={pill.title}
                  href={href}
                  prefetch
                  className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-foreground text-background'
                      : 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                  )}
                >
                  <pill.icon className="size-3.5 opacity-80" />
                  <span className="hidden md:inline">{pill.title}</span>
                  <span className="md:hidden">{pill.title.split('')[0]}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav
            aria-label="Primary"
            className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex"
          >
            {SITE_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/app"
            className="hidden rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground sm:inline-flex"
          >
            Your sites
          </Link>
          <Avatar size="sm" className="shrink-0 bg-foreground/10 text-foreground after:border-border">
            <AvatarFallback className="bg-transparent text-[10px] font-semibold text-foreground">
              NG
            </AvatarFallback>
          </Avatar>
          <OperatorSignOut />
        </div>
      </div>
    </header>
  );
}
