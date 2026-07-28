'use client';

import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

const SEGMENT_LABELS: Record<string, { title: string; description: string }> = {
  operator: { title: 'Dashboard', description: 'Operator cockpit' },
  projects: { title: 'Projects', description: 'Audit workspaces' },
  connect: { title: 'Connect', description: 'Google property mapping' },
  leads: { title: 'Leads', description: 'Channel attribution and funnel tracking' },
  audit: { title: 'Run', description: 'Kick off a brief' },
  findings: { title: 'Findings', description: 'Lead blocker queue' },
  architecture: { title: 'Architecture', description: 'Missing page gaps' },
  pricing: { title: 'Pricing', description: 'Offer recommendation' },
  report: { title: 'Presale Brief', description: 'Lead blockers and execution' },
  'work-orders': { title: 'Fix Queue', description: 'What to unblock first' },
  graph: { title: 'Lead Map', description: 'Commercial coverage for leads' },
  systems: { title: 'Page Plays', description: 'Scalable buyer conversation pages' },
  settings: { title: 'Settings', description: 'Intake and project notes' },
};

function headerFromPath(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'operator') {
    return { title: 'Site-OS', description: 'Internal audit operating system' };
  }
  if (parts.length === 1) return SEGMENT_LABELS.operator;
  if (parts[1] === 'projects' && parts.length === 2) return SEGMENT_LABELS.projects;
  if (parts[1] === 'projects' && parts[2]) {
    const section = parts[3] ?? '';
    if (!section) {
      return { title: 'Project hub', description: 'Fix lead blockers · Presale Brief · Connect' };
    }
    return SEGMENT_LABELS[section] ?? { title: 'Project', description: 'Site-OS' };
  }
  return { title: 'Site-OS', description: 'Operator Signal' };
}

export function SiteHeader({ actions }: { actions?: React.ReactNode }) {
  const pathname = usePathname();
  const { title, description } = headerFromPath(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/90 px-4 backdrop-blur supports-backdrop-filter:bg-background/75">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
