'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ChevronDown,
  ClipboardList,
  FileSearch,
  GitBranch,
  Layers,
  Link2,
  MoreHorizontal,
  ScrollText,
  Settings2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const primaryPills = [
  { title: 'Overview', suffix: '', icon: Building2 },
  { title: 'Fix Queue', suffix: '/work-orders', icon: ClipboardList },
  { title: 'Lead Map', suffix: '/graph', icon: GitBranch },
  { title: 'Page Plays', suffix: '/systems', icon: Layers },
  { title: 'Presale Brief', suffix: '/report', icon: ScrollText },
  { title: 'Connect', suffix: '/connect', icon: Link2 },
] as const;

const moreLinks = [
  { title: 'Run', suffix: '/audit', icon: FileSearch },
  { title: 'Findings', suffix: '/findings' },
  { title: 'Architecture', suffix: '/architecture' },
  { title: 'Pricing', suffix: '/pricing' },
  { title: 'Settings', suffix: '/settings', icon: Settings2 },
] as const;

function getProjectId(pathname: string) {
  const match = pathname.match(/^\/operator\/projects\/([^/]+)/);
  if (!match || match[1] === 'new') return null;
  return match[1];
}

function isPillActive(pathname: string, projectId: string, suffix: string) {
  const href = `/operator/projects/${projectId}${suffix}`;
  if (suffix === '') return pathname === href;
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
              const href = `/operator/projects/${projectId}${pill.suffix}`;
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

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-white/70 hover:bg-white/8 hover:text-white"
                  />
                }
              >
                <MoreHorizontal className="size-3.5" />
                <span className="hidden sm:inline">More</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-44">
                {moreLinks.map((item) => (
                  <DropdownMenuItem
                    key={item.title}
                    render={
                      <Link href={`/operator/projects/${projectId}${item.suffix}`} prefetch />
                    }
                  >
                    {item.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        <Avatar size="sm" className="shrink-0 bg-white/10 text-white after:border-white/15">
          <AvatarFallback className="bg-transparent text-[10px] font-semibold text-white">
            NG
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
