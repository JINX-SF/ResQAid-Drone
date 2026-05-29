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
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import socket from "@/socket";
import { Map, Camera, CheckCircle, Loader2 } from "lucide-react";
import API from "@/api";

const Controle = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mainView, setMainView] = useState<"camera" | "map">("camera");

  const [dronePin, setDronePin] = useState<LatLng | null>(null);
  const [targetPin, setTargetPin] = useState<LatLng | null>(null);

  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [activatingIds, setActivatingIds] = useState<Set<string>>(new Set());

  const location = useLocation();

  // Track which missions we have already auto-activated this session
  // so we don't fire duplicate PATCH requests on re-renders.
  const activatedRef = useRef<Set<string>>(new Set());

  // ─── socket ──────────────────────────────────────────────────────────────
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

  // ─── fetch missions on mount ─────────────────────────────────────────────
  useEffect(() => {
    const fetchAndActivate = async () => {
      try {
        const res = await API.get("/missions");
        const all: any[] = res.data.data || [];

        // We care about missions that have a drone and are either assigned or active
        const relevant = all.filter(
          (m) =>
            m.drone &&
            (m.status?.toLowerCase() === "active" ||
              m.status?.toLowerCase() === "assigned")
        );

        // ── AUTO-ACTIVATE all "assigned" missions ──
        // Fire PATCH /activate for every assigned mission that we haven't activated yet.
        const toActivate = relevant.filter(
          (m) =>
            m.status?.toLowerCase() === "assigned" &&
            !activatedRef.current.has(m._id)
        );

        if (toActivate.length > 0) {
          setActivatingIds(new Set(toActivate.map((m) => m._id)));

          const activatedResults = await Promise.all(
            toActivate.map(async (m) => {
              try {
                activatedRef.current.add(m._id);
                const r = await API.patch(`/missions/${m._id}/activate`);
                return r.data.data; // updated mission from server
              } catch (err) {
                console.error(`Failed to activate mission ${m._id}:`, err);
                activatedRef.current.delete(m._id); // allow retry on next load
                return m; // fall back to original
              }
            })
          );

          setActivatingIds(new Set());

          // Merge activated results back into relevant list
          const activatedMap: Record<string, any> = {};
          activatedResults.forEach((m: any) => { activatedMap[m._id] = m; });
          const merged = relevant.map((m) => activatedMap[m._id] || m);

          setMissions(merged);
          selectInitialMission(merged);
        } else {
          setMissions(relevant);
          selectInitialMission(relevant);
        }
      } catch (error) {
        console.error("Failed to fetch missions:", error);
      }
    };

    fetchAndActivate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectInitialMission = (list: any[]) => {
    if (list.length === 0) {
      setSelectedMission(null);
      return;
    }
    const params = new URLSearchParams(location.search);
    const missionId = params.get("missionId");
    if (missionId) {
      const target = list.find((m) => m._id === missionId);
      setSelectedMission(target || list[0]);
    } else {
      setSelectedMission(list[0]);
    }
  };

  // ─── Resume Mission (complete) ────────────────────────────────────────────
  // Clicking "Resume Mission" marks the mission as completed and sets the
  // drone back to idle.
  const handleResumeMission = async (missionId: string) => {
    try {
      setResumingId(missionId);
      await API.patch(`/missions/${missionId}/complete`);

      // Remove from the list
      setMissions((prev) => prev.filter((m) => m._id !== missionId));
      if (selectedMission?._id === missionId) {
        setSelectedMission(null);
      }
    } catch (error) {
      console.error("Failed to complete mission:", error);
      alert("Could not complete the mission. Please try again.");
    } finally {
      setResumingId(null);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Background */}
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

          {/* ── Mission Cards ──────────────────────────────────────────────── */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {missions.length === 0 && (
              <div className="text-white/40 text-sm py-4 px-2">
                No active missions at the moment.
              </div>
            )}

            {missions.map((mission) => {
              const isActivating = activatingIds.has(mission._id);
              const isResuming = resumingId === mission._id;
              const isSelected = selectedMission?._id === mission._id;

              return (
                <div
                  key={mission._id}
                  onClick={() => setSelectedMission(mission)}
                  className={`min-w-[240px] rounded-2xl px-5 py-4 text-left transition-all border backdrop-blur-xl cursor-pointer select-none
                    ${
                      isSelected
                        ? "bg-emerald-500/30 border-emerald-400"
                        : "bg-black/30 border-white/10 hover:border-emerald-300/30"
                    }`}
                >
                  {/* Title + activating indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-lg font-bold text-white truncate">
                      {mission.title || mission.type}
                    </div>
                    {isActivating && (
                      <Loader2 className="h-4 w-4 text-yellow-300 animate-spin shrink-0" />
                    )}
                  </div>

                  <div className="text-sm text-white/60">{mission.type}</div>

                  {/* Status badge */}
                  <div className="mt-1.5">
                    {mission.status?.toLowerCase() === "active" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-blue-500/25 text-blue-200 border border-blue-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                        {isActivating ? "Activating…" : "Assigned"}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-emerald-300">
                    Drone: {mission.drone?.name || "None"}
                  </div>

                  {/* ── RESUME MISSION BUTTON ─────────────────────────── */}
                  {/* Visible when the mission is active (drone is in_mission).
                      Clicking it completes the mission and returns drone to idle. */}
                  {mission.status?.toLowerCase() === "active" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumeMission(mission._id);
                      }}
                      disabled={isResuming}
                      className="mt-3 w-full rounded-xl bg-emerald-500/80 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 transition-all flex items-center justify-center gap-1.5"
                    >
                      {isResuming ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Completing…
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Resume Mission
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Main layout ────────────────────────────────────────────────── */}
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Center */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Main view: camera or map */}
              <div className="relative flex-1 min-h-[300px]">
                {/* Camera */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    mainView === "camera"
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <CameraFeed />
                </div>

                {/* Map */}
                <div
                  className={`absolute inset-0 rounded-xl overflow-hidden border border-white/10 transition-opacity duration-300 ${
                    mainView === "map"
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <LeafletMap
                    dronePin={dronePin}
                    targetPin={targetPin}
                    className="h-full w-full"
                    interactive
                  />
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

                {/* Toggle button */}
                <button
                  onClick={() =>
                    setMainView(mainView === "camera" ? "map" : "camera")
                  }
                  className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs font-mono px-3 py-2 rounded-lg backdrop-blur-sm transition"
                  title={mainView === "camera" ? "Switch to map" : "Switch to camera"}
                >
                  {mainView === "camera" ? (
                    <>
                      <Map className="h-3.5 w-3.5" /> View Map
                    </>
                  ) : (
                    <>
                      <Camera className="h-3.5 w-3.5" /> View Camera
                    </>
                  )}
                </button>

                {mainView === "camera" && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setMainView("map")}
                    title="Click to switch to map"
                  />
                )}
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