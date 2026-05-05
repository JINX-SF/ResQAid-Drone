import { MapPin, Trash2, Pencil, Package } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";
import DroneIcon from "@/components/DroneIcon";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/api";

type Status = "in mission" | "active" | "offline";
type DType = "Search & rescue" | "Delivery";



function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    "in mission": "bg-primary text-primary-foreground",
    active: "bg-blue-500 text-white",
    offline: "bg-destructive text-destructive-foreground",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TypeCell({ type }: { type: DType }) {
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
export default function DronesPage() {
  const navigate = useNavigate();
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

   const [drones, setDrones] = useState([]);

 useEffect(() => {
  const fetchDrones = async () => {
    try {
      const res = await API.get("/drones");

      console.log("INITIAL DRONES:", res.data);

      setDrones(
        res.data?.drones ||
        res.data?.data ||
        res.data ||
        []
      );
    } catch (err) {
      console.error(err);
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

    console.log("🚀 SENDING:", droneData);

    const res = await API.post("/drones", droneData);

    alert("Drone added ✅");

    setOpen(false);

    // 🔥 refresh drones
    const list = await API.get("/drones");

    setDrones(
      list.data?.drones ||
      list.data?.data ||
      list.data ||
      []
    );

  } catch (err: any) {
    console.log("❌ BACKEND:", err.response?.data);
    alert(err.response?.data?.message || "Error adding drone");
  }
};

const handleDelete = async (id: string) => {
  try {
    await API.delete(`/drones/${id}`);

    // remove from UI instantly
    setDrones((prev) => prev.filter((d) => d._id !== id));

  } catch (err) {
    console.error(err);
    alert("Error deleting drone");
  }
};

const handleEdit = (drone) => {
  setForm({
  name: drone.name,
  type: drone.type,
  status: drone.status,
  battery: drone.battery,

  speed: drone.speed || 0,
  maxRange: drone.maxRange || 0,
  payloadCapacity: drone.payloadCapacity || 0,

  lat: drone.location?.lat || 0,
  lng: drone.location?.lng || 0,
  alt: drone.location?.alt || 0,

  baseLat: drone.homeBase?.lat || 0,
  baseLng: drone.homeBase?.lng || 0,
  baseAlt: drone.homeBase?.alt || 0,
});};

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
                <DroneIcon className="w-10 h-10 shrink-0 mr-2"/>    Add New Drone
              </h2>
              <p className="text-sm text-white/60">
                Register a new drone to your fleet for mission deployment.
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
    <option value="delivery">Delivery</option>
    <option value="hybrid">Hybrid</option>
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
    <option value="maintenance">Maintenance</option>
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
                onClick={() => setOpen(false)}
                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition"
              >
                ⊗ Cancel
              </button>
              <button
                onClick={handleAddDrone}
               className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-lg shadow-green-500/30 transition">
                Add drone to your base
              </button>
            </div>
          </div>
        </div>
      )}
    <AppShell>
      <Glass className="overflow-hidden">
        <div className="flex items-center justify-between bg-black/40 px-6 py-4">
          <h2 className="text-2xl font-semibold text-white/80">All drones</h2>
          <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            + Add drone
          </button>
          
        </div>
        <div className="grid grid-cols-[0.7fr_1.3fr_1fr_0.8fr_1.2fr_1fr] gap-4 border-b border-white/10 bg-black/30 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">
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
              className="grid grid-cols-[0.7fr_1.3fr_1fr_0.8fr_1.2fr_1fr] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-white/5"
            >
            <div className="font-medium">
  {d._id ? d._id.slice(-5) : "N/A"}
</div>
              <TypeCell type={d.type} />
              <div>
                <StatusPill status={(d.status || "").toLowerCase() as Status} />
              </div>
              <div>{d.battery}%</div>
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="h-4 w-4 text-primary" />
                <span> {d.location
      ? `${d.location.lat}, ${d.location.lng}`
      : "No location"}</span>
              </div>
              <div className="flex justify-end gap-2">
                <button
  onClick={() => handleDelete(d._id)}
  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/30 text-muted-foreground hover:text-destructive"
>
  <Trash2 className="h-4 w-4" />
</button>
                <button 
                 onClick={() => navigate(`/drones/edit/${d._id}`)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/30 text-muted-foreground hover:text-blue-600">
                  <Pencil className="h-4 hover:text-blue-400 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Glass>
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