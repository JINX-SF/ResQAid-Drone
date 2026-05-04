import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCards from "@/components/dashboard/StatsCards";
import DroneOverview from "@/components/dashboard/DroneOverview";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import EmergencyRequests from "@/components/dashboard/EmergencyRequests";
import { Package, Plus } from "lucide-react";
import rescueBg from "@/assets/rescue-bg.jpg";
import DroneIcon from "@/components/DroneIcon";

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

const Dashboard = () => {
  
     const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div>
  {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
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
                  <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400/20 flex items-center justify-center text-sm">1</span>
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
    
    <div
  className="flex h-screen overflow-hidden bg-cover bg-center"
  style={{ backgroundImage: `url(${rescueBg})` }}
>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">Dashboard</h1>
            <button onClick={()=>{setOpen(!open)}} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add drone
            </button>
          </div>
          <StatsCards />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <DroneOverview />
            </div>
            <ActivityFeed />
          </div>
          <div>
            <EmergencyRequests />
          </div>
        </main>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;

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