import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCards from "@/components/dashboard/StatsCards";
import DroneOverview from "@/components/dashboard/DroneOverview";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import EmergencyRequests from "@/components/dashboard/EmergencyRequests";
import { Plus } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div
  className="flex h-screen overflow-hidden bg-cover bg-center"
  style={{ backgroundImage: `url(${rescueBg})` }}
>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">Dashboard</h1>
            <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add drone
            </button>
          </div>
          <StatsCards />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <DroneOverview />
            </div>
            <ActivityFeed />
          </div>
          <div>
            <EmergencyRequests />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
