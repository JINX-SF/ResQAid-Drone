import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import CameraFeed from "@/components/CameraFeed";
import MissionInfo from "@/components/MissionInfo";
import ActivityFeed from "@/components/ActivityFeed";
import DroneStatus from "@/components/DroneStatus";
import Detection from "@/components/Detection";
import MissionMap from "@/components/MissionMap";
import QuickActions from "@/components/QuickActions";
import rescueBg from "@/assets/rescue-bg.jpg";
import { useState } from "react";

const Controle = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen flex relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${rescueBg})` }}
      />
      <div className="fixed inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex w-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
          <TopBar />
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Center: camera + bottom panels */}
            <div className="flex-1 flex flex-col gap-4">
              <CameraFeed />
              <div className="grid grid-cols-3 gap-4">
                <DroneStatus />
                <Detection />
                <MissionMap />
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-64 flex flex-col gap-4 shrink-0">
              <MissionInfo />
              <ActivityFeed />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Controle;