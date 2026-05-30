import { useEffect, useState } from "react";
import API from "@/api";
import { useNavigate } from "react-router-dom";
import AppShell, { Glass } from "../components/AppShell";
import { Clock, CheckCircle, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/emergency-requests/my-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRequests(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusStyle = (status: string) => {
    if (status === "accepted") return "bg-green-500/20 text-green-400 border border-green-500/30";
    if (status === "rejected") return "bg-red-500/20 text-red-400 border border-red-500/30";
    return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
  };

  const getStatusIcon = (status: string) => {
    if (status === "accepted") return <CheckCircle size={14} />;
    if (status === "rejected") return <XCircle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <AppShell>
      <Glass className="overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between bg-black/40 px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold text-white/80">My Emergency Requests</h2>
            <p className="text-xs text-white/40 mt-0.5">Track all your emergency requests and rescue progress</p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/60 text-sm">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto mb-3 text-yellow-400" size={36} />
            <h2 className="text-xl font-medium text-white/80 mb-1">No requests yet</h2>
            <p className="text-sm text-white/50">You have not sent any emergency requests.</p>
          </div>
        ) : (
          <>
            {/* Grid Table Header */}
            <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-white/10 bg-black/30 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">
              <div>Request Type</div>
              <div>Description / Details</div>
              <div>Urgency</div>
              <div>Date & Location</div>
              <div className="text-right">Status</div>
            </div>

            {/* Grid Table Body */}
            <ul className="divide-y text-white/60 divide-white/5">
              {requests.map((r) => (
                <li
                  key={r._id}
                  className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-white/5"
                >
                  {/* Column 1: Request Type */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <span className="font-medium capitalize text-white/90">{r.type}</span>
                  </div>

                  {/* Column 2: Description */}
                  <div className="text-sm line-clamp-2 pr-2 text-white/70">
                    {r.description || "—"}
                  </div>

                {/* Column 3: Urgency */}
<div>
  {(() => {
    // Convert to lowercase to handle any capitalization issues safely
    const urgencyVal = r.urgency ? r.urgency.toLowerCase() : "normal";

    const styleMap: Record<string, string> = {
      critical: "text-red-200 bg-red-950 border border-red-900", // Dark Red
      high:     "text-white bg-red-600 border border-red-700",    // Red 600
      medium:   "text-amber-400 bg-amber-500/10 border border-amber-500/20",
      normal:   "text-zinc-400 bg-zinc-800/40 border border-zinc-700/30",
    };

    // If the backend passes something unexpected, default it to normal
    const currentStyle = styleMap[urgencyVal] || styleMap.normal;

    return (
      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded uppercase tracking-wide ${currentStyle}`}>
        {r.urgency || "Normal"}
      </span>
    );
  })()}
</div>
                  {/* Column 4: Date & Location */}
                  <div className="text-xs space-y-0.5">
                    <div className="text-white/70 font-medium">
                      {r.location?.name || "Unknown Location"}
                    </div>
                    <div className="text-white/40">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </div>
                  </div>

                  {/* Column 5: Status Action / Badge */}
                  <div className="flex justify-end">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                        r.status
                      )}`}
                    >
                      {getStatusIcon(r.status)}
                      <span className="capitalize">{r.status || "pending"}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Glass>
    </AppShell>
  );
}