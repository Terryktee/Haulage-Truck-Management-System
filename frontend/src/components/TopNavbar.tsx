import { Bell, Search, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-topbar px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trucks, drivers, jobs..."
            className="bg-transparent text-sm outline-none w-64 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] bg-status-transit text-primary-foreground border-0">
            3
          </Badge>
        </button>

        <div className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">John Doe</p>
            <p className="text-[11px] text-muted-foreground">Fleet Manager</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
