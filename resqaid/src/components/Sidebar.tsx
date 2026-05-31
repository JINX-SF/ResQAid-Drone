import { Plane, CheckSquare, LayoutDashboard, PanelsTopLeft, Blocks, Gauge, Grid3x3, Users, Sliders, Target, Settings, ChevronLeft, ChevronRight, Ban, Siren, User } from "lucide-react";
import { cn } from "@/lib/utils";
import drone from "@/assets/drone.png"
import Drone from "@/components/DroneIcon"
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  // Safe JSON parsing + role normalization to lowercase
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const userRole = user?.role ? user.role.toLowerCase() : "user";

  const navItems = userRole === "admin"
    ? [
        { icon: Siren, label: "Emergency Requests", link: "/EmergencyRequestsPage" }, 
        { icon: Drone, label: "Drone", link: "/dronespage", type: "drone" },
        { icon: Users, label: "Users", link: "/userspage" },
        { icon: Sliders, label: "Control panel", link: "/controle" },
        { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
        { icon: Target, label: "Missions", link: "/missionsPage", type: "mission" },
        // 🌟 PLACED LAST: Admin Profile Link
        { icon: User, label: "Profile", link: "/profile" },
      ]
    : [
        { icon: Siren, label: "Emergency Request", link: "/request-assistance" },
        { icon: CheckSquare, label: "Requests Log", link: "/requestpage" },
        // Added user missions item utilizing the identical 'Target' icon
        { icon: Target, label: "Missions", link: "/usersmission" },
        // 🌟 PLACED LAST: Regular User Profile Link
        { icon: User, label: "Profile", link: "/profile" },
      ];

  return (
    <aside
      className={cn(
        "bg-card/20 backdrop-blur-md h-screen sticky top-0 p-5 flex flex-col gap-5 transition-all duration-300 shrink-0 border-r border-white/10",
        collapsed ? "w-24" : "w-72" 
      )}
    >
      <div className={cn("mb-8", collapsed && "items-center flex flex-col")}>
        {!collapsed && (
          <>
            <h1 className="text-3xl font-black text-primary tracking-wide">ResQAid</h1>
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mt-1.5">
              {userRole === "admin" ? "Admin Panel" : "User Portal"}
            </span>
          </>
        )}
        {collapsed && <span className="text-2xl font-black text-primary">R</span>}
      </div>

      <nav className="flex flex-col gap-4 flex-1 w-full">
        {navItems.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex flex-col gap-2 w-full">
            <Link to={item.link} className="w-full">
              <button
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-black text-black/90 hover:bg-accent hover:text-white transition-all text-left duration-200 active:scale-95",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 object-contain text-black/90 [&_svg]:w-6 [&_svg]:h-6 [&_img]:w-6 [&_img]:h-6">
                  <item.icon className="w-6 h-6" stroke="currentColor" />
                </div>
                {!collapsed && <span>{item.label}</span>}
              </button>
            </Link>

            {/* Sub-buttons for Drones */}
            {!collapsed && item.type === "drone" && (
              <Link to="/disabled/drones" className="w-full pl-8">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-bold text-red-800 hover:bg-red-500/10 transition-colors text-left">
                  <Ban className="w-5 h-5 shrink-0 text-red-800" />
                  <span>Disabled Drones</span>
                </button>
              </Link>
            )}

            {/* Sub-buttons for Missions */}
            {!collapsed && item.type === "mission" && (
              <Link to="/disabled/missions" className="w-full pl-8">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-black text-red-800 hover:bg-white/5 transition-all text-left">
                  <Ban className="w-5 h-5 shrink-0 text-red-800" />
                  <span>Disabled Missions</span>
                </button>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center p-4 rounded-2xl bg-accent/10 hover:bg-accent text-black hover:text-white transition-all duration-200"
      >
        {collapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
      </button>
    </aside>
  );
};

export default Sidebar;