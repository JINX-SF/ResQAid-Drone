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

function UrgencyPill({ urgency }: { urgency: string }) {
  const styles =
    urgency === "critical"
      ? "bg-red-600 text-white border border-red-400 shadow-[0_0_15px_rgba(255,0,0,0.8)]"
      : urgency === "high"
      ? "bg-orange-500 text-white"
      : urgency === "medium"
      ? "bg-yellow-500 text-black"
      : "bg-green-500 text-white";

  return (
    <span
      className={`rounded-full px-4 py-1 text-xs font-bold uppercase ${styles}`}
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
       <ul className="grid grid-cols-[0.7fr_1.5fr_1fr_1fr_1fr_2fr] gap-4 px-6 py-3 text-xs uppercase tracking-wider text-white/40">
  <li>ID</li>
  <li>Type</li>
  <li>Urgency</li>
  <li>Time</li>
  <li>Location</li>

 <li className="flex justify-between w-full min-w-[350px]">
  <span>Action</span>
  <span>Status</span>
</li>
</ul>
        <ul className="divide-y text-white/70 divide-white/5">
          {reqs.map((r, i) => (
           <li
  key={i}
  className="grid grid-cols-[0.7fr_1.5fr_1fr_1fr_1fr_2fr] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-white/5"
>
  <div className="font-medium">
    {r._id?.slice(-6)}
  </div>

  <div className="flex items-center gap-3">
    <KindIcon kind={r.type || "medical"} />

    <div className="flex flex-col">
      <span className="capitalize">{r.type}</span>

      <span className="text-xs text-white/50">
        {r.user?.name || "Unknown user"}
      </span>
    </div>
  </div>

  <div className="flex items-center gap-2">
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

  <div className="flex items-center justify-between w-full min-w-[350px]">
    
    <button
      onClick={() => navigate(`/requests/${r._id}`)}
      className="rounded-xl bg-emerald-500 px-6 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-400 shadow-lg"
    >
      Review
    </button>

    <span
      className={`rounded-full px-4 py-1 text-xs font-bold ${
        r.status === "accepted"
          ? "bg-green-500 text-white"
          : r.status === "rejected"
          ? "bg-red-500 text-white"
          : "bg-yellow-500 text-black"
      }`}
    >
      {r.status || "pending"}
    </span>

  </div>
</li>
          ))}
        </ul>
      </Glass>
    </AppShell>
  );
}