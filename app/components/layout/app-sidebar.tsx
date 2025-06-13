import * as React from 'react'
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ListIcon,
  SettingsIcon,
  Utensils,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { NavDocuments } from '@/components/layout/nav-documents'
import { NavMain } from '@/components/layout/nav-main'
import { NavSecondary } from '@/components/layout/nav-secondary'
import { NavUser } from '@/components/layout/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Menu Management',
      url: '/admin/menu',
      icon: Utensils,
    },
    {
      title: 'Availability',
      url: '/admin/availability',
      icon: ClockIcon,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: CameraIcon,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: FileTextIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: FileCodeIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/admin',
      icon: SettingsIcon,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: DatabaseIcon,
    },
    {
      name: 'Reports',
      url: '#',
      icon: ClipboardListIcon,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="top-[var(--header-height)] h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-3"
            >
              <Link to="/admin">
                <div className="flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground size-10 min-w-10">
                  <span className="text-3xl">🥯</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-semibold text-base">
                    Sydney's Sourdough Co.
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
