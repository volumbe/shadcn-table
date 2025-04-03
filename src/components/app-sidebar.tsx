"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      id: "chase-quinstreet",
      name: "Chase",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      id: "chase-rvmn",
      name: "Chase",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      id: "chase-nerdwallet",
      name: "Evil",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Watchtower",
      url: "/watchtower",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Issues",
          url: "/issues",
        },
        {
          title: "Scans",
          url: "/scans",
        },
        {
          title: "Partners",
          url: "/partners",
        },
        {
          title: "Contents",
          url: "/contents",
        },
      ],
    },
    {
      title: "Knowledge",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Products",
          url: "/products",
        },
        {
          title: "Guidelines",
          url: "/guidelines",
        }
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ children, ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
