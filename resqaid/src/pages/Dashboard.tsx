import {
  Bell,
  Search,
  User,
  MapPin,
  Battery,
  Activity,
  Radar,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import AppShell, { Glass } from "../components/AppShell"; 
import SyncCenter from "@/components/SyncCenter";

export default function DashboardPage() {
  const [missions, setMissions] = useState([]);
  const [drones, setDrones] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const todayUsers = users.filter((u: any) => {
    const created = new Date(u.createdAt);
    const today = new Date();

    return (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    );
  });

  const chargingDrones = drones.filter(
    (d: any) => d.battery <= 20
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const missionsRes = await axios.get("http://localhost:5000/api/missions", config);
      const dronesRes = await axios.get("http://localhost:5000/api/drones", config);
      const usersRes = await axios.get("http://localhost:5000/api/auth/users", config);

      setMissions(missionsRes.data.data || []);
      setDrones(dronesRes.data.data || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  // CLIENT SIDE FILTER LOGIC FOR SEARCH BAR
  const filteredDrones = drones.filter((d: any) => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMissions = missions.filter((m: any) => 
    m.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // DYNAMIC STYLE HELPER: DRONE STATUS
  const getDroneStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "idle") {
      return "bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 font-bold uppercase tracking-wider";
    }
    if (s === "active" || s === "flying") {
      return "bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold uppercase tracking-wider";
    }
    return "bg-white/5 text-white/60 border border-white/10 font-bold uppercase tracking-wider";
  };

  // DYNAMIC STYLE HELPER: MISSION STATUS
  const getMissionStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "assigned" || s === "active") {
      return "text-sky-400 font-semibold capitalize";
    }
    if (s === "completed") {
      return "text-emerald-400 font-semibold capitalize";
    }
    return "text-yellow-400 font-semibold capitalize";
  };

  // DYNAMIC STYLE HELPER: BATTERY LEVEL
  const getBatteryStyle = (percent: number) => {
    if (percent > 50) return "text-emerald-400"; // Big / Healthy
    if (percent > 20) return "text-yellow-400";  // Medium / Warning
    return "text-red-400 animate-pulse";          // Small / Critical
  };

  return (
    <AppShell>
      <Glass className="p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white/90">
              Dashboard
            </h1>
            <p className="text-white/50 mt-1 text-sm">
              Rescue command center overview
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drones or missions..."
                className="w-[280px] rounded-xl border border-white/10 bg-black/20 px-9 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-md outline-none focus:border-white/30 transition"
              />
            </div>

            {/* Notification and User Buttons */}
            <button className="rounded-xl border border-white/10 bg-black/20 p-2.5 hover:bg-white/5 transition text-white/70">
              <Bell className="h-4 w-4" />
            </button>

            <button className="rounded-xl border border-white/10 bg-black/20 p-2.5 hover:bg-white/5 transition text-white/70">
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          {/* CARD */}
          <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs font-medium">Active Missions</p>
                <h2 className="text-2xl font-bold mt-1 text-white/90">
                  {missions?.length || 0}
                </h2>
                <p className="text-white/40 mt-1 text-xs">
                  {missions.filter((m: any) => m.status === "assigned")?.length || 0} currently active
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <Activity className="h-5 w-5 text-white/70" />
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs font-medium">Available Drones</p>
                <h2 className="text-2xl font-bold mt-1 text-white/90">
                  {drones.filter((d: any) => d.status === "idle")?.length || 0}
                </h2>
                <p className="text-white/40 mt-1 text-xs">
                  {chargingDrones.length} unit battery warnings
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <Radar className="h-5 w-5 text-white/70" />
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs font-medium">Registered Operators</p>
                <h2 className="text-2xl font-bold mt-1 text-white/90">
                  {users?.length || 0}
                </h2>
                <p className="text-white/40 mt-1 text-xs">
                  +{todayUsers.length} added today
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <User className="h-5 w-5 text-white/70" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-5 mb-6">
          {/* DRONES OVERVIEW */}
          <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white/90">Drone Overview</h2>
              <button className="rounded-lg border border-white/10 bg-black/20 px-4 py-1.5 text-xs text-white/70 hover:bg-white/5 transition">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {filteredDrones.slice(0, 3).map((d: any) => {
                const batteryVal = Math.round(d.battery || 0);
                const batteryColorClass = getBatteryStyle(batteryVal);

                return (
                  <div
                    key={d._id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/10 p-4 transition hover:border-white/10 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                        <Radar className="h-5 w-5 text-white/70" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white/90">{d.name}</h3>
                        <p className="text-xs text-white/40">Search & rescue</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-white/40 text-[11px]">Battery</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-white/80">
                          <Battery className={`h-3.5 w-3.5 ${batteryColorClass}`} />
                          <span className={`text-xs font-semibold ${batteryColorClass}`}>
                            {batteryVal}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-white/40 text-[11px]">Location</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-white/80">
                          <MapPin className="h-3.5 w-3.5 text-white/40" />
                          <span className="text-xs font-medium">
                            {d.location?.lat?.toFixed(2) || 0}, {d.location?.lng?.toFixed(2) || 0}
                          </span>
                        </div>
                      </div>

                      {/* Drone Status Badge styled like Drone Page */}
                      <span className={`rounded-lg px-3 py-1 text-xs ${getDroneStatusStyle(d.status)}`}>
                        {d.status || "IDLE"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filteredDrones.length === 0 && (
                <p className="text-white/30 text-xs text-center py-4">No matching drones discovered.</p>
              )}
            </div>
          </div>

          {/* ACTIVITY CARD */}
          <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white/90">Activity Log</h2>
              <button className="rounded-lg border border-white/10 bg-black/20 px-4 py-1.5 text-xs text-white/70 hover:bg-white/5 transition">
                View all
              </button>
            </div>

            <div className="space-y-4">
              {filteredMissions.slice(0, 4).map((m: any) => (
                <div key={m._id} className="flex gap-3 items-start">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-white/40" />
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      Mission {m._id?.slice(-5)} updated to{" "}
                      {/* Mission status matching your mission view text configurations */}
                      <span className={getMissionStatusStyle(m.status)}>
                        {m.status}
                      </span>
                    </p>
                    <span className="text-xs text-white/30">
                      {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
              {filteredMissions.length === 0 && (
                <p className="text-white/30 text-xs text-center py-4">No matching missions discovered.</p>
              )}
            </div>
          </div>
        </div>

        {/* SYNC CENTER CONTAINER */}
        <div className="mt-4">
          <SyncCenter />
        </div>

      </Glass>
    </AppShell>
  );
}