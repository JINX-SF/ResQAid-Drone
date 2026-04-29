import { MapPin, Trash2, Pencil, Package } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";

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
  return (
    <AppShell>
      <Glass className="overflow-hidden">
        <div className="flex items-center justify-between bg-black/40 px-6 py-4">
          <h2 className="text-2xl font-semibold text-white/80">All drones</h2>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
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
  );
}