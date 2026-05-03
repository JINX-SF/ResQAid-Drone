import { MapPin, Trash2, Pencil, Package } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";
import { useState } from "react";
import DroneIcon from "@/components/DroneIcon";

type Status = "in mission" | "active" | "offline";
type DType = "Search & rescue" | "Delivery";

const drones: { id: string; type: DType; status: Status; battery: number }[] = [
  { id: "DR-1", type: "Search & rescue", status: "in mission", battery: 78 },
  { id: "DR-2", type: "Delivery", status: "in mission", battery: 60 },
  { id: "DR-3", type: "Search & rescue", status: "active", battery: 91 },
  { id: "DR-4", type: "Search & rescue", status: "offline", battery: 23 },
  { id: "DR-5", type: "Search & rescue", status: "active", battery: 23 },
  { id: "DR-6", type: "Delivery", status: "in mission", battery: 33 },
  { id: "DR-7", type: "Delivery", status: "offline", battery: 33 },
  { id: "DR-8", type: "Search & rescue", status: "offline", battery: 14 },
];

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
   const [open, setOpen] = useState(false);

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
                  <Field label="Drone name"><input className={inputCls} /></Field>
                  <Field label="Drone type">
                    <select className={inputCls}><option>Quadcopter</option><option>Hexacopter</option></select>
                  </Field>
                  <Field label="Status" full>
                    <select className={inputCls}><option>Available</option><option>In Mission</option></select>
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
                  <Field label="Base latitude"><input className={inputCls} /></Field>
                  <Field label="Base longitude"><input className={inputCls} /></Field>
                  <Field label="Base altitude"><input className={inputCls} /></Field>
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
                  <Field label="Speed (m/s)"><input className={inputCls} /></Field>
                  <Field label="Max range"><input className={inputCls} /></Field>
                  <Field label="Payload Capacity (kg)"><input className={inputCls} /></Field>
                  <Field label="Battery (%)"><input className={inputCls} /></Field>
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
              <button className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-lg shadow-green-500/30 transition">
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
          {drones.map((d) => (
            <li
              key={d.id}
              className="grid grid-cols-[0.7fr_1.3fr_1fr_0.8fr_1.2fr_1fr] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-white/5"
            >
              <div className="font-medium">{d.id}</div>
              <TypeCell type={d.type} />
              <div>
                <StatusPill status={d.status} />
              </div>
              <div>{d.battery}%</div>
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Algeria,oran</span>
              </div>
              <div className="flex justify-end gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/30 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/30 text-muted-foreground hover:text-blue-600">
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