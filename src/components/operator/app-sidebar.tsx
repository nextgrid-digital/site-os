'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Building2,
  FileSearch,
  FolderKanban,
  LayoutDashboard,
  Link2,
  ScrollText,
  Wallet,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const mainNav = [
  { title: 'Dashboard', href: '/operator', icon: LayoutDashboard },
  { title: 'Projects', href: '/operator/projects', icon: FolderKanban },
];

const primaryProjectNav = [
  { title: 'Dashboard', suffix: '/workflow', icon: Building2 },
  { title: 'Brief', suffix: '/brief', icon: ScrollText },
  { title: 'Work', suffix: '/work', icon: FileSearch },
  { title: 'Leads', suffix: '/leads', icon: Wallet },
  { title: 'Monthly', suffix: '/monthly', icon: Activity },
  { title: 'Setup', suffix: '/connect', icon: Link2 },
];

function getProjectId(pathname: string) {
  const auditMatch = pathname.match(/^\/audit\/([^/]+)/);
  if (auditMatch) return auditMatch[1];
  const match = pathname.match(/^\/operator\/projects\/([^/]+)/);
  if (!match || match[1] === 'new') return null;
  return match[1];
}

function NavItems({
  items,
  projectId,
  pathname,
}: {
  items: typeof primaryProjectNav;
  projectId: string;
  pathname: string;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const href = `/audit/${projectId}${item.suffix}`;
        const active =
          item.suffix === ''
            ? pathname === href || pathname === `${href}/`
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={active} tooltip={item.title} render={<Link href={href} />}>
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const projectId = getProjectId(pathname);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/operator" />} tooltip="Site-OS">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <Activity className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight">Site-OS</span>
                <span className="truncate text-xs text-muted-foreground">Operator Signal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active =
                  item.href === '/operator'
                    ? pathname === '/operator'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {projectId ? (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Current project</SidebarGroupLabel>
              <SidebarGroupContent>
                <NavItems items={primaryProjectNav} projectId={projectId} pathname={pathname} />
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Operator">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/15 text-xs text-primary">
                  NG
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Site-OS</span>
                <span className="truncate text-xs text-muted-foreground">Operator</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
