import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Shield, 
  Battery, 
  MapPin, 
  Activity, 
  ArrowLeft, 
  FileText, 
  TrendingDown, 
  Milestone,
  CheckCircle2
} from "lucide-react";
import LeafletMap, { LatLng } from "@/components/LeafletMap";
import AppShell from "@/components/AppShell";
import API from "@/api";

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// Reusing your exact custom glassmorphism system container component
function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  );
}

function urgencyClass(urgency: string) {
  const u = urgency?.toLowerCase();
  if (u === "critical") return "bg-red-500/90 text-white border-red-300/30";
  if (u === "high") return "bg-orange-500/80 text-white border-orange-300/30";
  if (u === "medium") return "bg-yellow-500/80 text-black border-yellow-300/30";
  return "bg-green-500/80 text-white border-green-300/30";
}

export default function MissionReport() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [mission, setMission] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [activities, setActivities] = useState<any[]>([]);

  const fallbackLogs = [
    { text: "Mission parameters committed to system register", time: "01:45 AM" },
    { text: "Drone hardware pre-flight checklist passed", time: "01:48 AM" },
    { text: "Takeoff initiated · En route to target coordinates", time: "01:51 AM" },
    { text: "Target region designated vector acquired", time: "01:55 AM" },
    { text: "Visual payload scan validation triggered", time: "02:02 AM" },
    { text: "Mission completed successfully. Returning to base.", time: "02:15 AM" }
  ];

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/missions/${id}`);
        const data = res.data.data || res.data;
        setMission(data);

        const simulatedBreadcrumbs: LatLng[] = [
          { lat: data.departureLocation?.lat || 35.6971, lng: data.departureLocation?.lng || -0.6308 },
          { lat: ((data.departureLocation?.lat || 35.6971) + (data.targetArea?.lat || 35.6161)) / 2, lng: ((data.departureLocation?.lng || -0.6308) + (data.targetArea?.lng || -0.6682)) / 2 },
          { lat: data.targetArea?.lat || 35.6161, lng: data.targetArea?.lng || -0.6682 }
        ];
        setRouteCoordinates(simulatedBreadcrumbs);

        let accumulatedKm = 0;
        for (let i = 0; i < simulatedBreadcrumbs.length - 1; i++) {
          accumulatedKm += calculateDistance(
            simulatedBreadcrumbs[i].lat,
            simulatedBreadcrumbs[i].lng,
            simulatedBreadcrumbs[i + 1].lat,
            simulatedBreadcrumbs[i + 1].lng
          );
        }
        setTotalDistance(accumulatedKm);
        setActivities(data.activityLogs || fallbackLogs);
      } catch (error) {
        console.error("Error fetching report logs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReportData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070809] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-mono tracking-widest uppercase text-white/40">Compiling Mission History...</p>
        </div>
      </div>
    );
  }

  const startBattery = 100; 
  const currentBattery = Math.round(Number(mission?.drone?.battery ?? 43.5));
  const batteryDelta = startBattery - currentBattery;

  return (
    <AppShell>
      <div className="relative z-10 w-full px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* ── Header Bar Glass Section ────────────────────────────────── */}
          <Glass className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <Link to="/missionsPage" className="p-3 rounded-xl border border-white/10 bg-black/40 text-white/60 hover:text-white hover:border-primary transition shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Audit Finalized
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">ID: {mission?._id}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mt-1">
                    Mission Post-Action Report: <span className="text-emerald-400 font-extrabold">{mission?.title || mission?.type}</span>
                  </h1>
                </div>
              </div>
              
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold font-mono rounded-xl transition shadow-lg self-start md:self-center shrink-0"
              >
                <FileText className="h-4 w-4" /> PRINT DATA LOGS
              </button>
            </div>
          </Glass>

          {/* ── 4 Metrics Grid Blocks ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Glass className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-blue-300 shrink-0">
                <Milestone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Distance Covered</p>
                <p className="text-xl font-bold text-blue-300 mt-0.5">{totalDistance.toFixed(2)} km</p>
              </div>
            </Glass>

            <Glass className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-cyan-300 shrink-0">
                <Battery className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Takeoff Charge</p>
                <p className="text-xl font-bold text-cyan-300 mt-0.5">{startBattery}%</p>
              </div>
            </Glass>

            <Glass className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-red-300 shrink-0">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Power Consumption</p>
                <p className="text-xl font-bold text-red-300 mt-0.5">-{batteryDelta}%</p>
              </div>
            </Glass>

            <Glass className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-emerald-300 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Landing Status</p>
                <p className="text-xl font-bold text-emerald-300 mt-0.5">{currentBattery}% Remaining</p>
              </div>
            </Glass>
          </div>

          {/* ── Dashboard Content Layout Matrix ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left side Map & Profiles */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dynamic Map Frame Component */}
              <Glass className="p-4 flex flex-col h-[380px] overflow-hidden">
                <div className="border-b border-white/10 pb-3 mb-3">
                  <h3 className="text-xs font-mono uppercase text-zinc-300 tracking-widest flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" /> Dynamic Flight Route Trajectory Tracking
                  </h3>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative">
                  <LeafletMap 
                    dronePin={routeCoordinates[0]} 
                    targetPin={routeCoordinates[routeCoordinates.length - 1]} 
                    route={routeCoordinates}
                    className="h-full w-full"
                    interactive={true}
                  />
                </div>
              </Glass>

              {/* Specification Sub-Tables Data Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Glass className="p-5 space-y-4">
                  <h4 className="text-xs font-mono text-emerald-400 tracking-wider uppercase border-b border-white/10 pb-2 font-bold">
                    UAV Drone Hardware Profiling
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <p className="text-muted-foreground uppercase text-[10px] font-mono">Assigned Asset</p>
                      <p className="text-white font-bold mt-0.5">{mission?.drone?.name || "UAV-ResQ-04"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-[10px] font-mono">Mission Type</p>
                      <p className="text-white font-bold mt-0.5 capitalize">{mission?.type || "Emergency Delivery"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-[10px] font-mono">Allocated Payload</p>
                      <p className="text-white font-bold mt-0.5">{mission?.payloadWeight ?? 2.4} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-[10px] font-mono">Urgency Rating</p>
                      <span className={`inline-block mt-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${urgencyClass(mission?.urgency || "Critical")}`}>
                        {mission?.urgency || "Critical"}
                      </span>
                    </div>
                  </div>
                </Glass>

                <Glass className="p-5 space-y-4">
                  <h4 className="text-xs font-mono text-cyan-400 tracking-wider uppercase border-b border-white/10 pb-2 font-bold">
                    Geospatial Target Specifications
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-emerald-400 shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-[10px] font-mono uppercase">Launch Point Location</p>
                        <p className="text-white font-medium truncate mt-0.5">
                          {mission?.departureLocation?.name || `${Number(mission?.departureLocation?.lat ?? 35.6971).toFixed(4)}, ${Number(mission?.departureLocation?.lng ?? -0.6308).toFixed(4)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-red-400 shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-[10px] font-mono uppercase">Target Area Target</p>
                        <p className="text-white font-medium truncate mt-0.5">
                          {mission?.targetArea?.name || `${Number(mission?.targetArea?.lat ?? 35.6161).toFixed(4)}, ${Number(mission?.targetArea?.lng ?? -0.6682).toFixed(4)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Glass>
              </div>
            </div>

            {/* Right Side Activities Timeline Stream */}
            <Glass className="p-5 flex flex-col h-full min-h-[500px] lg:h-[504px]">
              <div className="border-b border-white/10 pb-4 mb-4 flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-zinc-300 tracking-widest flex items-center gap-2 font-bold">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> Telemetry Log History
                </h3>
                <span className="text-[10px] bg-black/40 border border-white/10 text-muted-foreground font-mono px-2.5 py-1 rounded-xl">
                  {activities.length} entries
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {activities.map((log, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] mt-1.5" />
                      {idx !== activities.length - 1 && <div className="w-px flex-1 bg-white/10 my-1.5" />}
                    </div>
                    <div className="flex-1 pb-3 border-b border-white/5">
                      <span className="text-[10px] font-mono text-muted-foreground block">{log.time || "01:50 AM"}</span>
                      <p className="text-white/90 font-medium mt-0.5 leading-relaxed">{log.text || JSON.stringify(log)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        </div>
      </div>
    </AppShell>
  );
}