import { Package } from "lucide-react";
import { Glass } from "@/components/AppShell";
import AppShell from "@/components/AppShell";

import { useEffect, useState } from "react";
import API from "@/api";
import { useNavigate, useLocation } from "react-router-dom";

import { saveCache, loadCache } from "@/utils/offlineCache";

import {
  savePendingMission,
  removePendingMission,
  updatePendingMissionStatus,
  syncPendingMissions,
} from "@/utils/offlineMissions";

type Status = "completed" | "assigned" | "pending" | "active";
type MType = "SAR" |  "logistics" | "oilgas" | "industrial" | "security";

type Mission = {
  _id: string;
  title?: string;
  type: string;
  status: Status;
  payloadWeight: number;
  urgency: string;
  startTime: string;
  drone?: any;
  description?: string;
  departureLocation?: {
    name?: string;
    lat: number;
    lng: number;
  };
  targetArea?: {
    name?: string;
    lat: number;
    lng: number;
  };
  startedAt?: string;
  createdAt?: string;
};

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    completed: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40",
    pending: "bg-yellow-500/20 text-yellow-100 border border-yellow-400/40",
    active: "bg-blue-500/20 text-blue-100 border border-blue-400/40",
    assigned: "bg-cyan-500/20 text-cyan-100 border border-cyan-400/40",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur-md ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function UrgencyPill({ urgency }: { urgency: string }) {
  const key = (urgency || "").toLowerCase();

  const styles: any = {
    low: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    medium: "bg-yellow-500/15 text-yellow-100 border border-yellow-400/30",
    high: "bg-orange-500/15 text-orange-100 border border-orange-400/30",
    critical: "bg-red-500/15 text-red-100 border border-red-400/30",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur-md ${styles[key] || styles.low}`}>
      {urgency}
    </span>
  );
}

function TypeCell({ type }: { type: string }) {
  if (type === "logistics" || type === "logistics") {
    return (
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-warning" />
        <span>{type === "logistics" ? "Remote Logistics" : "logistics"}</span>
      </div>
    );
  }

  if (type === "SAR") return <span>Search &amp; rescue</span>;
  if (type === "oilgas") return <span>Oil &amp; Gas Monitoring</span>;
  if (type === "industrial") return <span>Industrial Inspection</span>;
  if (type === "security") return <span>Security Patrol</span>;

  return <span>{type}</span>;
}

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md text-white placeholder-white/40 focus:outline-none focus:border-green-400/60 focus:bg-white/10 transition";

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs uppercase tracking-wide text-white/60 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function MissionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [open, setOpen] = useState(false);

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [disableReason, setDisableReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "SAR",
    status: "assigned",
    payloadWeight: 0,
    urgency: "Low",
    startTime: "",
    locationName: "",
    lat: 0,
    lng: 0,
    targetArea: "",
    targetLat: 0,
    targetLng: 0,
    droneId: "",
    description: "",
  });

  const fetchMissions = async () => {
    try {
      const res = await API.get("/missions");
      const missionsData = res.data?.data || [];
      setMissions(missionsData);
      saveCache("missions_cache", missionsData);
    } catch (err) {
      console.error("Online missions fetch failed:", err);
      const cached = loadCache("missions_cache");
      if (cached?.data) setMissions(cached.data);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestId = params.get("requestId");
    const droneId = params.get("droneId");

    if (!requestId) return;

    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/emergency-requests/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const req = data.data ?? data;

        setForm((prev) => ({
          ...prev,
          type: req.type || prev.type,
          urgency: req.urgency || prev.urgency,
          description: req.description || "",
          locationName: req.fromLocation?.name || req.location?.name || "",
          lat: req.fromLocation?.lat || req.location?.lat || 0,
          lng: req.fromLocation?.lng || req.location?.lng || 0,
          targetArea: req.location?.name || "",
          targetLat: req.location?.lat || 0,
          targetLng: req.location?.lng || 0,
          droneId: droneId || "",
          status: "assigned",
        }));

        setOpen(true);
      })
      .catch((e) => console.error("Failed to prefill mission form:", e));
  }, [location.search]);

  useEffect(() => {
    const saved = sessionStorage.getItem("assignedDrone");

    if (saved) {
      const parsed = JSON.parse(saved);
      setForm((prev) => ({
        ...prev,
        droneId: parsed.droneId || "",
      }));
    }
  }, [open]);

  useEffect(() => {
    const runSync = async () => {
      try {
        const result = await syncPendingMissions();

        if (result && result.synced > 0) {
          alert(`🟢 ${result.synced} offline mission(s) synchronized`);
          fetchMissions();
        }
      } catch (err) {
        console.error("Background replication failed:", err);
      }
    };

    runSync();

    const interval = setInterval(runSync, 30000);
    window.addEventListener("online", runSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", runSync);
    };
  }, []);

  useEffect(() => {
    const notifiedMissions = new Set<string>();

    const checkStartTimes = () => {
      const now = new Date();

      missions.forEach((mission: any) => {
        if (!mission.startTime) return;
        if (!mission._id) return;
        if (notifiedMissions.has(mission._id)) return;
        if (mission.status !== "assigned") return;

        const startTime = new Date(mission.startTime);
        const diffMs = startTime.getTime() - now.getTime();
        const diffMinutes = diffMs / 1000 / 60;

        if (diffMinutes > 0 && diffMinutes <= 5) {
          notifiedMissions.add(mission._id);

          if (Notification.permission === "granted") {
            new Notification("⚡ Mission Starting Soon", {
              body: `"${mission.title || mission.type}" starts in ${Math.ceil(diffMinutes)} minute(s). Redirecting to Controle...`,
              icon: "/favicon.ico",
            });
          } else {
            alert(`⚡ Mission "${mission.title || mission.type}" starts in ${Math.ceil(diffMinutes)} minute(s)!`);
          }

          setTimeout(() => {
            navigate(`/controle?missionId=${mission._id}`);
          }, 3000);
        }
      });
    };

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(checkStartTimes, 30000);
    checkStartTimes();

    return () => clearInterval(interval);
  }, [missions, navigate]);

  const handleAddMission = async () => {
    try {
      if (!form.locationName.trim()) {
        alert("Departure location is required");
        return;
      }

      if (!form.startTime) {
        alert("Mission start time is required");
        return;
      }

      if (Number(form.lat) < -90 || Number(form.lat) > 90) {
        alert("Latitude must be between -90 and 90");
        return;
      }

      if (Number(form.lng) < -180 || Number(form.lng) > 180) {
        alert("Longitude must be between -180 and 180");
        return;
      }

      const missionData = {
        title: form.title || form.type,
        type: form.type,
        status: "assigned",
        payloadWeight: Number(form.payloadWeight),
        urgency: form.urgency,
        startTime: form.startTime,
        description: form.description,
        drone: form.droneId || undefined,

        departureLocation: {
          name: form.locationName,
          lat: Number(form.lat),
          lng: Number(form.lng),
        },

        targetArea: {
          name: form.targetArea,
          lat: Number(form.targetLat),
          lng: Number(form.targetLng),
        },
      };

      console.log("SENDING MISSION:", missionData);

      if (isEditing && editingMissionId) {
        await API.put(`/missions/${editingMissionId}`, missionData);
        alert("Mission updated ✅");
      } else {
        const pendingMission = savePendingMission(missionData);

        try {
          updatePendingMissionStatus(pendingMission.localId, "syncing");

          await API.post("/missions", missionData);

          removePendingMission(pendingMission.localId);
          sessionStorage.removeItem("assignedDrone");

          if (form.droneId) {
            const token = localStorage.getItem("token");

            await fetch(`http://localhost:5000/api/drones/${form.droneId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                status: "assigned",
                assignedMissionName: form.title || form.type,
                assignedAt: new Date().toISOString(),
              }),
            });
          }

          alert("🟢 Mission synchronized successfully");
        } catch (syncError) {
          console.error(syncError);
          updatePendingMissionStatus(pendingMission.localId, "sync_failed");
          alert("🟡 Mission saved locally. Waiting for network...");
        }
      }

      await fetchMissions();

      setOpen(false);
      setIsEditing(false);
      setEditingMissionId(null);
    } catch (err: any) {
      console.error("Mission creation workflow failed:", err);
    }
  };

  const handleDisableMission = async () => {
    try {
      const finalReason = disableReason === "other" ? otherReason : disableReason;

      await API.patch(`/missions/${selectedMission._id}/disable`, {
        reason: finalReason,
      });

      setMissions((prev) => prev.filter((m) => m._id !== selectedMission._id));

      setShowDisableModal(false);
      setDisableReason("");
      setOtherReason("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditMission = (mission: any) => {
    setIsEditing(true);
    setEditingMissionId(mission._id);

    setForm({
      title: mission.title || "",
      type: mission.type || "SAR",
      status: mission.status || "assigned",
      payloadWeight: mission.payloadWeight || 0,
      urgency: mission.urgency || "Low",
      startTime: mission.startTime ? mission.startTime.slice(0, 16) : "",
      locationName: mission.departureLocation?.name || "",
      lat: mission.departureLocation?.lat || 0,
      lng: mission.departureLocation?.lng || 0,
      targetArea: mission.targetArea?.name || "",
      targetLat: mission.targetArea?.lat || 0,
      targetLng: mission.targetArea?.lng || 0,
      droneId: mission.drone?._id || mission.drone || "",
      description: mission.description || "",
    });

    setOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: "",
      type: "SAR",
      status: "assigned",
      payloadWeight: 0,
      urgency: "Low",
      startTime: "",
      locationName: "",
      lat: 0,
      lng: 0,
      targetArea: "",
      targetLat: 0,
      targetLng: 0,
      droneId: "",
      description: "",
    });
  };

  return (
    <div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-green-500/10 p-6 text-white"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <span>🎯</span> {isEditing ? "Edit Mission" : "New Mission"}
              </h2>

              <p className="text-sm text-white/60">
                {isEditing
                  ? "Update this mission information and save the changes."
                  : "Create a new mission and dispatch it to your fleet."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:col-span-2">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">
                    1
                  </span>
                  Mission Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Mission Title" full>
                    <input
                      className={inputCls}
                      placeholder="Rescue operation #1"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </Field>

                  <Field label="Type">
                    <select
                      className={inputCls}
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="SAR">Search & Rescue</option>
                      <option value="logistics">Remote Logistics</option>
                      <option value="oilgas">Oil & Gas Monitoring</option>
                      <option value="industrial">Industrial Inspection</option>
                      <option value="security">Security Patrol</option>
                    </select>
                  </Field>

                  <Field label="Status">
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value.toLowerCase() })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </Field>

                  <Field label="Payload Weight (kg)">
                    <input
                      className={inputCls}
                      type="number"
                      value={form.payloadWeight}
                      onChange={(e) =>
                        setForm({ ...form, payloadWeight: Number(e.target.value) })
                      }
                    />
                  </Field>

                  <Field label="Urgency">
                    <select
                      className={inputCls}
                      value={form.urgency}
                      onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </Field>

                  <Field label="Start time">
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </Field>

                  {form.droneId && (
                    <Field label="Assigned Drone">
                      <input
                        className={inputCls}
                        value={form.droneId}
                        readOnly
                        style={{ opacity: 0.6, cursor: "not-allowed" }}
                      />

                      <p className="text-xs text-yellow-400/80 mt-1">
                        ⚡ Auto-assigned from Mission Intelligence
                      </p>
                    </Field>
                  )}

                  <Field label="Description" full>
                    <textarea
                      className={inputCls}
                      rows={3}
                      placeholder="Mission description..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">
                    2
                  </span>
                  Departure Location
                </h3>

                <div className="space-y-3">
                  <Field label="Location Name">
                    <input
                      className={inputCls}
                      placeholder="Base Alpha"
                      value={form.locationName}
                      onChange={(e) =>
                        setForm({ ...form, locationName: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Latitude">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="35.6971"
                      value={form.lat}
                      onChange={(e) =>
                        setForm({ ...form, lat: Number(e.target.value) })
                      }
                    />
                  </Field>

                  <Field label="Longitude">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="-0.6308"
                      value={form.lng}
                      onChange={(e) =>
                        setForm({ ...form, lng: Number(e.target.value) })
                      }
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">
                    3
                  </span>
                  Target Area
                </h3>

                <div className="space-y-3">
                  <Field label="Target area name">
                    <input
                      className={inputCls}
                      placeholder="Sector 7"
                      value={form.targetArea}
                      onChange={(e) =>
                        setForm({ ...form, targetArea: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Target latitude">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.targetLat}
                      onChange={(e) =>
                        setForm({ ...form, targetLat: Number(e.target.value) })
                      }
                    />
                  </Field>

                  <Field label="Target longitude">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.targetLng}
                      onChange={(e) =>
                        setForm({ ...form, targetLng: Number(e.target.value) })
                      }
                    />
                  </Field>

                  <p className="text-xs text-green-400/80">
                    Mission destination coordinates.
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition"
              >
                ⊗ Cancel
              </button>

              <button
                onClick={handleAddMission}
                className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-lg shadow-green-500/30 transition"
              >
                {isEditing ? "Save Mission Changes" : "Launch mission"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AppShell>
        <Glass className="overflow-hidden">
          <div className="flex items-center justify-between bg-black/40 px-6 py-4">
            <h2 className="text-2xl font-semibold text-white/80">All missions</h2>

            <button
              onClick={() => {
                setIsEditing(false);
                setEditingMissionId(null);
                resetForm();
                setOpen(true);
              }}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
            >
              + new mission
            </button>
          </div>

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

          <ul>
            {missions?.map((m) => (
              <li
                key={m._id}
                className="grid grid-cols-[0.5fr_1fr_1fr_0.8fr_1fr_1.2fr_1.2fr_1.2fr_1.4fr] items-center gap-6 px-8 py-5 border-b border-white/5 hover:bg-white/[0.03] transition-all"
              >
                <div className="font-medium text-white/80">
                  {m._id?.slice(-5) || "N/A"}
                </div>

                <div className="font-medium text-white/90">
                  <TypeCell type={m.type} />
                </div>

                <div className="font-medium text-white/90">
                  <StatusPill status={m.status} />
                </div>

                <div className="font-medium text-white/85">
                  {m.payloadWeight} kg
                </div>

                <div className="font-medium text-white/80">
                  <UrgencyPill urgency={m.urgency} />
                </div>

                <div className="font-medium text-white/80">
                  {m.startTime
                    ? new Date(m.startTime).toLocaleString()
                    : m.startedAt
                    ? new Date(m.startedAt).toLocaleString()
                    : m.createdAt
                    ? new Date(m.createdAt).toLocaleString()
                    : "—"}
                </div>

                <div className="font-medium text-white/80">
                  📍 {m.departureLocation?.lat || 0}, {m.departureLocation?.lng || 0}
                </div>

                <div className="font-medium text-white/80">
                  🎯 {m.targetArea?.lat || 0}, {m.targetArea?.lng || 0}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditMission(m)}
                    className="rounded-xl bg-green-500/90 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-green-400 active:scale-95"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => navigate(`/missions/${m._id}/history`)}
                    className="rounded-xl bg-blue-500/90 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-400 active:scale-95"
                  >
                    History
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMission(m);
                      setShowDisableModal(true);
                    }}
                    className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-red-400 active:scale-95"
                  >
                    Disable
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Glass>

        {showDisableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/95 p-6 shadow-2xl shadow-black/50 transition-all duration-200 text-white">
              <div className="mb-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                  <span className="text-rose-500">🛑</span> Disable Mission
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Please select a reason below to halt this mission safely.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  ["weather_conditions", "⛅ Weather conditions"],
                  ["drone_malfunction", "🤖 Drone malfunction"],
                  ["low_battery", "🔋 Low battery"],
                  ["other", "✏️ Other reason"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setDisableReason(value)}
                    className={`w-full rounded-xl p-3.5 text-sm font-medium text-left border transition-all duration-200 ${
                      disableReason === value
                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                        : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}

                {disableReason === "other" && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Provide operational context..."
                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700 p-3 text-sm text-slate-200 outline-none focus:border-blue-500 transition-all placeholder:text-slate-500 min-h-[80px]"
                  />
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDisableModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 border border-slate-700/80 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                >
                  Cancel
                </button>

                <button
                  disabled={!disableReason || (disableReason === "other" && !otherReason)}
                  onClick={handleDisableMission}
                  className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-500 disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-rose-900/20"
                >
                  Confirm Disable
                </button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </div>
  );
}