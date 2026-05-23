import {
  Bell,
  Search,
  User,
  MapPin,
  Battery,
  Radio,
  Activity,
  AlertTriangle,
  Radar,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import AppShell, { Glass } from "../components/AppShell"; 

export default function DashboardPage() {
  const [missions, setMissions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [drones, setDrones] = useState([]);
  const [users, setUsers] = useState([]);

  const todayUsers = users.filter((u: any) => {
    const created = new Date(u.createdAt);
    const today = new Date();

    return (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    );
  });

  const criticalRequests = requests.filter(
    (r: any) => r.urgency?.toLowerCase() === "critical"
  );
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
      const requestsRes = await axios.get("http://localhost:5000/api/emergency-requests", config);
      const usersRes = await axios.get("http://localhost:5000/api/auth/users", config);

      setMissions(missionsRes.data.data || []);
      setDrones(dronesRes.data.data || []);
      setRequests(requestsRes.data.data || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <Glass className="p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-6xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="text-white/60 mt-2 text-lg">
              Rescue command center overview
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Search drones, missions, requests..."
                className="w-[360px] rounded-2xl border border-white/10 bg-black/30 px-12 py-3 text-white placeholder:text-white/40 backdrop-blur-xl outline-none focus:border-emerald-400 transition"
              />
            </div>

            {/* Icons */}
            <button className="rounded-xl border border-white/10 bg-black/30 p-3 hover:bg-emerald-500/20 transition text-white">
              <Bell className="h-5 w-5" />
            </button>

            <button className="rounded-xl border border-white/10 bg-black/30 p-3 hover:bg-emerald-500/20 transition text-white">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* CARD */}
          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active missions</p>
                {/* FIXED: Changed to text-white */}
                <h2 className="text-4xl font-bold mt-2 text-white">
                  {missions?.length || 0}
                </h2>
                <p className="text-emerald-400 mt-2 text-sm">
                  {missions.filter((m) => m.status === "assigned")?.length || 0} currently active
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 p-4">
                <Activity className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Available drones</p>
                {/* FIXED: Changed to text-white */}
                <h2 className="text-4xl font-bold mt-2 text-white">
                  {drones.filter((d) => d.status === "idle")?.length || 0}
                </h2>
                <p className="text-emerald-400 mt-2 text-sm">
                  {chargingDrones.length} charging...
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 p-4">
                <Radar className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Pending requests</p>
                {/* FIXED: Changed to text-white */}
                <h2 className="text-4xl font-bold mt-2 text-white">
                  {requests.filter((r) => r.status === "pending")?.length || 0}
                </h2>
                <p className="text-red-400 mt-2 text-sm">
                  {criticalRequests.length} critical alerts
                </p>
              </div>
              <div className="rounded-2xl bg-red-500/20 p-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Registered users</p>
                {/* FIXED: Changed to text-white */}
                <h2 className="text-4xl font-bold mt-2 text-white">
                  {users?.length || 0}
                </h2>
                <p className="text-emerald-300 mt-2 text-sm">
                  +{todayUsers.length} today
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/15 p-4">
                <User className="h-8 w-8 text-emerald-300" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-[1.7fr_1fr] gap-6 mb-8">
          {/* DRONES */}
          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-7">
            <div className="flex items-center justify-between mb-7">
              {/* FIXED: Added text-white */}
              <h2 className="text-3xl font-bold text-white">Drone Overview</h2>
              {/* FIXED: Added text-white/80 */}
              <button className="rounded-xl border border-white/10 bg-black/30 px-5 py-2 text-white/80 hover:bg-emerald-500/20 transition">
                View all
              </button>
            </div>

            <div className="space-y-5">
              {drones.slice(0, 3).map((d) => (
                <div
                  key={d._id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-emerald-500/30 hover:bg-white/5"
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-2xl bg-emerald-500/20 p-4">
                      <Radar className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      {/* FIXED: Changed to text-white */}
                      <h3 className="text-xl font-semibold text-white">{d.name}</h3>
                      <p className="text-white/50">Search & rescue</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-white/50 text-sm">Battery</p>
                      {/* FIXED: Added text-white */}
                      <div className="flex items-center gap-2 mt-1 text-white">
                        <Battery className="h-4 w-4 text-emerald-400" />
                        <span className="font-semibold">{d.battery}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-white/50 text-sm">Location</p>
                      {/* FIXED: Added text-white */}
                      <div className="flex items-center gap-2 mt-1 text-white">
                        <MapPin className="h-4 w-4 text-red-400" />
                        <span className="font-semibold">
                          {d.location?.lat || 0}, {d.location?.lng || 0}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-500/15 px-5 py-2 text-sm font-semibold text-emerald-400 border border-emerald-500/30">
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVITY */}
          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-7">
            <div className="flex items-center justify-between mb-7">
              {/* FIXED: Added text-white */}
              <h2 className="text-3xl font-bold text-white">Activity</h2>
              {/* FIXED: Added text-white/80 */}
              <button className="rounded-xl border border-white/10 bg-black/30 px-5 py-2 text-white/80 hover:bg-emerald-500/20 transition">
                View all
              </button>
            </div>

            <div className="space-y-6">
              {(missions || []).slice(0, 4).map((m) => (
                <div key={m._id} className="flex gap-4">
                  <div
                    className={`mt-2 h-3 w-3 rounded-full ${
                      m.status === "completed"
                        ? "bg-emerald-400"
                        : m.status === "assigned"
                        ? "bg-emerald-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-white">
                      Mission {m._id?.slice(-5)} {m.status}
                    </p>
                    <span className="text-sm text-white/40">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EMERGENCY REQUESTS */}
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-7">
          <div className="flex items-center justify-between mb-8">
            {/* FIXED: Added text-white */}
            <h2 className="text-3xl font-bold text-white">Emergency Requests</h2>
            <span className="rounded-full bg-red-500/20 px-5 py-2 text-sm font-semibold text-red-400 border border-red-500/30">
              {criticalRequests.length} critical
            </span>
          </div>

          <div className="space-y-5">
            {requests.slice(0, 5).map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-emerald-500/30 hover:bg-white/5"
              >
                <div className="flex items-center gap-6">
                  <div className="rounded-2xl bg-red-500/20 p-4">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {r.type}
                    </h3>
                    <p className="text-white/50">{r._id?.slice(-5)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-center">
                    <p className="text-white/40 text-sm">Status</p>
                    <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-yellow-300 border border-yellow-500/20">
                      {r.status}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-white/40 text-sm">Urgency</p>
                    <span className="mt-2 inline-block rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 border border-red-500/20">
                      {r.urgency}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-white/40 text-sm">Time</p>
                    <p className="mt-2 font-semibold text-white">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </Glass>
    </AppShell>
  );
}