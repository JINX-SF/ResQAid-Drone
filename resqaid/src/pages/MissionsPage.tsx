import { Package } from "lucide-react";
import {  Glass } from "@/components/AppShell";
import AppShell from "@/components/AppShell";



type Status = "completed" | "pending" | "active";
type Urgency = "critical" | "minor" | "low";
type MType = "Search & rescue" | "Delivery";

const missions: {
  id: string;
  type: MType;
  status: Status;
  payload: string;
  urgency: Urgency;
  time: string;
  date: string;
  location: string;
  target: string;
}[] = [
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

export default function MissionsPage() {
  return (
    <AppShell>
      <Glass className="overflow-hidden">
        <div className="flex items-center justify-between bg-black/40 px-6 py-4">
          <h2 className="text-2xl font-semibold text-white/80">All missions</h2>
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
  );
}