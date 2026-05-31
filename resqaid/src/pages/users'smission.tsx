import { Glass } from "@/components/AppShell";
import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import API from "@/api";
import { useNavigate } from "react-router-dom";
import { loadCache, saveCache } from "@/utils/offlineCache";
import { Package, Shield, Wrench, Search, Gauge } from "lucide-react";

type Status = "completed" | "assigned" | "pending" | "active";

type Mission = {
  _id: string;
  title?: string;
  type: string;
  status: Status;
  payloadWeight: number;
  urgency: string;
  startTime: string;
  user?: string; // Reference field to identify the owner of the mission
  drone?: any;
  departureLocation?: {
    lat: number;
    lng: number;
  };
  description?: string;
  dLocation?: { name?: string; lat: number; lng: number };
  targetArea?: { name?: string; lat: number; lng: number };
  startedAt?: string;
  createdAt?: string;
};

// Helper function to extract user information safely from the authentication token
const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload).id || JSON.parse(jsonPayload)._id || null;
  } catch (e) {
    console.error("Failed to parse auth token:", e);
    return null;
  }
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    completed: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40",
    pending:   "bg-yellow-500/20 text-yellow-100 border border-yellow-400/40",
    active:    "bg-blue-500/20 text-blue-100 border border-blue-400/40",
    assigned:  "bg-cyan-500/20 text-cyan-100 border border-cyan-400/40",
  };

  const labels: Record<Status, string> = {
    completed: "Completed",
    pending:   "Pending",
    active:    "Active",
    assigned:  "Assigned",
  };

  return (
    <span className={`inline-flex items-center rounded-xl px-5 py-2.5 text-base font-bold uppercase tracking-widest backdrop-blur-md w-full justify-center ${styles[status] ?? "bg-white/10 text-white/60"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── Urgency Pill ─────────────────────────────────────────────────────────────
function UrgencyPill({ urgency }: { urgency: string }) {
  const key = (urgency || "").toLowerCase();
  const styles: any = {
    low:      "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    medium:   "bg-yellow-500/15 text-yellow-100 border border-yellow-400/30",
    high:     "bg-orange-500/15 text-orange-100 border border-orange-400/30",
    critical: "bg-red-500/15 text-red-100 border border-red-400/30",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur-md ${styles[key] ?? styles.low}`}>
      {urgency}
    </span>
  );
}

// ─── Type Cell ────────────────────────────────────────────────────────────────
function TypeCell({ type }: { type: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string }> = {
    SAR:        { icon: <Search   className="h-6 w-6 text-cyan-400" />,    label: "Search & Rescue" },
    logistics:  { icon: <Package className="h-6 w-6 text-yellow-400" />,  label: "Remote Logistics" },
    oilgas:     { icon: <Gauge    className="h-6 w-6 text-orange-500" />,  label: "Oil & Gas Monitoring" },
    industrial: { icon: <Wrench   className="h-6 w-6 text-orange-400" />,  label: "Industrial Inspection" },
    security:   { icon: <Shield   className="h-6 w-6 text-red-400" />,     label: "Security Patrol" },
  };

  const { icon, label } = config[type] ?? { icon: null, label: type };

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-base">{label}</span>
    </div>
  );
}

// ─── Users Mission View Page ──────────────────────────────────────────────────
export default function UsersMission() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);

  const fetchMissions = async () => {
    try {
      const res = await API.get("/missions");
      const missionsData = res.data?.data || [];
      const currentUserId = getUserIdFromToken();
      
      // Filter constraints: Must NOT be pending AND must belong explicitly to this authenticated user
      const userAcceptedMissions = missionsData.filter((m: Mission) => {
        const isAccepted = m.status !== "pending";
        const isOwnMission = currentUserId ? m.user === currentUserId : true; 
        return isAccepted && isOwnMission;
      });
      
      setMissions(userAcceptedMissions);
      saveCache("user_specific_missions_cache", userAcceptedMissions);
    } catch (err) {
      console.error("Online user missions fetch failed:", err);
      const cached = loadCache("user_specific_missions_cache");
      if (cached?.data) setMissions(cached.data);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return (
    <div>
      <AppShell>
        <Glass className="overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-black/40 px-6 py-4">
            <h2 className="text-2xl font-semibold text-white/80">My Operations</h2>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[0.5fr_1fr_1fr_0.8fr_1fr_1.2fr_1.2fr_1.2fr_1.4fr] items-center gap-6 border-b border-white/10 bg-black/30 px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white/70">
            <div>ID</div>
            <div>Type</div>
            <div>Status</div>
            <div>Payload</div>
            <div>Urgency</div>
            <div>Start time</div>
            <div>Location</div>
            <div>Target area</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Render List */}
          <ul>
            {missions?.map((m) => (
              <li
                key={m._id}
                className="grid grid-cols-[0.5fr_1fr_1fr_0.8fr_1fr_1.2fr_1.2fr_1.2fr_1.4fr] items-center gap-6 px-8 py-5 border-b border-white/5 hover:bg-white/[0.03] transition-all text-base"
              >
                <div className="font-medium text-white/80">{m._id?.slice(-5) || "N/A"}</div>

                <div className="font-medium text-white/90">
                  <TypeCell type={m.type} />
                </div>

                <div className="font-medium text-white/90">
                  <StatusPill status={m.status} />
                </div>

                <div className="font-medium text-white/85">{m.payloadWeight} kg</div>

                <div className="font-medium text-white/80">
                  <UrgencyPill urgency={m.urgency} />
                </div>

                <div className="font-medium text-white/80">
                  {m.startTime ? new Date(m.startTime).toLocaleString()
                    : m.startedAt ? new Date(m.startedAt).toLocaleString()
                    : m.createdAt ? new Date(m.createdAt).toLocaleString()
                    : "—"}
                </div>

                <div className="font-medium text-white/80 truncate">
                  📍 {m.dLocation?.name ? m.dLocation.name : `${m.dLocation?.lat ?? 0}, ${m.dLocation?.lng ?? 0}`}
                </div>

                <div className="font-medium text-white/80 truncate">
                  🎯 {m.targetArea?.name ? m.targetArea.name : `${m.departureLocation?.lat ?? 0}, ${m.departureLocation?.lng ?? 0}`}
                </div>

                {/* Updated Action Controls */}
                <div className="flex items-center justify-end">
                  <button 
                    onClick={() => navigate(`/missions/${m._id}/report`)} 
                    className="rounded-xl bg-blue-500/90 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-400 active:scale-95 text-center whitespace-nowrap"
                  >
                    Full Report
                  </button>
                </div>
              </li>
            ))}
            {missions.length === 0 && (
              <li className="text-center py-12 text-white/40 text-sm tracking-wider uppercase">
                No personalized tracking operations located.
              </li>
            )}
          </ul>
        </Glass>
      </AppShell>
    </div>
  );
}