import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import socket from "@/socket";

interface CriticalRequest {
  _id: string;
  type: string;
  urgency: string;
  description: string;
  location: { name: string; lat: number; lng: number };
  createdAt: string;
}

export function CriticalAlertPopup() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<CriticalRequest[]>([]);

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const userRole = user?.role ? user.role.toLowerCase() : "user";
  const isAdmin = userRole === "admin";

  // 🧪 DIAGNOSTIC LOG 1: Verify Role Parsing
  console.log("Current Application User Role:", userRole, "| Is Admin?", isAdmin);

  useEffect(() => {
    if (!isAdmin) return;

    // 🧪 DIAGNOSTIC LOG 2: Verify Socket setup status
    console.log("Admin verified! Initializing 'critical-request' socket channel...");

    const handler = (data: CriticalRequest) => {
      console.log("🔥 EMERGENCY LIVE EVENT RECEIVED: ", data);
      setAlerts((prev) => [data, ...prev]);
    };

    socket.on("critical-request", handler);
    return () => {
      socket.off("critical-request", handler);
    };
  }, [isAdmin]);

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a._id !== id));
  };

  const goToRequest = (id: string) => {
    dismiss(id);
    navigate(`/requests/${id}/intelligence`);
  };
  if (!isAdmin || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {alerts.map((alert) => (
        <div
          key={alert._id}
          className="relative rounded-xl shadow-2xl border overflow-hidden animate-slide-in"
          style={{
            background: "linear-gradient(135deg, #1a0a0a, #2d0f0f)",
            borderColor: "#ff3333",
            boxShadow: "0 0 30px rgba(255,50,50,0.4)",
          }}
        >
          {/* Pulsing red top bar */}
          <div
            className="h-1 w-full animate-pulse"
            style={{ background: "linear-gradient(90deg, #ff3333, #ff6600)" }}
          />

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center animate-pulse"
                  style={{ background: "rgba(255,50,50,0.2)", border: "1px solid #ff3333" }}
                >
                  <AlertTriangle className="w-5 h-5" style={{ color: "#ff3333" }} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm tracking-widest uppercase">
                    🚨 {alert.urgency} Alert
                  </p>
                  <p className="text-xs" style={{ color: "#ff6666" }}>
                    New emergency request received
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismiss(alert._id)}
                className="text-gray-400 hover:text-white transition-colors mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div
              className="rounded-lg p-3 mb-3 text-sm"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Type</span>
                <span className="text-white font-semibold capitalize">{alert.type}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Location</span>
                <span className="text-white font-semibold">
                  {alert.location?.name || ` ${alert.location?.lat}, ${alert.location?.lng}`}
                </span>
              </div>
              {alert.description && (
                <div className="mt-2 text-gray-300 text-xs border-t border-white/10 pt-2">
                  {alert.description.slice(0, 80)}{alert.description.length > 80 ? "..." : ""}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => goToRequest(alert._id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#D26E1E" }}
              >
                View Request <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => dismiss(alert._id)}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 transition-colors hover:text-white"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                Dismiss
              </button>
            </div>

            {/* Time */}
            <p className="text-xs text-gray-500 mt-2 text-right">
              {new Date(alert.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}