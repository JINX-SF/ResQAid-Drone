import {
  CheckSquare,
  Users,
  Sliders,
  Compass,
  Settings,
  Bell,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Star,
  AlertTriangle,
} from "lucide-react";
import bg from "@/assets/rescue-bg.jpg";
import DroneIcon from "../components/DroneIcon";
import { Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

// Redesigned Glass Component with a glowing translucent profile
function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-white ${className}`}
    >
      {children}
    </div>
  );
}

type Variant = "progress" | "completed" | "rejected" | "accepted";

// High contrast status badges matching your dark background
function StatusBadge({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  const styles: Record<Variant, string> = {
    progress: "bg-amber-400/20 border border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.15)]",
    completed: "bg-emerald-400/20 border border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)]",
    rejected: "bg-red-400/20 border border-red-400/50 text-red-300 shadow-[0_0_15px_rgba(248,113,113,0.15)]",
    accepted: "bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export default function RequestPage() {
  const requests: { id: string; date: string; status: Variant; label: string }[] = [
    { id: "#24", date: "24/03/2026", status: "progress", label: "in progress" },
    { id: "#18", date: "24/03/2026", status: "completed", label: "Completed" },
    { id: "#05", date: "24/03/2026", status: "completed", label: "Completed" },
    { id: "#04", date: "24/03/2026", status: "rejected", label: "rejected" },
  ];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat font-sans"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Gentle overlay layer to protect underlying contrast */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 px-8 py-6 overflow-x-hidden">
          {/* Header Action Row */}
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">Assistance Requests</h1>
              <p className="text-sm text-zinc-300/90 font-bold mt-1">Monitor active emergency deployments and profile connection routing data maps.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
              <button className="text-zinc-300 hover:text-white p-2 transition-colors" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-4 w-px bg-white/10" />
              <Link to="/profile" className="text-zinc-300 hover:text-white p-2 transition-colors flex items-center justify-center">
                <User className="h-5 w-5" />
              </Link>
            </div>
          </header>

          {/* Grid Layout Container */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
            
            {/* Top Left Status Hero */}
            <Glass className="p-6 lg:col-span-2">
              <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-zinc-300">
                Current Request Status
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-2 border-cyan-400 bg-black/40 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  {/* Fixed visibility by giving explicit sizing and crisp color classes */}
                  <div className="text-cyan-400 flex items-center justify-center">
                    <DroneIcon className="h-14 w-14 text-cyan-400 fill-cyan-400/20" />
                  </div>
                </div>
                <div className="flex-1 w-full space-y-3 text-base">
                  {[
                    ["Mission Type", "Search & Rescue", "text-cyan-300 font-extrabold"],
                    ["Start Time", "14:30", "text-zinc-100 font-bold"],
                    ["Location", "Forest, Oran Algeria", "text-zinc-100 font-semibold"],
                    ["Mission ID", "#24", "text-amber-400 font-black tracking-wider"],
                  ].map(([k, v, colorClass]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between border-b border-white/10 pb-2.5 last:border-0"
                    >
                      <span className="text-zinc-300 font-bold text-sm uppercase tracking-wider">{k}</span>
                      <span className={colorClass}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Glass>

            {/* Profile Panel Block */}
            <Glass className="p-6">
              <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-zinc-300">My Profile</h2>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
                  <User className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <div className="font-black text-lg tracking-wide text-white">SARAH BENALI</div>
                  <span className="text-xs text-cyan-400 font-black uppercase tracking-wider">Field Operator</span>
                </div>
              </div>
              <div className="space-y-3 text-sm text-zinc-100">
                <div className="flex items-center gap-3.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <MapPin className="h-5 w-5 text-cyan-400 shrink-0" />
                  <span className="font-bold">Oran, Algeria</span>
                </div>
                <div className="flex items-center gap-3.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Phone className="h-5 w-5 text-cyan-400 shrink-0" />
                  <span className="font-black tracking-wide">+213 555 987 654</span>
                </div>
                <div className="flex items-center gap-3.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Mail className="h-5 w-5 text-cyan-400 shrink-0" />
                  <span className="font-bold truncate">Sarah.Ali@gmail.com</span>
                </div>
              </div>
            </Glass>

            {/* Request List Log */}
            <Glass className="p-6">
              <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-zinc-300">My Requests</h2>
              <ul className="space-y-3">
                {requests.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all duration-200"
                  >
                    <div>
                      <div className="text-base font-black text-white">{r.id}</div>
                      <div className="text-xs text-zinc-300 font-bold mt-0.5">{r.date}</div>
                    </div>
                    <StatusBadge variant={r.status}>{r.label}</StatusBadge>
                  </li>
                ))}
              </ul>
            </Glass>

            {/* Dynamic Summary Panel */}
            <Glass className="p-6">
              <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-zinc-300">Last Request Summary</h2>
              <div className="space-y-3 text-base">
                {[
                  ["Mission Type", "Search & Rescue", "text-cyan-300 font-extrabold"],
                  ["Target Count", "1 Person", "text-zinc-100 font-bold"],
                  ["Request Time", "14:30", "text-zinc-100 font-bold"],
                  ["Location", "Zone 4-B Area", "text-zinc-100 font-semibold"],
                  ["Drone Assigned", "DR-8", "text-amber-400 font-black"],
                ].map(([k, v, colorClass]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between border-b border-white/10 pb-2.5 last:border-0"
                  >
                    <span className="text-zinc-300 font-bold text-xs uppercase tracking-wider">{k}</span>
                    <span className={colorClass}>{v}</span>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Emergency Contact Block */}
            <Glass className="p-6">
              <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-300">Emergency Contact</h2>
              <div className="text-xl font-black text-white">Ahmed Ali</div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest font-black mt-0.5">Primary Liaison Contact</div>
              <div className="my-4 h-px bg-white/10" />
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-base text-red-300 font-black shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <Phone className="h-5 w-5 shrink-0 text-red-400" />
                <span>+213 555 987 654</span>
              </div>
            </Glass>

            {/* Comprehensive Mission Report Data Block */}
            <Glass className="p-6 lg:col-span-2">
              <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-zinc-300">Mission Report</h2>
              <div className="space-y-4 text-base">
                <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3.5">
                  <span className="text-zinc-200 font-bold">System Authorization Decision</span>
                  <StatusBadge variant="accepted">accepted</StatusBadge>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="mb-2 text-zinc-300 font-black text-xs uppercase tracking-wider">Resolution Objective / Reason</div>
                  <div className="text-sm text-zinc-100 leading-relaxed font-semibold">
                    Mission completed successfully. Target located inside the forest perimeter grid coordinate matrices and immediate extraction assistance was dispatched.
                  </div>
                </div>
              </div>
            </Glass>

            {/* Interactive Feedback Card */}
            <Glass className="p-6">
              <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-300">Feedback</h2>
              <p className="mb-4 text-xs text-zinc-300 font-bold">
                How was your experience with our response service network?
              </p>
              <div className="mb-4 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} aria-label={`rate-${i}`} className="group transition-transform active:scale-90">
                    <Star className="h-6 w-6 text-zinc-500 transition-colors duration-200 fill-transparent hover:fill-amber-400 hover:text-amber-400 group-hover:text-amber-400" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Leave an analytical comment…"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-400 focus:bg-black/60 focus:outline-none transition-all font-medium"
              />
            </Glass>
          </div>

          {/* Lower Global Interaction Trigger Link */}
          <div className="mt-8 flex justify-end">
            <Link to="/request-assistance" className="inline-block">
              <button className="rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 px-10 py-3.5 text-sm font-black uppercase tracking-wider text-white transition-all shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
                Start Request
              </button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}