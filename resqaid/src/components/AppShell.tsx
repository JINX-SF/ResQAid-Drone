import {
  CheckSquare,
  Users,
  Sliders,
  Compass,
  Settings,
  Bell,
  User,
  ChevronRight,
} from "lucide-react";
import bg from "@/assets/rescue-bg.jpg";
import DroneIcon from "../components/DroneIcon";
import Sidebar from "./Sidebar";
import { useState } from "react";

const navItems = [
  { label: "Navigation", to: "/request" },
  { label: "Lasports", to: "/emergency-requests" },
  { label: "Drones", to: "/drones" },
  { label: "Ranitop", to: "/users" },
];

const sideNav = [
  { Icon: DroneIcon, to: "/request" },
  { Icon: CheckSquare, to: "/emergency-requests" },
  { Icon: Users, to: "/users" },
  { Icon: Sliders, to: "/drones" },
  { Icon: Compass, to: "/confirmation" },
  { Icon: Settings, to: "/request" },
];

export function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat text-foreground"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-background/70" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 px-6 py-5">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-wide text-foreground">ResQAid</h1>
              <nav className="flex items-center gap-6">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="text-muted-foreground hover:text-destructive"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/30 text-warning"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}