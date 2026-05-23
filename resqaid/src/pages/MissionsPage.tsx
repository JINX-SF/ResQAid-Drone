import { Package } from "lucide-react";
import { Glass } from "@/components/AppShell";
import AppShell from "@/components/AppShell";

import { useEffect, useState } from "react";
import API from "@/api";
import { useNavigate } from "react-router-dom";

type Status = "completed" | "assigned" | "pending" | "active";
type Urgency = "critical" | "minor" | "low";
type MType = "Search & rescue" | "Delivery";

type Mission = {
  _id: string;
  type: string;
  status: "completed" | "assigned" | "pending" | "active";
  payloadWeight: number;
  urgency: "critical" | "minor" | "low";
  startTime: string;

  departureLocation?: {
    lat: number;
    lng: number;
  };

  targetArea?: {
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
    <span
      className={`inline-flex w-fit items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur-md ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function UrgencyPill({ urgency }: { urgency: string }) {
  const key = (urgency || "").toLowerCase();

  const styles: any = {
    low: {
      cls: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    },
    medium: {
      cls: "bg-yellow-500/15 text-yellow-100 border border-yellow-400/30",
    },
    high: {
      cls: "bg-orange-500/15 text-orange-100 border border-orange-400/30",
    },
    critical: {
      cls: "bg-red-500/15 text-red-100 border border-red-400/30",
    },
  };

  const style = styles[key] || styles.low;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide backdrop-blur-md ${style.cls}`}
    >
      {urgency}
    </span>
  );
}

