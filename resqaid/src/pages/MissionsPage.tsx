import { Package } from "lucide-react";
import {  Glass } from "@/components/AppShell";
import AppShell from "@/components/AppShell";
import { useState } from "react";



type Status = "completed" | "pending" | "active";
type Urgency = "critical" | "minor" | "low";
type MType = "Search & rescue" | "Delivery";

type Mission = {
  id: string;
  type: "Search & rescue" | "Delivery";
  status: "completed" | "pending" | "active";
  payload: string;
  urgency: "critical" | "minor" | "low";
  time: string;
  date: string;
  location: string;
  target: string;
};
const missions: Mission[] = [
  { id: "#01", type: "Search & rescue", status: "completed", payload: "12kg", urgency: "critical", time: "14:32", date: "21 May 2025", location: "Algeria,oran", target: "Algeria,oran" },
  { id: "#02", type: "Search & rescue", status: "completed", payload: "8kg", urgency: "critical", time: "14:32", date: "21 May 2025", location: "Algeria,oran", target: "Algeria,oran" },
  { id: "#03", type: "Search & rescue", status: "pending", payload: "8kg", urgency: "critical", time: "14:32", date: "21 May 2025", location: "Algeria,oran", target: "Algeria,oran" },
  { id: "#04", type: "Search & rescue", status: "active", payload: "8kg", urgency: "minor", time: "14:32", date: "21 May 2025", location: "Algeria,oran", target: "Algeria,oran" },
  { id: "#05", type: "Delivery", status: "completed", payload: "8kg", urgency: "minor", time: "14:32", date: "21 May 2025", location: "Algeria,oran", target: "Algeria,oran" },
  { id: "#05", type: "Delivery", status: "pending", payload: "8kg", urgency: "critical", time: "14:32", date: "21 May 2025", location: "Algeria,oran", target: "Algeria,oran" },
  { id: "#06", type: "Search & rescue", status: "pending", payload: "8kg", urgency: "low", time: "14:32", date: "21 May 2025", location: "Algeria,oran", target: "Algeria,oran" },
];
function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    completed: "bg-green-600 text-white",
    pending: "bg-destructive text-destructive-foreground",
    active: "bg-blue-500 text-white",
  };
  return (
    <span className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function UrgencyPill({ urgency }: { urgency: Urgency }) {
  const styles: Record<Urgency, { bg: string; dot: string }> = {
    critical: { bg: "bg-destructive/30 text-white", dot: "bg-destructive" },
    minor: { bg: "bg-yellow-500/20 text-yellow-100", dot: "bg-yellow-400" },
    low: { bg: "bg-green-600/20 text-green-100", dot: "bg-green-500" },
  };
  const s = styles[urgency];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${s.bg}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
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

function StatusBadge({ status }: { status: Mission["status"] }) {
  const styles = {
    completed: "bg-green-500 text-white",
    pending: "bg-red-500 text-white",
    active: "bg-blue-500 text-white",
  };
  return (
    <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
function UrgencyBadge({ urgency }: { urgency: Mission["urgency"] }) {
  const config = {
    critical: { dot: "bg-red-500", bg: "bg-red-500/15 text-red-300 border-red-500/30" },
    minor: { dot: "bg-yellow-400", bg: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    low: { dot: "bg-green-400", bg: "bg-green-500/15 text-green-300 border-green-500/30" },
  }[urgency];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {urgency}
    </span>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-white/60 mb-1">{label}</label>
      {children}
    </div>
  );
}
export default function MissionsPage() {
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
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-green-500/10 p-6 text-white"
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <span>🎯</span> New Mission
              </h2>
              <p className="text-sm text-white/60">
                Create a new mission and dispatch it to your fleet.
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
                  <Field label="Mission type">
                    <select className={inputCls}>
                      <option className="bg-slate-900">Search & rescue</option>
                      <option className="bg-slate-900">Delivery</option>
                    </select>
                  </Field>
                  <Field label="Status">
                    <select className={inputCls}>
                      <option className="bg-slate-900">Pending</option>
                      <option className="bg-slate-900">Active</option>
                      <option className="bg-slate-900">Completed</option>
                    </select>
                  </Field>
                  <Field label="Payload (kg)">
                    <input type="number" className={inputCls} placeholder="8" />
                  </Field>
                  <Field label="Urgency">
                    <select className={inputCls}>
                      <option className="bg-slate-900">Critical</option>
                      <option className="bg-slate-900">Minor</option>
                      <option className="bg-slate-900">Low</option>
                    </select>
                  </Field>
                  <Field label="Start time">
                    <input type="datetime-local" className={inputCls} />
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
                  <Field label="Location"><input className={inputCls} placeholder="Algeria, Oran" /></Field>
                  <Field label="Latitude"><input className={inputCls} placeholder="35.6971" /></Field>
                  <Field label="Longitude"><input className={inputCls} placeholder="-0.6308" /></Field>
                </div>
              </section>

              {/* 3. Target Area */}
              <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <h3 className="flex items-center gap-2 mb-4 font-semibold">
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">3</span>
                  Target Area
                </h3>
                <div className="space-y-3">
                  <Field label="Target area"><input className={inputCls} placeholder="Algeria, Oran" /></Field>
                  <Field label="Target latitude"><input className={inputCls} placeholder="35.7000" /></Field>
                  <Field label="Target longitude"><input className={inputCls} placeholder="-0.6500" /></Field>
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
              <button className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-lg shadow-green-500/30 transition">
                Launch mission
              </button>
            </div>
          </div>
        </div>
      )}
    <AppShell>
      <Glass className="overflow-hidden">
        <div className="flex items-center justify-between bg-black/40 px-6 py-4">
          <h2 className="text-2xl font-semibold text-white/80">All missions</h2>
          <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            + Add mission
          </button>
        </div>
        <div className="grid grid-cols-[0.5fr_1.2fr_1fr_0.8fr_1fr_1.1fr_1.1fr_1.1fr] gap-4 border-b border-white/10 bg-black/30 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">
          <div>ID</div>
          <div>Type</div>
          <div>Status</div>
          <div>Payload</div>
          <div>Urgency</div>
          <div>Start time</div>
          <div>Location</div>
          <div>Target area</div>
        </div>
        <ul className="divide-y divide-white/5 text-white/70">
          {missions.map((m, i) => (
            <li
              key={i}
              className="grid grid-cols-[0.5fr_1.2fr_1fr_0.8fr_1fr_1.1fr_1.1fr_1.1fr] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-white/5"
            >
              <div className="font-medium">{m.id}</div>
              <TypeCell type={m.type} />
              <div><StatusPill status={m.status} /></div>
              <div>{m.payload}</div>
              <div><UrgencyPill urgency={m.urgency} /></div>
              <div className="text-xs leading-tight">
                <div>{m.time}</div>
                <div className="text-muted-foreground">• {m.date}</div>
              </div>
              <div>{m.location}</div>
              <div>{m.target}</div>
            </li>
          ))}
        </ul>
      </Glass>
    </AppShell>
    </div>
  );
}