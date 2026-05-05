import TopBar from "@/components/TopBar";
import CameraFeed from "@/components/CameraFeed";
import MissionInfo from "@/components/MissionInfo";
import ActivityFeed from "@/components/ActivityFeed";
import DroneStatus from "@/components/DroneStatus";
import Detection from "@/components/Detection";
import MissionMap from "@/components/MissionMap";
import QuickActions from "@/components/QuickActions";
import Sidebar from "@/components/Sidebar";
import LeafletMap, { LatLng } from "@/components/LeafletMap";
import rescueBg from "@/assets/rescue-bg.jpg";
import { useState, useEffect } from "react";
import socket from "@/socket";
import { Map, Camera } from "lucide-react";

const Controle = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // toggle: "camera" | "map"
  const [mainView, setMainView] = useState<"camera" | "map">("camera");

  // live drone/target positions for the full-screen map view
  const [dronePin, setDronePin] = useState<LatLng | null>(null);
  const [targetPin, setTargetPin] = useState<LatLng | null>(null);

  useEffect(() => {
    socket.on("dronePosition", (data) => {
      setDronePin({ lat: data.lat, lng: data.lng });
    });
    socket.on("missionUpdated", (data) => {
      if (data.targetArea) setTargetPin(data.targetArea);
    });
    return () => {
      socket.off("dronePosition");
      socket.off("missionUpdated");
    };
  }, []);

  return (
    <div className="min-h-screen flex relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage:` url(${rescueBg})` }}
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

            {/* Center: main view + bottom panels */}
            <div className="flex-1 flex flex-col gap-4">

              {/* ── MAIN VIEW: camera OR map ───────────────────────────── */}
              <div className="relative flex-1 min-h-[300px]">

                {/* Camera feed */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    mainView === "camera" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <CameraFeed />
                </div>

                {/* Full-screen map */}
                <div
                  className={`absolute inset-0 rounded-xl overflow-hidden border border-white/10 transition-opacity duration-300 ${
                    mainView === "map" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <LeafletMap
                    dronePin={dronePin}
                    targetPin={targetPin}
                    className="h-full w-full"
                    interactive
                  />
                  {/* map overlay labels */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    <span className="text-[10px] font-mono bg-black/60 text-green-400 px-2 py-1 rounded border border-green-400/20">
                      🚁 DRONE LIVE MAP
                    </span>
                    {dronePin && (
                      <span className="text-[9px] font-mono bg-black/50 text-white/70 px-2 py-1 rounded">
                        {dronePin.lat.toFixed(5)}°N · {dronePin.lng.toFixed(5)}°E
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle button — tap to switch */}
                <button
                  onClick={() => setMainView(mainView === "camera" ? "map" : "camera")}
                  className="absolute bottom-4 right-4 z-20 flex items-cente r gap-2 bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs font-mono px-3 py-2 rounded-lg backdrop-blur-sm transition"
                  title={mainView === "camera" ? "Switch to map" : "Switch to camera"}
                >
                  {mainView === "camera" ? (
                    <><Map className="h-3.5 w-3.5" /> View Map</>
                  ) : (
                    <><Camera className="h-3.5 w-3.5" /> View Camera</>
                  )}
                </button>

                {/* Clickable hint overlay shown only on camera view */}
                {mainView === "camera" && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setMainView("map")}
                    title="Click to switch to map"
                  />
                )}
                {/* Clickable hint overlay on map view */}
                {mainView === "map" && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    style={{ zIndex: 0 }}
                    onClick={() => setMainView("camera")}
                    title="Click to switch to camera"
                  />
                )}
              </div>

              {/* Bottom panels */}
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