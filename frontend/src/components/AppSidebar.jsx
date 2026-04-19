import { LayoutDashboard, Truck, Users, Package, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Trucks", url: "/trucks", icon: Truck },
  { title: "Drivers", url: "/drivers", icon: Users },
  { title: "Jobs", url: "/jobs", icon: Package },
];

const settingsItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold tracking-tight text-sidebar-primary-foreground">
                HaulTrack
              </h2>
              <p className="text-[11px] text-sidebar-foreground/60">
                Fleet Management
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="
                        flex w-full items-center gap-3 rounded-md px-3 py-2
                        text-sidebar-foreground transition-colors
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                      "
                      activeClassName="
                        bg-sidebar-primary/15 text-sidebar-primary font-medium
                      "
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">
            System
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      className="
                        flex w-full items-center gap-3 rounded-md px-3 py-2
                        text-sidebar-foreground transition-colors
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                      "
                      activeClassName="
                        bg-sidebar-primary/15 text-sidebar-primary font-medium
                      "
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}