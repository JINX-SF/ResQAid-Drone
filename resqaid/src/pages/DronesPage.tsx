import { MapPin, Trash2, Pencil, Gauge } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";
import DroneIcon from "@/components/DroneIcon";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/api";
import { saveCache, loadCache } from "@/utils/offlineCache";
import { Package, Shield, ShieldCheck, Wrench, Search } from "lucide-react";
type Status = "in_mission" | "assigned" | "disabled"| "idle";
type DType = "Search & rescue" | "Remote logistics" | "General" | "industrial inspection" |"oil & gas" | "Security Patrol";




function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    "in_mission": "bg-blue-500/15 text-blue-300 border border-blue-400/30",    // blue
"assigned":   "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30", // yellow
"disabled":   "bg-red-500/15 text-red-300 border border-red-400/30",
"idle":         "bg-green-500/15 text-green-300 border border-green-400/30",  // green ✅
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-xl
        px-4
        py-2
        text-sm
        font-bold
        uppercase
        tracking-wide
        backdrop-blur-md
        ${styles[status]}
      `}
    >
      {status}
    </span>
  );
}

function TypeCell({ type }: { type: DType }) {
  const config: Record<DType, { icon: React.ReactNode; label: string }> = {
    "Search & rescue":       { icon: <Search   className="h-5 w-5 text-cyan-400" />,   label: "Search & rescue" },
    "Remote logistics":      { icon: <Package  className="h-5 w-5 text-yellow-400" />, label: "Remote logistics" },
    "General":               { icon: <ShieldCheck className="h-5 w-5 text-blue-400" />, label: "General" },
    "industrial inspection": { icon: <Wrench   className="h-5 w-5 text-orange-400" />, label: "Industrial inspection" },
    "oil & gas":             { icon: <Gauge  className="h-5 w-5 text-green-400" />, label: "Oil & Gas" },
    "Security Patrol":       { icon: <Shield   className="h-5 w-5 text-red-400" />,    label: "Security Patrol" },
  };

  const { icon, label } = config[type] ?? { icon: null, label: type };

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  );
}
export default function DronesPage() {
  const navigate = useNavigate();
const [selectedDrone, setSelectedDrone] = useState<any>(null);

const [showDisableModal, setShowDisableModal] = useState(false);

const [disableReason, setDisableReason] = useState("");

const [otherReason, setOtherReason] = useState("");

  const [form, setForm] = useState({
  name: "",
  type: "SAR",
  status: "idle",

  speed: 0,
  maxRange: 0,
  payloadCapacity: 0,
  battery: 100,

  lat: 0,
  lng: 0,
  alt: 0,

  baseLat: 0,
  baseLng: 0,
  baseAlt: 0,
});


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
  Trash2

  fetchDrones();
}, []);

/*const handleAddDrone = async () => {
  try {
    await API.post("/drones", {
      name: "Drone X",
      type: "delivery",
      status:  "idle",
      battery: 80,
      location: {
        lat: 10,
        lng: 10,
      },
    });

    alert("Drone added ✅");
    setOpen(false);

    // refresh list
    const res = await API.get("/drones");

console.log("DRONES RESPONSE:", res.data);

setDrones(
  res.data?.drones ||
  res.data?.data ||
  res.data ||
  []
);
   setDrones(res.data?.drones || []);

  } catch (err: any) {
  console.log("BACKEND ERROR STRING:", JSON.stringify(err.response?.data, null, 2));
  console.log("BACKEND ERROR RAW:", err.response?.data);
  alert("Error adding drone");
}
}; */
const handleAddDrone = async () => {
  try {
    const droneData = {
      name: form.name,
      type: form.type,
      status: form.status,

      speed: Number(form.speed),
      maxRange: Number(form.maxRange),
      payloadCapacity: Number(form.payloadCapacity),
      battery: Number(form.battery),

      location: {
        lat: Number(form.lat),
        lng: Number(form.lng),
        alt: Number(form.alt),
      },

      homeBase: {
        lat: Number(form.baseLat),
        lng: Number(form.baseLng),
        alt: Number(form.baseAlt),
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

    setDrones(
      list.data?.drones ||
      list.data?.data ||
      list.data ||
      []
    );

    setOpen(false);
    setIsEditing(false);
    setEditingDroneId(null);

    setForm({
      name: "",
      type: "SAR",
      status: "idle",
      speed: 0,
      maxRange: 0,
      payloadCapacity: 0,
      battery: 100,
      lat: 0,
      lng: 0,
      alt: 0,
      baseLat: 0,
      baseLng: 0,
      baseAlt: 0,
    });
  } catch (err: any) {
    console.log("❌ BACKEND:", err.response?.data);
    alert(err.response?.data?.message || "Error saving drone");
  }
};

const disableDrone = async (id: string) => {
  try {
    await API.patch(`/drones/${id}/disable`);

    // instantly remove drone from UI
    setDrones((prev: any) =>
      prev.filter((d: any) => d._id !== id)
    );
  } catch (err) {
    console.error(err);
  }
};

const handleDisableDrone = async () => {
  try {

    const finalReason =
      disableReason === "Other"
        ? otherReason
        : disableReason;

    await API.patch(
      `/drones/${selectedDrone._id}/disable`,
      {
        reason: finalReason,
      }
    );

    // remove instantly from drones page
    setDrones((prev) =>
      prev.filter(
        (d) => d._id !== selectedDrone._id
      )
    );

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

  setForm({
    name: drone.name || "",
    type: drone.type || "SAR",
    status: drone.status || "idle",

    speed: drone.speed || 0,
    maxRange: drone.maxRange || 0,
    payloadCapacity: drone.payloadCapacity || 0,
    battery: drone.battery || 100,

    lat: drone.location?.lat || 0,
    lng: drone.location?.lng || 0,
    alt: drone.location?.alt || 0,

    baseLat: drone.homeBase?.lat || 0,
    baseLng: drone.homeBase?.lng || 0,
    baseAlt: drone.homeBase?.alt || 0,
  });

  setOpen(true);
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
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-green-500/10 p-6 text-white"
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <DroneIcon className="w-10 h-10 shrink-0 mr-2"/>    {isEditing ? "Edit Drone" : "Add New Drone"}
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
                  <Field label="Drone name"><input className={inputCls}  value={form.name}
    onChange={(e) =>
      setForm({ ...form, name: e.target.value })
    }/></Field>
                  <Field label="Drone type">
  <select
    className={inputCls}
    value={form.type}
    onChange={(e) =>
      setForm({ ...form, type: e.target.value })
    }
  >
    <option value="SAR">Search & Rescue</option>
<option value="logistics">Remote Logistics</option>
<option value="oilgas">Oil & Gas Monitoring</option>
<option value="industrial">Industrial Inspection</option>
<option value="security">Security Patrol</option>
<option value="general">General </option>
  </select>
</Field>
                 <Field label="Status" full>
  <select
    className={inputCls}
    value={form.status}
    onChange={(e) =>
      setForm({ ...form, status: e.target.value })
    }
  >
    <option value="idle">Available</option>
    <option value="in_mission">In Mission</option>
    <option value="assigned">Assigned</option>
    <option value="disabled">Disabled</option>
  </select>
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
                 <Field label="Latitude">
  <input
    className={inputCls}
    value={form.lat}
    onChange={(e) =>
      setForm({
        ...form,
        lat: Number(e.target.value)
      })
    }
  />
</Field>
                  <Field label="Longitude">
  <input
    className={inputCls}
    value={form.lng}
    onChange={(e) =>
      setForm({
        ...form,
        lng: Number(e.target.value)
      })
    }
  />
</Field>
                  <Field label="altitude">
  <input
    className={inputCls}
    value={form.alt}
    onChange={(e) =>
      setForm({
        ...form,
        alt: Number(e.target.value)
      })
    }
  />
</Field>
                  <p className="text-xs text-green-400/80">This is the drone's current GPS position.</p>
                </div>
              </section>

              {/* 2. Performance */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">2</span>
                  Performance Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3">
                 <Field label="Speed (m/s)">
  <input
    className={inputCls}
    type="number"
    value={form.speed}
    onChange={(e) =>
      setForm({
        ...form,
        speed: Number(e.target.value)
      })
    }
  />
</Field>
                  <Field label="Max range">
  <input
    className={inputCls}
    type="number"
    value={form.maxRange}
    onChange={(e) =>
      setForm({ ...form, maxRange: Number(e.target.value) })
    }
  />
</Field>
                  <Field label="Payload Capacity (kg)">
  <input
    className={inputCls}
    type="number"
    value={form.payloadCapacity}
    onChange={(e) =>
      setForm({ ...form, payloadCapacity: Number(e.target.value) })
    }
  />
</Field>
                 <Field label="Battery (%)">
  <input
    className={inputCls}
    type="number"
    value={form.battery}
    onChange={(e) =>
      setForm({ ...form, battery: Number(e.target.value) })
    }
  />
</Field>
                </div>
              </section>

              {/* 3. Location */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">3</span>
                  Current Location
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Latitude"><input className={inputCls} /></Field>
                  <Field label="Longitude"><input className={inputCls} /></Field>
                  <Field label="Altitude (m)"><input className={inputCls} /></Field>
                </div>
                <p className="text-xs text-green-400/80 mt-3">This is the drone's current GPS position.</p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => {
                setOpen(false);
                setIsEditing(false);
                 setEditingDroneId(null);
}}
                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition"
              >
                ⊗ Cancel
              </button>
              <button
                onClick={handleAddDrone}
               className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-lg shadow-green-500/30 transition">
               {isEditing
                ? "Save Drone Changes"
                : "Add drone to your base"}
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

    setForm({
      name: "",
      type: "SAR",
      status: "idle",

      speed: 0,
      maxRange: 0,
      payloadCapacity: 0,
      battery: 100,

      lat: 0,
      lng: 0,
      alt: 0,

      baseLat: 0,
      baseLng: 0,
      baseAlt: 0,
    });

    setOpen(true);
  }}
  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
>
  + Add drone
</button><button
  onClick={() => {
    setIsEditing(false);
    setEditingDroneId(null);

    setForm({
      name: "",
      type: "SAR",
      status: "idle",

      speed: 0,
      maxRange: 0,
      payloadCapacity: 0,
      battery: 100,

      lat: 0,
      lng: 0,
      alt: 0,

      baseLat: 0,
      baseLng: 0,
      baseAlt: 0,
    });

    setOpen(true);
  }}
  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
>
  + Add drone
</button>
          
        </div>
        <div className="grid grid-cols-[0.5fr_1fr_1fr_0.8fr_1fr_1.4fr] items-center gap-6 border-b border-white/10 bg-black/30 px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white/80">
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
  className="
    grid
    grid-cols-[0.5fr_1fr_1fr_0.8fr_1fr_1.4fr]
    items-center
    gap-6
    px-8
    py-6
    border-b
    border-white/5
    text-sm
    text-white/80
    transition-all
    duration-300
    hover:bg-white/[0.04]
  "
>
  {/* ID */}
  <div className="font-semibold text-white/90">
    {d._id ? d._id.slice(-5) : "N/A"}
  </div>

  {/* TYPE */}
  <div className="font-medium text-white/90">
    <TypeCell type={d.type} />
  </div>

  {/* STATUS */}
  <div>
    <StatusPill
      status={(d.status || "").toLowerCase() as Status}
    />
    {d.status === "assigned" && d.assignedMissionName && (
      <span className="text-xs text-yellow-300/80 mt-1">
        📋 {d.assignedMissionName}
      </span>
    )}
    {d.status === "assigned" && d.assignedAt && (
      <span className="text-xs text-white/40">
        {new Date(d.assignedAt).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </span>
    )}
  </div>
  

  {/* BATTERY */}
  <div className="font-medium text-white/80">
    {d.battery}%
  </div>

  {/* LOCATION */}
  <div className="flex items-center gap-2 text-white/70">
    <MapPin className="h-4 w-4 text-emerald-400" />

    <span>
      {d.location
        ? `${d.location.lat}, ${d.location.lng}`
        : "No location"}
    </span>
  </div>

  {/* ACTIONS */}
              <div className="flex justify-end gap-2">
                <button
   onClick={() => {
    setSelectedDrone(d);
    setShowDisableModal(true);
  }}
  className="
    rounded-xl
    bg-red-500/90
    px-4
    py-2
    text-sm
    font-semibold
    text-white

    transition-all
    duration-300
    hover:scale-105
    hover:bg-red-400
   
    active:scale-95
  "
>
  Disable
</button>
                <button 
                 onClick={() => handleEdit(d)}
                 className="
    rounded-xl
    bg-green-500/90
    px-4
    py-2
    text-sm
    font-semibold
    text-white

    transition-all
    duration-300
    hover:scale-105
    hover:bg-green-400
   
    active:scale-95
  ">
                  <Pencil className="h-4 hover:text-blue-400 w-4" />
                  Edit
                </button>
                <button
  onClick={() => navigate(`/drones/${d._id}/history`)}
  className="
    rounded-xl
    bg-blue-500/90
    px-4
    py-2
    text-sm
    font-semibold
    text-white

    transition-all
    duration-300
    hover:scale-105
    hover:bg-blue-400

    active:scale-95
  "
>
  History
</button>
              </div>
            </li>
          ))}
        </ul>
      </Glass>

      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[440px] rounded-2xl border border-white/5 bg-[#0f141c]/90 p-7 backdrop-blur-xl shadow-2xl text-white">
            
            {/* Header section with orange/red alert bullet */}
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#f44336] shadow-[0_0_12px_#f44336] shrink-0" />
                Disable Drone
              </h2>
              <p className="text-[12px] text-white/40 mt-1 leading-normal">
                Please select a dynamic reason below to halt this automated deployment status safely.
              </p>
            </div>

            {/* Selection Options Grid */}
            <div className="space-y-2">
              <button
                onClick={() => setDisableReason("crashed")}
                className={`w-full rounded-xl p-3 text-left text-[13px] font-medium transition-all duration-200 flex items-center gap-2.5 ${
                  disableReason === "crashed"
                    ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/10"
                    : "bg-[#161b26] text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>⛅</span> Weather conditions
              </button>

              <button
                onClick={() => setDisableReason("destroyed")}
                className={`w-full rounded-xl p-3 text-left text-[13px] font-medium transition-all duration-200 flex items-center gap-2.5 ${
                  disableReason === "destroyed"
                    ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/10"
                    : "bg-[#161b26] text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>🛡️</span> Drone malfunction
              </button>

              <button
                onClick={() => setDisableReason("out_of_service")}
                className={`w-full rounded-xl p-3 text-left text-[13px] font-medium transition-all duration-200 flex items-center gap-2.5 ${
                  disableReason === "out_of_service"
                    ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/10"
                    : "bg-[#161b26] text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>🔋</span> Low battery
              </button>

              <button
                onClick={() => setDisableReason("other")}
                className={`w-full rounded-xl p-3 text-left text-[13px] font-medium transition-all duration-200 flex items-center gap-2.5 ${
                  disableReason === "other"
                    ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/10"
                    : "bg-[#161b26] text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>⚡</span> Other reason
              </button>

              {disableReason === "other" && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Write reason..."
                  className="w-full rounded-xl bg-black/40 border border-white/5 p-3 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/50 mt-1 h-16 resize-none transition"
                />
              )}
            </div>

            {/* Action Buttons layout */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setDisableReason("");
                  setOtherReason("");
                }}
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