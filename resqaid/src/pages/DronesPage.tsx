import { MapPin, Trash2, Pencil, Gauge, ChevronDown } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";
import DroneIcon from "@/components/DroneIcon";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "@/api";
import { saveCache, loadCache } from "@/utils/offlineCache";
import { Package, Shield, Wrench, Search } from "lucide-react";

type Status = "in_mission" | "assigned" | "disabled" | "idle";

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    in_mission: "bg-blue-500/15 text-blue-300 border border-blue-400/30",
    assigned:   "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30",
    disabled:   "bg-red-500/15 text-red-300 border border-red-400/30",
    idle:       "bg-green-500/15 text-green-300 border border-green-400/30",
  };

  const labels: Record<Status, string> = {
    in_mission: "In Mission",
    assigned:   "Assigned",
    disabled:   "Disabled",
    idle:       "Idle",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-5 py-1.5 text-base font-bold uppercase tracking-wider ${styles[status] ?? "bg-white/10 text-white/60"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

// ─── Type Cell (table display) ────────────────────────────────────────────────
function TypeCell({ type }: { type: string }) {
  const normalizedType = type?.toLowerCase().trim().replace(/\s+/g, "_");

  const config: Record<string, { icon: React.ReactNode; label: string }> = {
    camera_quadcopter: { icon: <Shield className="h-5 w-5 text-purple-400" />, label: "Camera Quadcopter" },
    thermal_drone:     { icon: <Search className="h-5 w-5 text-cyan-400" />,   label: "Thermal Drone" },
    fixed_wing:        { icon: <Wrench className="h-5 w-5 text-blue-400" />,   label: "Fixed-Wing Drone" },
    vtol_hybrid:       { icon: <Package className="h-5 w-5 text-yellow-400" />, label: "VTOL Hybrid" },
    sensor_drone:      { icon: <Gauge className="h-5 w-5 text-orange-500" />,  label: "Sensor Drone" },
    industrial:        { icon: <Wrench className="h-5 w-5 text-blue-400" />,   label: "Industrial Drone" },
    security:          { icon: <Shield className="h-5 w-5 text-purple-400" />, label: "Security Drone" },
    sar:               { icon: <Search className="h-5 w-5 text-cyan-400" />,   label: "Search & Rescue" },
  };

  const { icon, label } = config[normalizedType] ?? { icon: null, label: type };

  return (
    <div className="flex items-center gap-2.5 text-base font-semibold text-white/95">
      <div className="shrink-0">{icon}</div>
      <span className="truncate">{label}</span>
    </div>
  );
}

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm border border-white/10 text-white transition hover:border-green-400/50 focus:outline-none"
        style={{ background: "#0f141c" }}
      >
        <span>{selected?.label ?? "Select…"}</span>
        <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: "#0f141c" }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer transition hover:bg-white/10 ${
                opt.value === value ? "text-green-400 font-semibold" : "text-white/90"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TYPE_OPTIONS = [
  { value: "camera_quadcopter", label: "Camera Quadcopter" },
  { value: "thermal_drone",     label: "Thermal Drone" },
  { value: "fixed_wing",        label: "Fixed-Wing Drone" },
  { value: "vtol_hybrid",       label: "VTOL Hybrid" },
  { value: "sensor_drone",      label: "Sensor Drone" },
];

const STATUS_OPTIONS = [
  { value: "idle",       label: "Idle (Available)" },
  { value: "assigned",   label: "Assigned" },
  { value: "in_mission", label: "In Mission" },
  { value: "disabled",   label: "Disabled" },
];

// ─── HELPER FOR RESETTING FORM STATE AS STRINGS ──────────────────────────────────────
const getInitialFormState = () => ({
  name: "",
  type: "camera_quadcopter",
  status: "idle",
  speed: "0",
  maxRange: "0",
  payloadCapacity: "0",
  battery: "100",
  lat: "0",
  lng: "0",
  alt: "0",
  baseLat: "0",
  baseLng: "0",
  baseAlt: "0",
});

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DronesPage() {
  const navigate = useNavigate();
  const [selectedDrone, setSelectedDrone] = useState<any>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableReason, setDisableReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  // FIXED: All fields initialized as clean strings to prevent breaking inputs on negative numbers (-)
  const [form, setForm] = useState(getInitialFormState());

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDroneId, setEditingDroneId] = useState<string | null>(null);
  const [drones, setDrones] = useState([]);

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const res = await API.get("/drones");
        const dronesData = res.data?.data || [];
        setDrones(dronesData);
        saveCache("drones_cache", dronesData);
      } catch (err) {
        console.error("Online drones fetch failed:", err);
        const cached = loadCache("drones_cache");
        if (cached?.data) {
          setDrones(cached.data);
          alert("Offline mode: showing cached drones");
        }
      }
    };
    fetchDrones();
  }, []);

  const handleAddDrone = async () => {
    try {
      // FIXED: Convert all numeric string fields using parseFloat/Number cleanly before transmission
      const droneData = {
        name: form.name,
        type: form.type,
        status: form.status,
        speed: Number(form.speed) || 0,
        maxRange: Number(form.maxRange) || 0,
        payloadCapacity: Number(form.payloadCapacity) || 0,
        battery: Number(form.battery) || 0,
        location: { 
          lat: parseFloat(form.lat) || 0, 
          lng: parseFloat(form.lng) || 0, 
          alt: parseFloat(form.alt) || 0 
        },
        homeBase: { 
          lat: parseFloat(form.baseLat) || 0, 
          lng: parseFloat(form.baseLng) || 0, 
          alt: parseFloat(form.baseAlt) || 0 
        },
      };

      if (isEditing && editingDroneId) {
        await API.put(`/drones/${editingDroneId}`, droneData);
        alert("Drone updated ✅");
      } else {
        await API.post("/drones", droneData);
        alert("Drone added ✅");
      }

      const list = await API.get("/drones");
      setDrones(list.data?.drones || list.data?.data || list.data || []);
      setOpen(false);
      setIsEditing(false);
      setEditingDroneId(null);
      setForm(getInitialFormState());
    } catch (err: any) {
      console.log("❌ BACKEND:", err.response?.data);
      alert(err.response?.data?.message || "Error saving drone");
    }
  };

  const handleDisableDrone = async () => {
    try {
      const finalReason = disableReason === "Other" ? otherReason : disableReason;
      await API.patch(`/drones/${selectedDrone._id}/disable`, { reason: finalReason });
      setDrones((prev) => prev.filter((d) => d._id !== selectedDrone._id));
      setShowDisableModal(false);
      setDisableReason("");
      setOtherReason("");
      setSelectedDrone(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (drone: any) => {
    setIsEditing(true);
    setEditingDroneId(drone._id);
    // FIXED: Form state loaded with String wrappers so editing negative metrics functions cleanly
    setForm({
      name: drone.name || "",
      type: drone.type || "camera_quadcopter",
      status: drone.status || "idle",
      speed: String(drone.speed ?? 0),
      maxRange: String(drone.maxRange ?? 0),
      payloadCapacity: String(drone.payloadCapacity ?? 0),
      battery: String(drone.battery ?? 100),
      lat: String(drone.location?.lat ?? 0),
      lng: String(drone.location?.lng ?? 0),
      alt: String(drone.location?.alt ?? 0),
      baseLat: String(drone.homeBase?.lat ?? 0),
      baseLng: String(drone.homeBase?.lng ?? 0),
      baseAlt: String(drone.homeBase?.alt ?? 0),
    });
    setOpen(true);
  };

  return (
    <div>
      {/* ── Add / Edit Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => {
            setOpen(false);
            setIsEditing(false);
            setEditingDroneId(null);
            setForm(getInitialFormState());
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f141c]/95 backdrop-blur-2xl shadow-2xl shadow-green-500/10 p-6 text-white"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <DroneIcon className="w-10 h-10 shrink-0 mr-2" />
                {isEditing ? "Edit Drone" : "Add New Drone"}
              </h2>
              <p className="text-sm text-white/60">
                {isEditing
                  ? "Update this drone information and save the changes."
                  : "Register a new drone to your fleet for mission deployment."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Basic Info */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">1</span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Drone name">
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Field>

                  <Field label="Drone type">
                    <CustomSelect
                      value={form.type}
                      onChange={(val) => setForm({ ...form, type: val })}
                      options={TYPE_OPTIONS}
                    />
                  </Field>

                  <Field label="Status" full>
                    <CustomSelect
                      value={form.status}
                      onChange={(val) => setForm({ ...form, status: val })}
                      options={STATUS_OPTIONS}
                    />
                  </Field>
                </div>
              </section>

              {/* 4. Home Base */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">4</span>
                  Home Base
                </h3>
                <div className="space-y-3">
                  {/* FIXED: Removed type="number" and immediate numeric parsing */}
                  <Field label="Latitude">
                    <input type="text" className={inputCls} value={form.baseLat} onChange={(e) => setForm({ ...form, baseLat: e.target.value })} />
                  </Field>
                  <Field label="Longitude">
                    <input type="text" className={inputCls} value={form.baseLng} onChange={(e) => setForm({ ...form, baseLng: e.target.value })} />
                  </Field>
                  <Field label="Altitude">
                    <input type="text" className={inputCls} value={form.baseAlt} onChange={(e) => setForm({ ...form, baseAlt: e.target.value })} />
                  </Field>
                  <p className="text-xs text-green-400/80">This is the drone's home base GPS position.</p>
                </div>
              </section>

              {/* 2. Performance */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">2</span>
                  Performance Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* FIXED: Removed type="number" and immediate numeric parsing */}
                  <Field label="Speed (m/s)">
                    <input className={inputCls} type="text" value={form.speed} onChange={(e) => setForm({ ...form, speed: e.target.value })} />
                  </Field>
                  <Field label="Max range">
                    <input className={inputCls} type="text" value={form.maxRange} onChange={(e) => setForm({ ...form, maxRange: e.target.value })} />
                  </Field>
                  <Field label="Payload Capacity (kg)">
                    <input className={inputCls} type="text" value={form.payloadCapacity} onChange={(e) => setForm({ ...form, payloadCapacity: e.target.value })} />
                  </Field>
                  <Field label="Battery (%)">
                    <input className={inputCls} type="text" value={form.battery} onChange={(e) => setForm({ ...form, battery: e.target.value })} />
                  </Field>
                </div>
              </section>

              {/* 3. Current Location */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">3</span>
                  Current Location
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* FIXED: Removed immediate numeric parsing */}
                  <Field label="Latitude">
                    <input type="text" className={inputCls} value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                  </Field>
                  <Field label="Longitude">
                    <input type="text" className={inputCls} value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
                  </Field>
                  <Field label="Altitude (m)">
                    <input type="text" className={inputCls} value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
                  </Field>
                </div>
                <p className="text-xs text-green-400/80 mt-3">This is the drone's current GPS position.</p>
              </section>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => { setOpen(false); setIsEditing(false); setEditingDroneId(null); setForm(getInitialFormState()); }}
                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition"
              >
                ⊗ Cancel
              </button>
              <button
                onClick={handleAddDrone}
                className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-lg shadow-green-500/30 transition"
              >
                {isEditing ? "Save Drone Changes" : "Add drone to your base"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AppShell>
        <Glass className="overflow-hidden">
          <div className="flex items-center justify-between bg-black/40 px-6 py-4">
            <h2 className="text-2xl font-semibold text-white/80">All drones</h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingDroneId(null);
                setForm(getInitialFormState());
                setOpen(true);
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              + Add drone
            </button>
          </div>

          <div className="grid grid-cols-[0.6fr_1.5fr_1fr_0.8fr_1fr_1.4fr] items-center gap-6 border-b border-white/10 bg-black/30 px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white/80">
            <div>ID</div>
            <div>Type</div>
            <div>Status</div>
            <div>Battery</div>
            <div>Location</div>
            <div className="text-right">Actions</div>
          </div>

          <ul className="divide-y text-white/70 divide-white/5">
            {drones?.map((d) => (
              <li
                key={d._id}
                className="grid grid-cols-[0.6fr_1.5fr_1fr_0.8fr_1fr_1.4fr] items-center gap-6 px-8 py-6 border-b border-white/5 text-base text-white/80 transition-all duration-300 hover:bg-white/[0.04]"
              >
                <div className="font-semibold text-base text-white/90">{d._id ? d._id.slice(-5) : "N/A"}</div>

                <div>
                  <TypeCell type={d.type} />
                </div>

                <div className="flex flex-col items-start gap-1">
                  <StatusPill status={(d.status || "idle").toLowerCase() as Status} />
                  {d.status === "assigned" && d.assignedMissionName && (
                    <span className="text-sm text-yellow-300/90 font-semibold block">📋 {d.assignedMissionName}</span>
                  )}
                  {d.status === "assigned" && d.assignedAt && (
                    <span className="text-xs text-white/40 block">
                      {new Date(d.assignedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                <div className="font-semibold text-base text-white/90">{d.battery}%</div>

                <div className="flex items-center gap-2 text-base font-medium text-white/90">
                  <MapPin className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="truncate">{d.location ? `${d.location.lat}, ${d.location.lng}` : "No location"}</span>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setSelectedDrone(d); setShowDisableModal(true); }}
                    className="rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-red-400 active:scale-95"
                  >
                    Disable
                  </button>
                  <button
                    onClick={() => handleEdit(d)}
                    className="rounded-xl bg-green-500/90 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-green-400 active:scale-95 flex items-center gap-1"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/drones/${d._id}/history`)}
                    className="rounded-xl bg-blue-500/90 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-400 active:scale-95"
                  >
                    History
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Glass>

        {/* ── Disable Modal ── */}
        {showDisableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="max-w-[440px] w-full rounded-2xl border border-white/5 bg-[#0f141c]/90 p-7 backdrop-blur-xl shadow-2xl text-white">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#f44336] shadow-[0_0_12px_#f44336] shrink-0" />
                  Disable Drone
                </h2>
                <p className="text-[12px] text-white/40 mt-1 leading-normal">
                  Please select a reason below to halt this drone safely.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { value: "crashed",       emoji: "⛅", label: "Weather conditions" },
                  { value: "destroyed",     emoji: "🛡️", label: "Drone malfunction" },
                  { value: "out_of_service",emoji: "🔋", label: "Low battery" },
                  { value: "other",         emoji: "⚡", label: "Other reason" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDisableReason(opt.value)}
                    className={`w-full rounded-xl p-3 text-left text-[13px] font-medium transition-all duration-200 flex items-center gap-2.5 ${
                      disableReason === opt.value
                        ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/10"
                        : "bg-[#161b26] text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{opt.emoji}</span> {opt.label}
                  </button>
                ))}

                {disableReason === "other" && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Write reason..."
                    className="w-full rounded-xl bg-black/40 border border-white/5 p-3 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/50 mt-1 h-16 resize-none transition"
                  />
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setShowDisableModal(false); setDisableReason(""); setOtherReason(""); }}
                  className="flex-1 rounded-xl bg-[#1e2533] hover:bg-[#252e3f] py-3 text-xs font-semibold text-white/80 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={!disableReason || (disableReason === "other" && !otherReason)}
                  onClick={handleDisableDrone}
                  className="flex-1 rounded-xl bg-[#e11d48] hover:bg-[#f43f5e] py-3 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
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

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md text-white placeholder-white/40 focus:outline-none focus:border-green-400/60 focus:bg-white/10 transition";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs uppercase tracking-wide text-white/60 mb-1">{label}</label>
      {children}
    </div>
  );
}