function TypeCell({ type }: { type: MType }) {
  if (type === "Delivery") {
    return (
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-warning" />
        <span>Delivery</span>
      </div>
    );
  }
  return <span>Search &amp; rescue</span>;
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
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [disableReason, setDisableReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const navigate = useNavigate();
  const [missions, setMissions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "SAR",
    status: "pending",
    payloadWeight: 0,
    urgency: "Low",
    startTime: "",
    locationName: "",
    lat: 0,
    lng: 0,
    targetArea: "",
    targetLat: 0,
    targetLng: 0,
  });

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await API.get("/missions");
        console.log("MISSIONS RESPONSE:", res.data);
        setMissions(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMissions();
  }, []);

  const handleAddMission = async () => {
    try {
      const missionData = {
        title: form.title || form.type,
        type: form.type,
        status: form.status,
        payloadWeight: Number(form.payloadWeight),
        urgency: form.urgency,
        startTime: form.startTime,
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
        await API.post("/missions", missionData);
        alert("Mission added ✅");
      }

      const res = await API.get("/missions");
      setMissions(res.data?.missions || res.data?.data || res.data || []);
      setOpen(false);
      setIsEditing(false);
      setEditingMissionId(null);
    } catch (err: any) {
      console.log("BACKEND ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Error adding mission");
    }
  };

  const handleDisableMission = async () => {
    try {
      const finalReason =
        disableReason === "other" ? otherReason : disableReason;

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

  const disableMission = async (id: string) => {
    try {
      await API.patch(`/missions/${id}/disable`);
      setMissions((prev: any) => prev.filter((m: any) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditMission = (mission: any) => {
    setIsEditing(true);
    setEditingMissionId(mission._id);
    setForm({
      title: mission.title || "",
      type: mission.type || "SAR",
      status: mission.status || "pending",
      payloadWeight: mission.payloadWeight || 0,
      urgency: mission.urgency || "Low",
      startTime: mission.startTime ? mission.startTime.slice(0, 16) : "",
      locationName: mission.departureLocation?.name || "",
      lat: mission.departureLocation?.lat || 0,
      lng: mission.departureLocation?.lng || 0,
      targetArea: mission.targetArea?.name || "",
      targetLat: mission.targetArea?.lat || 0,
      targetLng: mission.targetArea?.lng || 0,
    });
    setOpen(true);
  };

  return (
    <div>
      {/* New / Edit Mission Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-green-500/10 p-6 text-white"
          >
            {/* Header */}
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
              {/* 1. Mission Info */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:col-span-2">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">1</span>
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

                  <select
                    className={inputCls}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="SAR">Search & rescue</option>
                    <option value="delivery">Delivery</option>
                  </select>

                  <Field label="Status">
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value.toLowerCase() })}
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </Field>

                  <input
                    className={inputCls}
                    type="number"
                    value={form.payloadWeight}
                    onChange={(e) => setForm({ ...form, payloadWeight: Number(e.target.value) })}
                  />

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
                </div>
              </section>

              {/* 2. Location */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">2</span>
                  Departure Location
                </h3>
                <div className="space-y-3">
                  <Field label="Location">
                    <input
                      className={inputCls}
                      value={`📍 ${form.lat}, ${form.lng}`}
                      readOnly
                    />
                  </Field>
                  <Field label="Latitude">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="35.6971"
                      value={form.lat}
                      onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="-0.6308"
                      value={form.lng}
                      onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              </section>

              {/* 3. Target Area */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">3</span>
                  Target Area
                </h3>
                <div className="space-y-3">
                  <Field label="Target area">
                    <input
                      className={inputCls}
                      value={form.targetArea}
                      onChange={(e) => setForm({ ...form, targetArea: e.target.value })}
                    />
                  </Field>
                  <Field label="Target latitude">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.targetLat}
                      onChange={(e) => setForm({ ...form, targetLat: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Target longitude">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.targetLng}
                      onChange={(e) => setForm({ ...form, targetLng: Number(e.target.value) })}
                    />
                  </Field>
                  <p className="text-xs text-green-400/80">Mission destination coordinates.</p>
                </div>
              </section>
            </div>

            {/* Footer */}
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
                setForm({
                  title: "",
                  type: "SAR",
                  status: "pending",
                  payloadWeight: 0,
                  urgency: "Low",
                  startTime: "",
                  locationName: "",
                  lat: 0,
                  lng: 0,
                  targetArea: "",
                  targetLat: 0,
                  targetLng: 0,
                });
                setOpen(true);
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              +new mission
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
          </div>

          <ul>
            {missions?.map((m) => (
              <li
                key={m._id}
                className="grid grid-cols-[0.5fr_1fr_1fr_0.8fr_1fr_1.2fr_1.2fr_1.2fr_1.4fr] items-center gap-6 px-8 py-5 border-b border-white/5 hover:bg-white/[0.03] transition-all"
              >
                <div className="font-medium text-white/80">{m._id.slice(-5)}</div>
                <div className="font-medium text-white/90">{m.type}</div>
                <div className="font-medium text-white/90"><StatusPill status={m.status} /></div>
                <div className="font-medium text-white/85">{m.payloadWeight} kg</div>
                <div className="font-medium text-white/80"><UrgencyPill urgency={m.urgency} /></div>
                <div className="font-medium text-white/80">
                  {m.startedAt
                    ? new Date(m.startedAt).toLocaleString()
                    : m.createdAt
                      ? new Date(m.createdAt).toLocaleString()
                      : "—"}
                </div>
                <div className="font-medium text-white/80">📍 {m.departureLocation?.lat}, {m.departureLocation?.lng}</div>
                <div className="font-medium text-white/80">🎯 {m.targetArea?.lat}, {m.targetArea?.lng}</div>

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
                      disableMission(m._id);
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

        {/* REDESIGNED PROFESSIONAL BLUE/GREY DISABLE MODAL */}
        {showDisableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/95 p-6 shadow-2xl shadow-black/50 transition-all duration-200 text-white">
              
              <div className="mb-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                  <span className="text-rose-500">🛑</span> Disable Mission
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Please select a dynamic reason below to halt this automated deployment status safely.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setDisableReason("weather_conditions")}
                  className={`w-full rounded-xl p-3.5 text-sm font-medium text-left border transition-all duration-200 ${
                    disableReason === "weather_conditions"
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  ⛅ Weather conditions
                </button>

                <button
                  onClick={() => setDisableReason("drone_malfunction")}
                  className={`w-full rounded-xl p-3.5 text-sm font-medium text-left border transition-all duration-200 ${
                    disableReason === "drone_malfunction"
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  🤖 Drone malfunction
                </button>

                <button
                  onClick={() => setDisableReason("low_battery")}
                  className={`w-full rounded-xl p-3.5 text-sm font-medium text-left border transition-all duration-200 ${
                    disableReason === "low_battery"
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  🔋 Low battery
                </button>

                <button
                  onClick={() => setDisableReason("other")}
                  className={`w-full rounded-xl p-3.5 text-sm font-medium text-left border transition-all duration-200 ${
                    disableReason === "other"
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  ✏️ Other reason
                </button>

                {disableReason === "other" && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Provide continuous logging or operational context details..."
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