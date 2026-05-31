import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Battery,
  CheckCircle,
  Clock,
  Cloud,
  Cpu,
  Crosshair,
  Droplets,
  Eye,
  MapPin,
  Radar,
  Route,
  Send,
  Sparkles,
  Thermometer,
  Triangle,
  Wind,
  Zap,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import AppShell from "@/components/AppShell";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import API from "@/api";
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

// ── types ─────────────────────────────────────────────────────────────────────
interface DroneEntry {
  drone: {
    _id: string; name: string; battery: number; status: string;
    speed: number; maxRange: number; payloadCapacity: number; type: string;
    location: { lat: number; lng: number; alt?: number };
    homeBase:  { lat: number; lng: number; alt?: number };
  };
  score: number; distanceKm: number; etaMinutes: number;
  estimatedDrain: number; rank: number;
}

interface Weather {
  windSpeed: number; visibility: number; temperature: number;
  rainMm: number; humidity: number; label: string;
  flightSafety: number; riskScore: number;
}

interface Obstacle { type: string; label: string; icon: string }

interface IntelData {
  request: {
    _id: string; type: string; urgency: string; status: string;
    location: { name?: string; lat: number; lng: number };
    fromLocation?: { name?: string; lat: number; lng: number };
    description?: string; details?: any;
    user?: { name?: string; email?: string };
    createdAt?: string;
  };
  weather: Weather;
  topDrones: DroneEntry[];
  missionRisk: number;
  targetArea: { areaSize: number; altitude: number; scanTime: number };
  obstacles: Obstacle[];
  sensors: string[];
}

// ── helpers ───────────────────────────────────────────────────────────────────
function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function serviceLabel(type: string) {
  const map: Record<string, string> = {
    thermal_drone:     "Thermal Drone · Search & Rescue",
vtol_hybrid:       "VTOL Hybrid · Autonomous Logistics",
sensor_drone:      "Sensor Drone · Environmental Monitoring",
fixed_wing:        "Fixed-Wing Drone · Long-Range Patrol",
camera_quadcopter: "Camera Quadcopter · Surveillance & Mapping",
  };
  return map[type] || type;
}

function serviceIcon(type: string) {
  const icons: Record<string, string> = {
    thermal_drone:     "🌡️",
    vtol_hybrid:       "🚁",
    sensor_drone:      "📡",
    fixed_wing:        "✈️",
    camera_quadcopter: "📷",
  };
  return icons[type] || "❓";
}

function safetyLabel(score: number) {
  if (score >= 80) return "Safe";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Risky";
  return "Dangerous";
}

function safetyColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function urgencyColor(u?: string) {
  if (u === "Critical") return "bg-red-500 text-white";
  if (u === "High")     return "bg-orange-500 text-white";
  if (u === "Medium")   return "bg-yellow-500 text-black";
  return "bg-green-500 text-white";
}

function riskColor(risk: number) {
  if (risk >= 70) return "text-red-400";
  if (risk >= 45) return "text-orange-400";
  if (risk >= 25) return "text-yellow-400";
  return "text-emerald-400";
}

function riskBg(risk: number) {
  if (risk >= 70) return "from-red-500/20 to-red-500/5 border-red-500/30";
  if (risk >= 45) return "from-orange-500/20 to-orange-500/5 border-orange-500/30";
  if (risk >= 25) return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
  return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
}
// ── Drone-type risk & success modifiers ───────────────────────────────────────
function droneTypeRiskModifier(type: string, baseRisk: number): number {
  // Each drone type has strengths — adjust mission risk accordingly
  const modifiers: Record<string, number> = {
    thermal_drone:     -10,  // thermal sensors greatly improve SAR success → lower risk
    camera_quadcopter:  +5,  // shorter endurance (25–30 min) → slightly higher risk
    fixed_wing:        -8,   // long endurance (90+ min) → lower patrol risk
    vtol_hybrid:        0,   // balanced all-rounder
    sensor_drone:      +6,   // niche environmental role → higher general mission risk
  };
  return Math.min(100, Math.max(0, baseRisk + (modifiers[type] ?? 0)));
}

