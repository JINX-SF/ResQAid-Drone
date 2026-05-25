import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Activity,
  Clock,
  Eye,
  MapPin,
  Shield,
  Package,
  Factory,
  Flame,
  Users,
} from "lucide-react";

import AppShell from "@/components/AppShell";
<<<<<<< Updated upstream
import { saveCache, loadCache } from "@/utils/offlineCache";


=======
import {  useLocation } from "react-router-dom";
>>>>>>> Stashed changes

type RequestItem = {
  _id: string;
  type: string;
  urgency: string;
  status?: string;
  description?: string;
  location?: {
    name?: string;
    lat?: number;
    lng?: number;
  };
  fromLocation?: {
    name?: string;
    lat?: number;
    lng?: number;
  };
  details?: any;
  user?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  );
}

function serviceLabel(type: string) {
  switch (type) {
    case "sar":
      return "Search & Rescue";
    case "logistics":
      return "Remote Logistics";
    case "oilgas":
      return "Oil & Gas";
    case "industrial":
      return "Industrial";
    case "security":
      return "Security Patrol";
    default:
      return type || "Unknown";
  }
}

function serviceIcon(type: string) {
  switch (type) {
    case "sar":
      return <Users className="h-4 w-4 text-red-300" />;
    case "logistics":
      return <Package className="h-4 w-4 text-blue-300" />;
    case "oilgas":
      return <Flame className="h-4 w-4 text-orange-300" />;
    case "industrial":
      return <Factory className="h-4 w-4 text-yellow-300" />;
    case "security":
      return <Shield className="h-4 w-4 text-green-300" />;
    default:
      return <Activity className="h-4 w-4 text-white" />;
  }
}

function urgencyClass(urgency: string) {
  const u = urgency?.toLowerCase();

  if (u === "critical") return "bg-red-500/90 text-white border-red-300/30";
  if (u === "high") return "bg-orange-500/80 text-white border-orange-300/30";
  if (u === "medium") return "bg-yellow-500/80 text-black border-yellow-300/30";

  return "bg-green-500/80 text-white border-green-300/30";
}

function statusClass(status: string) {
  const s = status?.toLowerCase();

  if (s === "accepted") return "bg-green-500/80 text-white";
  if (s === "rejected") return "bg-red-500/80 text-white";
  if (s === "pending") return "bg-yellow-500/80 text-black";

  return "bg-blue-500/80 text-white";
}

function formatTime(date?: string) {
  if (!date) return "Unknown";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string) {
  return id?.slice(-6) || "------";
}

export default function EmergencyRequestsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
   try {
  setLoading(true);

  const token = localStorage.getItem("token");

  const res = await fetch(
    "http://localhost:5000/api/emergency-requests",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  // save data locally for offline mode
  saveCache("emergencyRequests", data);

  if (Array.isArray(data)) {
    setRequests(data);

  } else if (Array.isArray(data.requests)) {
    setRequests(data.requests);

  } else {
    setRequests([]);
  }

} catch (error) {

  console.error(
    "Failed to fetch emergency requests:",
    error
  );

  // load cached data if internet/backend fails
  const cached = loadCache("emergencyRequests");

  if (cached) {

    if (Array.isArray(cached)) {
      setRequests(cached);

    } else if (Array.isArray(cached.requests)) {
      setRequests(cached.requests);

    } else {
      setRequests([]);
    }

  } else {
    setRequests([]);
  }

} finally {
  setLoading(false);
}
  };
const location = useLocation();
  useEffect(() => {
    fetchRequests();
  }, [location.key]);

  return (
    <AppShell>
      <div className="relative z-10 w-full px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Glass className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Emergency Requests</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review submitted drone mission requests and convert them into operational missions.
                </p>
              </div>

              <button
                onClick={fetchRequests}
                className="rounded-xl border border-white/10 bg-black/40 px-5 py-2.5 text-sm font-semibold text-white hover:border-primary"
              >
                Refresh
              </button>
            </div>
          </Glass>

          <Glass className="overflow-hidden">
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-white">Submitted Requests</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Urgency</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        Loading requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        No emergency requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr
                        key={req._id}
                        className="border-b border-white/5 transition hover:bg-white/5"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-white">
                          #{shortId(req._id)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40">
                              {serviceIcon(req.type)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {serviceLabel(req.type)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {req.user?.email || "Unknown user"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-white">
                          {req.user?.name || "Unknown user"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${urgencyClass(
                              req.urgency
                            )}`}
                          >
                            {req.urgency || "Medium"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-white">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatTime(req.createdAt)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex max-w-[260px] items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">
                              {req.location?.name ||
                                (req.location?.lat && req.location?.lng
                                  ? `Lat: ${req.location.lat} · Lng: ${req.location.lng}`
                                  : "Unknown")}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                              req.status || "pending"
                            )}`}
                          >
                            {req.status || "pending"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/requests/${req._id}`)}
                            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Glass>
        </div>
      </div>
    </AppShell>
  );
}