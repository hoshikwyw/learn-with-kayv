"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { Brand } from "@/components/brand/brand";
import { ROLE_LABEL } from "@/config/site";
import { NAV_BY_ROLE } from "./nav-config";
import type { Profile } from "@/types/db";
import { UserMenu } from "./user-menu";

export function AppSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const groups = NAV_BY_ROLE[profile.role];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <Brand
          href={null}
          variant="boxed"
          className="px-2 py-1.5"
          subtitle={ROLE_LABEL[profile.role]}
        />
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== `/${profile.role}` &&
                      pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <UserMenu profile={profile} />
      </SidebarFooter>
    </Sidebar>
  );
}