function droneTypeSuccessRate(type: string, baseScore: number): number {
  // Endurance & role alignment bonus on top of raw match score
  const bonuses: Record<string, number> = {
    thermal_drone:      +8,  // purpose-built for SAR → high success uplift
    camera_quadcopter:  +5,  // strong surveillance match
    fixed_wing:        +10,  // endurance is a massive patrol advantage
    vtol_hybrid:        +4,  // logistics efficiency bonus
    sensor_drone:       +3,  // solid for environmental missions
  };
  return Math.min(100, Math.max(0, baseScore + (bonuses[type] ?? 0)));
}
function rankLabel(rank: number) {
  if (rank === 1) return { label: "Best Match",  color: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10" };
  if (rank === 2) return { label: "2nd Choice",  color: "text-slate-300 border-slate-400/40 bg-slate-400/10" };
  return           { label: "3rd Choice",  color: "text-orange-300 border-orange-400/40 bg-orange-400/10" };
}

// Returns a small pill showing the drone's current operational status
function DroneStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    idle:        { label: "Available",   className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    in_mission:  { label: "In Mission",  className: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    maintenance: { label: "Maintenance", className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    disabled:    { label: "Disabled",    className: "bg-red-500/20 text-red-300 border-red-500/30" },
  };
  const info = map[status] || { label: status, className: "bg-white/10 text-white border-white/20" };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${info.className}`}>
      {info.label}
    </span>
  );
}

// ── ring progress ─────────────────────────────────────────────────────────────
function RingProgress({ value, size = 88, stroke = 7, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

// ── map ───────────────────────────────────────────────────────────────────────
function IntelMap({ intel }: { intel: IntelData }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const { lat, lng } = intel.request.location;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView([lat || 36, lng || 3], 10);
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const targetIcon = L.divIcon({
      className: "",
      html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50% 50% 50% 0;background:#ef4444;border:2px solid white;box-shadow:0 2px 12px rgba(239,68,68,.6);transform:rotate(-45deg);font-size:16px;"><span style="transform:rotate(45deg)">🎯</span></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36],
    });
    if (lat && lng) {
      L.marker([lat, lng], { icon: targetIcon }).addTo(map)
        .bindPopup(`<b>Target Zone</b><br>${intel.request.location.name || "Mission Area"}`).openPopup();
    }

    if (intel.request.fromLocation?.lat && intel.request.fromLocation?.lng) {
      const fromIcon = L.divIcon({
        className: "",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50% 50% 50% 0;background:#3b82f6;border:2px solid white;box-shadow:0 2px 8px rgba(59,130,246,.5);transform:rotate(-45deg);font-size:14px;"><span style="transform:rotate(45deg)">📦</span></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32],
      });
      L.marker([intel.request.fromLocation.lat, intel.request.fromLocation.lng], { icon: fromIcon })
        .addTo(map).bindPopup(`<b>Pickup Point</b><br>${intel.request.fromLocation.name || ""}`);
      if (lat && lng) {
        L.polyline([[intel.request.fromLocation.lat, intel.request.fromLocation.lng], [lat, lng]], {
          color: "#3b82f6", weight: 2.5, dashArray: "6 4", opacity: 0.8,
        }).addTo(map);
      }
    }

    intel.topDrones.forEach((entry, i) => {
      const droneLat = entry.drone.homeBase?.lat || entry.drone.location?.lat;
      const droneLng = entry.drone.homeBase?.lng || entry.drone.location?.lng;
      if (!droneLat || !droneLng) return;
      const colors = ["#22c55e", "#94a3b8", "#f97316"];
      const droneIcon = L.divIcon({
        className: "",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50% 50% 50% 0;background:${colors[i]};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4);transform:rotate(-45deg);font-size:13px;"><span style="transform:rotate(45deg)">🚁</span></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32],
      });
      L.marker([droneLat, droneLng], { icon: droneIcon }).addTo(map)
        .bindPopup(`<b>#${i + 1} ${entry.drone.name}</b><br>Score: ${entry.score} pts<br>ETA: ${entry.etaMinutes} min`);
      if (lat && lng) {
        L.polyline([[droneLat, droneLng], [lat, lng]], {
          color: colors[i], weight: i === 0 ? 3 : 1.5,
          dashArray: i === 0 ? undefined : "4 6", opacity: i === 0 ? 0.9 : 0.5,
        }).addTo(map);
      }
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [intel]);

  return <div ref={ref} className="h-full w-full rounded-xl" />;
}

// ── drone comparison chart (NEW) ──────────────────────────────────────────────
// Shows all 3 top drones side-by-side: Match Score, Battery %, ETA (min)
// Gold = rank 1 (best), slate = rank 2, orange = rank 3
const DRONE_COLORS = ["#22c55e", "#94a3b8", "#f97316"];

function DroneComparisonChart({ topDrones, selectedIdx, onSelect }: {
  topDrones: DroneEntry[];
  selectedIdx: number;
  onSelect: (i: number) => void;
}) {
  if (topDrones.length === 0) return null;

  // Build data for the grouped bar chart
  // Three metrics: Match Score (out of 100), Battery %, ETA rescaled (max 60 min → 100)
  const data = topDrones.map((e, i) => ({
    name: e.drone.name.length > 10
      ? e.drone.name.split(" ").slice(-1)[0]   // last word of name (e.g. "Alpha-01")
      : e.drone.name,
    "Match Score": Math.min(100, e.score),
    "Battery %":  e.drone.battery,
    // ETA inverted: shorter ETA = higher bar (better). Max ETA shown = 60 min.
    "ETA Score":  Math.max(0, Math.round(100 - (e.etaMinutes / 60) * 100)),
    _idx: i,
  }));

  return (
    <div className="mb-6">
      {/* Legend + title */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-white">Side-by-Side Comparison</p>
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#22c55e" }} />
            Match Score
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#3b82f6" }} />
            Battery %
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#a855f7" }} />
            ETA Score (100 = instant)
          </span>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={3}
            barCategoryGap="28%"
            onClick={(payload) => {
              // Clicking a bar group selects that drone
              if (payload && payload.activeLabel !== undefined) {
                const idx = data.findIndex(d => d.name === payload.activeLabel);
                if (idx >= 0) onSelect(idx);
              }
            }}
          >
            <XAxis
              dataKey="name"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              unit="%"
              width={32}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgba(0,0,0,0.88)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}
              itemStyle={{ color: "#aaa" }}
              formatter={(value: any, name: string, props: any) => {
                if (name === "ETA Score") {
                  // Show real ETA alongside the score
                  const entry = topDrones[data.findIndex(d => d.name === props.payload.name)];
                  return [`${value}% (${entry?.etaMinutes} min ETA)`, "Speed Score"];
                }
                return [`${value}%`, name];
              }}
            />

            {/* Match Score bars — colored by rank */}
            <Bar dataKey="Match Score" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={DRONE_COLORS[i]}
                  opacity={selectedIdx === i ? 1 : 0.55}
                  stroke={selectedIdx === i ? "#fff" : "none"}
                  strokeWidth={selectedIdx === i ? 1 : 0}
                />
              ))}
            </Bar>

            {/* Battery % bars — blue tones */}
            <Bar dataKey="Battery %" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill="rgba(59,130,246,0.7)"
                  opacity={selectedIdx === i ? 1 : 0.45}
                />
              ))}
            </Bar>

            {/* ETA Score bars — purple tones */}
            <Bar dataKey="ETA Score" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill="rgba(168,85,247,0.7)"
                  opacity={selectedIdx === i ? 1 : 0.45}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        Click a bar group or a drone card below to select it for assignment
      </p>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function MissionIntelligencePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [intel, setIntel] = useState<IntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedDroneIdx, setSelectedDroneIdx] = useState(0);
  const [assigned, setAssigned] = useState(false);

  const fetchIntel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/emergency-requests/${id}/intelligence`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setIntel(data.data);
    } catch (e) {
      console.error("Failed to fetch intelligence:", e);
    } finally {
      setLoading(false);
    }
  };

  
const handleAssign = () => {
  if (!intel || intel.topDrones.length === 0) return;

  const selectedDrone = intel.topDrones[selectedDroneIdx];
  // Get coordinates from homeBase or current location
  const departureLat = selectedDrone.drone.homeBase?.lat || selectedDrone.drone.location?.lat;
  const departureLng = selectedDrone.drone.homeBase?.lng || selectedDrone.drone.location?.lng;

  sessionStorage.setItem(
    "assignedDrone",
    JSON.stringify({
      droneId:   selectedDrone.drone._id,
      droneName: selectedDrone.drone.name,
      lat: departureLat,
      lng: departureLng,
    })
  );

  navigate(`/requests/${id}`);
};

  useEffect(() => { fetchIntel(); }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-yellow-400/30" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-yellow-400" />
            <div className="absolute inset-5 rounded-full bg-yellow-400/10 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">Analyzing Mission Data</p>
            <p className="mt-1 text-sm text-muted-foreground">Scoring drones · Computing routes · Reading weather</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!intel) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center flex-col gap-4 text-white">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p>Failed to load mission intelligence.</p>
          <button onClick={() => navigate(-1)} className="rounded-xl bg-primary px-5 py-2 text-primary-foreground">
            Go Back
          </button>
        </div>
      </AppShell>
    );
  }

  const { request, weather, topDrones, missionRisk, targetArea, obstacles, sensors } = intel;
  const bestDrone = topDrones[selectedDroneIdx];

  const adjustedRisk = droneTypeRiskModifier(bestDrone?.drone.type ?? "", missionRisk);
const radarData = [
  { metric: "Weather",  value: Math.round(weather.flightSafety * 0.6) },
  { metric: "Battery",  value: bestDrone ? bestDrone.drone.battery : 0 },
  { metric: "Range",    value: bestDrone ? Math.round((1 - bestDrone.distanceKm / (bestDrone.drone.maxRange || 50)) * 100) : 50 },
  { metric: "Urgency",  value: request.urgency === "Critical" ? 95 : request.urgency === "High" ? 70 : 40 },
  { metric: "Safety",   value: Math.max(0, 100 - adjustedRisk) },
];

  const batteryBarData = topDrones.map(e => ({
    name: e.drone.name.split(" ").slice(-1)[0],
    battery: e.drone.battery,
    drain: e.estimatedDrain,
  }));

  return (
    <AppShell>
      <div className="relative z-10 w-full px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl space-y-5">

          {/* HEADER */}
          <Glass className="p-5">
            <button onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to request
            </button>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10">
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Mission Intelligence Center</h1>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span>{serviceIcon(request.type)}</span>
                    <span>{serviceLabel(request.type)} · Submitted by {request.user?.name || "Unknown"}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${urgencyColor(request.urgency)}`}>
                  {request.urgency}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                  {serviceLabel(request.type)}
                </span>
                <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                  AI Analysis Active
                </span>
              </div>
            </div>
          </Glass>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* LEFT — 2 cols */}
            <div className="space-y-5 lg:col-span-2">

              {/* Map */}
              <Glass className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <SectionTitle icon={<Route className="h-4 w-4 text-primary" />} title="Live Mission Map"
                    sub="Drone positions · Route lines · Target zone" />
                </div>
                <div className="h-[340px] w-full">
                  <IntelMap intel={intel} />
                </div>
                <div className="flex gap-4 border-t border-white/10 px-5 py-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" /> Best drone</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" /> Alt drone</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" /> Target zone</span>
                </div>
              </Glass>

              {/* Target Area + Obstacles */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <Glass className="p-5">
                  <SectionTitle icon={<Crosshair className="h-4 w-4 text-primary" />} title="Target Area Analysis" />
                  <div className="space-y-3">
                    {[
                      { label: "Area Size",            value: `${targetArea.areaSize} km²`,  icon: <MapPin className="h-3.5 w-3.5 text-blue-300" /> },
                      { label: "Recommended Altitude", value: `${targetArea.altitude} m AGL`, icon: <Triangle className="h-3.5 w-3.5 text-purple-300" /> },
                      { label: "Estimated Scan Time",  value: `${targetArea.scanTime} min`,  icon: <Clock className="h-3.5 w-3.5 text-yellow-300" /> },
                      { label: "Mission Location",     value: request.location?.name || `${request.location?.lat?.toFixed(4)}, ${request.location?.lng?.toFixed(4)}`, icon: <MapPin className="h-3.5 w-3.5 text-red-300" /> },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">{row.icon}{row.label}</span>
                        <span className="text-xs font-bold text-white">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-bold text-white">Required Sensors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sensors.map(s => (
                        <span key={s} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                </Glass>

                <Glass className="p-5">
                  <SectionTitle icon={<AlertTriangle className="h-4 w-4 text-primary" />} title="Obstacle Detection" sub="Simulated flight zone analysis" />
                  <div className="space-y-2.5">
                    {obstacles.map((obs, i) => (
                      <div key={i} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                        obs.type === "info"
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                          : "border-orange-500/20 bg-orange-500/5 text-orange-200"
                      }`}>
                        <span className="text-base">{obs.icon}</span>
                        <span>{obs.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs font-bold text-primary mb-1">AI Detection (Coming Soon)</p>
                    <p className="text-xs text-muted-foreground">
                      { request.type === "thermal_drone"     ? "Thermal imaging · Heat signature detection · Night SAR · Endurance: 20–25 min"
: request.type === "camera_quadcopter" ? "HD surveillance · Area mapping · Visual tracking · Endurance: 25–30 min"
: request.type === "fixed_wing"        ? "Long-range patrol · Perimeter scan · Autonomous cruise · Endurance: 90+ min"
: request.type === "vtol_hybrid"       ? "Payload delivery · Hover & transition · Autonomous logistics"
: request.type === "sensor_drone"      ? "Gas leak detection · Air quality · Environmental sensor sweep": "General purpose drone capabilities and analysis" }
                    </p>
                  </div>
                </Glass>
              </div>

              {/* Battery chart */}
              {batteryBarData.length > 0 && (
                <Glass className="p-5">
                  <SectionTitle icon={<Battery className="h-4 w-4 text-primary" />} title="Drone Battery Analysis"
                    sub="Current charge vs estimated mission drain" />
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={batteryBarData} barGap={4} barCategoryGap="30%">
                        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip
                          contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "#fff" }} itemStyle={{ color: "#aaa" }}
                        />
                        <Bar dataKey="battery" name="Current Battery" radius={[4, 4, 0, 0]}>
                          {batteryBarData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? "#22c55e" : i === 1 ? "#94a3b8" : "#f97316"} />
                          ))}
                        </Bar>
                        <Bar dataKey="drain" name="Est. Drain" radius={[4, 4, 0, 0]} fill="rgba(239,68,68,0.4)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Glass>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">

              {/* Weather */}
              <Glass className="p-5">
                <SectionTitle icon={<Cloud className="h-4 w-4 text-primary" />} title="Weather Analysis" />
                <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Flight Condition</p>
                    <p className="text-lg font-bold" style={{ color: safetyColor(weather.flightSafety) }}>
                      {safetyLabel(weather.flightSafety)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{weather.label}</p>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <RingProgress value={weather.flightSafety} color={safetyColor(weather.flightSafety)} />
                    <span className="absolute text-sm font-bold" style={{ color: safetyColor(weather.flightSafety) }}>
                      {weather.flightSafety}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Wind className="h-3.5 w-3.5 text-blue-300" />,         label: "Wind Speed",  value: `${weather.windSpeed} km/h` },
                    { icon: <Eye className="h-3.5 w-3.5 text-purple-300" />,         label: "Visibility",  value: `${weather.visibility} km` },
                    { icon: <Thermometer className="h-3.5 w-3.5 text-orange-300" />, label: "Temperature", value: `${weather.temperature}°C` },
                    { icon: <Droplets className="h-3.5 w-3.5 text-cyan-300" />,      label: "Rain",        value: `${weather.rainMm} mm` },
                    { icon: <Droplets className="h-3.5 w-3.5 text-teal-300" />,      label: "Humidity",    value: `${weather.humidity}%` },
                    { icon: <Zap className="h-3.5 w-3.5 text-yellow-300" />,         label: "Risk Score",  value: `${weather.riskScore} / 7` },
                  ].map(row => (
                    <div key={row.label} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      {row.icon}
                      <p className="mt-1.5 text-[10px] text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-bold text-white">{row.value}</p>
                    </div>
                  ))}
                </div>
              </Glass>

              {/* Mission Risk */}
              <Glass className={`bg-gradient-to-br border p-5 ${riskBg(missionRisk)}`}>
                <SectionTitle icon={<Radar className="h-4 w-4 text-primary" />} title="Mission Risk Score" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-4xl font-bold ${riskColor(adjustedRisk)}`}>{adjustedRisk}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {adjustedRisk >= 70 ? "High risk — proceed with caution"
                        : adjustedRisk >= 45 ? "Moderate risk — review conditions"
                        : adjustedRisk >= 25 ? "Low-moderate risk — good to go"
                        : "Low risk — optimal conditions"}
                    </p>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <RingProgress value={adjustedRisk} size={72} stroke={6}
                      color={adjustedRisk >= 70 ? "#ef4444" : adjustedRisk >= 45 ? "#f97316" : adjustedRisk >= 25 ? "#eab308" : "#22c55e"} />
                    <span className={`absolute text-xs font-bold ${riskColor(adjustedRisk)}`}>{adjustedRisk}%</span>
                  </div>
                </div>
                <div className="mt-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                      <RechartsRadar name="Score" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} dot={{ fill: "#22c55e", r: 3 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Glass>

              {/* ETA */}
              {bestDrone && (
                <Glass className="p-5">
                  <SectionTitle icon={<Clock className="h-4 w-4 text-primary" />} title="Mission ETA" />
                  <div className="space-y-2">
                    {[
                      { label: "Estimated Flight Time", value: `${bestDrone.etaMinutes} min` },
                      { label: "Distance to Target",    value: `${bestDrone.distanceKm} km` },
                      { label: "Drone Speed",           value: `${bestDrone.drone.speed} km/h` },
                      { label: "Est. Battery Drain",    value: `${bestDrone.estimatedDrain}%` },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between border-b border-white/5 py-2">
                        <span className="text-xs text-muted-foreground">{r.label}</span>
                        <span className="text-xs font-bold text-white">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              )}
            </div>
          </div>

          {/* ── TOP 3 DRONES — with comparison chart ──────────────────────── */}
          <Glass className="p-5">
            <SectionTitle
              icon={<Sparkles className="h-4 w-4 text-yellow-300" />}
              title="AI-Recommended Drones"
              sub={
                topDrones.length > 0
                  ? `${topDrones.length} drone${topDrones.length > 1 ? "s" : ""} scored and ranked · click a card to select for assignment`
                  : "No drones available"
              }
            />

            {topDrones.length === 0 ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                <p className="text-sm font-bold text-red-300 mb-1">No available drones match this mission</p>
                <p className="text-xs text-muted-foreground">
                  Possible reasons: all drones have battery below 30%, no drone can reach this location on a round trip,
                  or all drones are disabled. Go to the Drones page and check battery levels and home-base coordinates.
                </p>
              </div>
            ) : (
              <>
                {/* ── NEW: comparison bar chart (appears above the drone cards) ── */}
                <DroneComparisonChart
                  topDrones={topDrones}
                  selectedIdx={selectedDroneIdx}
                  onSelect={setSelectedDroneIdx}
                />

                {/* ── drone cards ── */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {topDrones.map((entry, i) => {
                    const { label, color } = rankLabel(entry.rank);
                    const isSelected = selectedDroneIdx === i;
                    return (
                      <button
                        key={entry.drone._id}
                        onClick={() => setSelectedDroneIdx(i)}
                        className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                            : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-black/50"
                        }`}
                      >
                        {/* rank + score + status */}
                        <div className="mb-3 flex items-center justify-between flex-wrap gap-1">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${color}`}>{label}</span>
                          <div className="flex items-center gap-1.5">
                            <DroneStatusBadge status={entry.drone.status} />
                            <span className="text-xs font-bold text-white">{entry.score} pts</span>
                          </div>
                        </div>

                        <p className="text-base font-bold text-white">{entry.drone.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground capitalize">{entry.drone.type} drone</p>

                        {/* progress bars */}
                        <div className="mt-4 space-y-2">
                          <div>
                            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Battery className="h-3 w-3" />Battery</span>
                              <span className="font-semibold text-white">{entry.drone.battery}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${entry.drone.battery}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />Match Score</span>
                              <span className="font-semibold text-white">{droneTypeSuccessRate(entry.drone.type, entry.score)}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${droneTypeSuccessRate(entry.drone.type, entry.score)}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* stats grid */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {[
                            { label: "ETA",      value: `${entry.etaMinutes} min` },
                            { label: "Distance", value: `${entry.distanceKm} km` },
                            { label: "Speed",    value: `${entry.drone.speed} km/h` },
                            { label: "Payload",  value: `${entry.drone.payloadCapacity} kg` },
                          ].map(stat => (
                            <div key={stat.label} className="rounded-lg bg-white/5 px-2.5 py-1.5">
                              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                              <p className="text-xs font-bold text-white">{stat.value}</p>
                            </div>
                          ))}
                        </div>

                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold text-primary">Selected for assignment</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </Glass>

          {/* ASSIGN */}
          <Glass className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {assigned ? "✅ Mission Dispatched!" : "Dispatch Mission"}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {assigned
                    ? "Drone assigned and mission created. Redirecting to missions..."
                    : topDrones.length > 0
                    ? `Accept request and assign ${topDrones[selectedDroneIdx]?.drone.name} to this mission`
                    : "No drones available — resolve drone status first"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAssign}
                  disabled={topDrones.length === 0 || assigning || assigned}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                    assigned
                      ? "bg-emerald-600 text-white"
                      : topDrones.length === 0
                      ? "cursor-not-allowed bg-white/10 text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  }`}
                >
                  {assigning ? (
                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-white" /> Assigning...</>
                  ) : assigned ? (
                    <><CheckCircle className="h-4 w-4" /> Dispatched!</>
                  ) : (
                    <><Send className="h-4 w-4" /> Assign &amp; Create Mission</>
                  )}
                </button>
              </div>
            </div>
          </Glass>

        </div>
      </div>
    </AppShell>
  );
}