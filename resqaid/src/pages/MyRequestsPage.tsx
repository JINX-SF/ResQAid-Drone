import { useEffect, useState } from "react";
import API from "../api";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get(
          "/emergency-requests/my-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
    if (status === "accepted") {
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    }

    if (status === "rejected") {
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    }

    return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
  };

  const getStatusIcon = (status: string) => {
    if (status === "accepted") {
      return <CheckCircle size={16} />;
    }

    if (status === "rejected") {
      return <XCircle size={16} />;
    }

    return <Clock size={16} />;
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          My Emergency Requests
        </h1>

        <p className="text-white/60 mb-8">
          Track all your emergency requests and rescue progress
        </p>

        {loading ? (
          <div className="text-white/60">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <AlertTriangle
              className="mx-auto mb-4 text-yellow-400"
              size={40}
            />

            <h2 className="text-2xl font-semibold mb-2">
              No requests yet
            </h2>

            <p className="text-white/60">
              You have not sent any emergency requests.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((r) => (
              <div
                key={r._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold capitalize">
                      {r.type}
                    </h2>

                    <p className="text-white/60 mt-1">
                      {r.description}
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-white/70">
                      <div>
                        <strong>Urgency:</strong> {r.urgency}
                      </div>

                      <div>
                        <strong>Location:</strong>{" "}
                        {r.location?.name || "Unknown"}
                      </div>

                      <div>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          r.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                      r.status
                    )}`}
                  >
                    {getStatusIcon(r.status)}

                    <span className="capitalize">
                      {r.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}