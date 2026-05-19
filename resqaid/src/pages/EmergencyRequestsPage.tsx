import { Flame, Droplet, Building2, Stethoscope } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/api";
  
type Urgency = "critical" | "minor" | "low";
type Kind =
  | "missing"
  | "fire"
  | "flood"
  | "building"
  | "medical"
  | "other";



function KindIcon({ kind }: { kind: Kind }) {
  switch (kind) {
    case "missing":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded bg-destructive text-[10px] font-bold text-destructive-foreground">
          SOS
        </span>
      );
    case "fire":
      return <Flame className="h-6 w-6 text-orange-400" />;
    case "flood":
      return <Droplet className="h-6 w-6 text-blue-400" />;
    case "building":
      return <Building2 className="h-6 w-6 text-white/80" />;
    case "medical":
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-destructive">
          <Stethoscope className="h-4 w-4" />
        </span>
      );
  }
}

function UrgencyPill({ urgency }: any) {
  const normalized = urgency?.toLowerCase();

  const styles: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground",
    medium: "bg-orange-500 text-white",
    low: "bg-primary text-primary-foreground",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
        styles[normalized] || styles.low
      }`}
    >
      {urgency}
    </span>
  );
}

export default function EmergencyRequestsPage() {
  const navigate = useNavigate();
  const [reqs, setReqs] = useState<any[]>([]);

/*useEffect(() => {
  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests");
      setReqs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRequests();
}, []);*/
useEffect(() => {
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

     

console.log("TOKEN =", token);

const res = await API.get("/emergency-requests", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log("REQUESTS =", res.data);

      setReqs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRequests();
}, []);
console.log(reqs);
  return (
    <AppShell>
      <Glass className="overflow-hidden">
        <div className="bg-black/40 px-6 py-4">
          <h2 className="text-2xl font-semibold text-white/80">Emergency requests</h2>
        </div>
        <div className="grid grid-cols-[0.7fr_1.5fr_1fr_1fr_1.2fr_1fr] gap-4 border-b border-white/10 bg-black/30 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">
          <div>ID</div>
          <div>Type</div>
          <div>Urgency</div>
          <div>Time</div>
          <div>Location</div>
          <div className="text-right">Actions</div>
        </div>
        <ul className="divide-y text-white/70 divide-white/5">
          {reqs.map((r, i) => (
            <li
              key={i}
              className="grid grid-cols-[0.7fr_1.5fr_1fr_1fr_1.2fr_1fr] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-white/5"
            >
             <div className="font-medium">
  {r._id?.slice(-6)}
</div>

<div className="flex items-center gap-3">
  <KindIcon kind={r.type || "medical"} />
  <span>{r.type}</span>
</div>

<div>
  <UrgencyPill
    urgency={(r.urgency || "low").toLowerCase()}
  />
</div>

<div className="text-white/70">
  {new Date(r.createdAt).toLocaleTimeString()}
</div>

<div className="text-white/70">
  {r.location?.name || "Unknown"}
</div>
              <div className="flex justify-end">
                <button
               onClick={() => navigate(`/requests/${r._id}`)}
                
                className="rounded-lg bg-primary/80 px-6 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary">
                  review
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Glass>
    </AppShell>
  );
}