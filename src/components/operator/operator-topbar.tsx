'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Link2,
  ScrollText,
  Settings2,
} from 'lucide-react';
import { SITE_NAV_LINKS } from '@/components/audit/site-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const primaryPills = [
  { title: 'Overview', suffix: '/overview', icon: Building2 },
  { title: 'Evidence', suffix: '', icon: ScrollText },
  { title: 'Intake', suffix: '/intake', icon: Settings2 },
  { title: 'Connect', suffix: '/connect', icon: Link2 },
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
  if (suffix === '') return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OperatorTopbar() {
  const pathname = usePathname();
  const projectId = getProjectId(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0a0a0b]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 md:px-6">
        <Link href="/operator" prefetch className="flex shrink-0 items-center gap-2.5 text-white">
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold tracking-wide">
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
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  )}
                >
                  <pill.icon className="size-3.5 opacity-80" />
                  <span className="hidden md:inline">{pill.title}</span>
                  <span className="md:hidden">{pill.title.split(' ')[0]}</span>
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
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/#audit"
            className="hidden rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white sm:inline-flex"
          >
            New audit
          </Link>
          <Avatar size="sm" className="shrink-0 bg-white/10 text-white after:border-white/15">
            <AvatarFallback className="bg-transparent text-[10px] font-semibold text-white">
              NG
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
