import { Plane , CheckSquare,LayoutDashboard,PanelsTopLeft ,Blocks ,Gauge ,Grid3x3 , Users, Sliders, Target, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import drone from "@/assets/drone.png"
import Drone from "@/components/DroneIcon"
import { Link } from "react-router-dom";

const navItems = [
  { icon: Drone, label: "Drone" ,link:"/dronespage"},
  { icon: CheckSquare, label: "Requests" ,link:"/requestpage"},
  { icon: Users, label: "Users" ,link:"/userspage"},
  { icon: Sliders, label: "Control panel" ,link:"/controle"},
  { icon: LayoutDashboard  , label: "Dashboard",link:"/dashboard" },
  { icon: Target, label: "Missions" ,link:""},
  { icon: Settings, label: "Settings",link:"" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <aside
      className={cn(

        "bg-card/20 backdrop-blur-md h-screen sticky top-0 p-4 flex flex-col gap-2 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-48"
      )}
    >
      <div className={cn("mb-6", collapsed && "items-center flex flex-col")}>
        {!collapsed && (
          <>
            <h1 className="text-2xl font-bold text-primary">ResQAid</h1>
            <span className="text-sm text-muted-foreground">Admin Panel</span>
          </>
        )}
        {collapsed && <span className="text-lg font-bold text-primary">R</span>}
      </div>

      <nav className="flex flex-col  gap-1 flex-1">
        {navItems.map((item) => (
          <Link to={item.link}>  
          <button
            key={item.label}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-accent hover:text-white transition-colors text-left",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && item.label}
          </button>
          </Link>
        ))}

      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center p-2 rounded-lg hover:bg-accent text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
