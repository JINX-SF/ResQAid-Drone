import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Battery,
  CheckCircle,
  Clock,
  Factory,
  Flame,
  MapPin,
  Package,
  Radar,
  Route,
  Send,
  Shield,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

import AppShell from "@/components/AppShell";
import LeafletMap from "@/components/LeafletMap";

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
      return "Oil & Gas Monitoring";
    case "industrial":
      return "Industrial Inspection";
    case "security":
      return "Security Patrol";
    default:
      return type || "Unknown";
  }
}

function serviceIcon(type: string) {
  switch (type) {
    case "sar":
      return <Users className="h-5 w-5 text-red-300" />;
    case "logistics":
      return <Package className="h-5 w-5 text-blue-300" />;
    case "oilgas":
      return <Flame className="h-5 w-5 text-orange-300" />;
    case "industrial":
      return <Factory className="h-5 w-5 text-yellow-300" />;
    case "security":
      return <Shield className="h-5 w-5 text-green-300" />;
    default:
      return <Activity className="h-5 w-5 text-white" />;
  }
}

function urgencyClass(urgency?: string) {
  const u = urgency?.toLowerCase();

  if (u === "critical") return "bg-red-500 text-white";
  if (u === "high") return "bg-orange-500 text-white";
  if (u === "medium") return "bg-yellow-500 text-black";

  return "bg-green-500 text-white";
}

function statusClass(status?: string) {
  const s = status?.toLowerCase();

  if (s === "accepted") return "bg-green-500 text-white";
  if (s === "rejected") return "bg-red-500 text-white";
  if (s === "pending") return "bg-yellow-500 text-black";

  return "bg-blue-500 text-white";
}

function formatDate(date?: string) {
  if (!date) return "Unknown";

  return new Date(date).toLocaleString();
}

function shortId(id?: string) {
  return id?.slice(-6) || "------";
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-white">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
  );
}

function predictionFor(req: RequestItem) {
  const type = req.type;
  const details = req.details || {};

  if (type === "sar") {
    return {
      drone: "Thermal Rescue Drone",
      sensors: ["Thermal Camera", "HD Camera", "GPS Tracker"],
      duration: "18 - 25 min",
      battery: "35%",
      risk: req.urgency === "Critical" ? "High" : "Medium",
      success: "82%",
      notes: [
        "Start with thermal scanning around the selected coordinates.",
        "Prioritize trapped or injured people first.",
        "Keep manual operator ready because SAR missions are unpredictable.",
      ],
    };
  }

  if (type === "logistics") {
    return {
      drone: "Cargo Delivery Drone",
      sensors: ["GPS", "Weight Sensor", "Stabilized Camera"],
      duration: "20 - 35 min",
      battery: "45%",
      risk: details.priority === "Critical" ? "High" : "Medium",
      success: "88%",
      notes: [
        "Check payload weight before dispatch.",
        "Use safest route between pickup and delivery zones.",
        "For medical supplies, choose fastest route and priority landing zone.",
      ],
    };
  }

  if (type === "oilgas") {
    return {
      drone: "Industrial Long-Range Drone",
      sensors: ["Thermal Camera", "Gas Sensor", "Zoom Camera"],
      duration: "30 - 60 min",
      battery: "60%",
      risk: "High",
      success: "79%",
      notes: [
        "Use thermal scan to detect overheating or possible leaks.",
        "Fly parallel to pipeline or around the selected infrastructure.",
        "Generate anomaly report after mission completion.",
      ],
    };
  }

  if (type === "industrial") {
    return {
      drone: "Inspection Drone",
      sensors: ["Zoom Camera", "Thermal Camera", "AI Crack Detection"],
      duration: "25 - 45 min",
      battery: "50%",
      risk: "Medium",
      success: "86%",
      notes: [
        "Keep stable altitude around the inspected structure.",
        "Enable AI analysis for cracks, corrosion, and overheating.",
        "Avoid close flight near cables or metallic structures.",
      ],
    };
  }

  return {
    drone: "Security Surveillance Drone",
    sensors: ["Night Vision", "HD Camera", "AI Detection"],
    duration: "40 - 90 min",
    battery: "70%",
    risk: "Medium",
    success: "84%",
    notes: [
      "Use perimeter route and keep live monitoring enabled.",
      "Activate AI detection for people, vehicles, and suspicious activity.",
      "For night patrol, enable night vision mode.",
    ],
  };
}

function DetailsBlock({ request }: { request: RequestItem }) {
  const d = request.details || {};

  if (request.type === "sar") {
    return (
      <>
        <InfoRow label="People" value={d.people} />
        <InfoRow label="Conditions" value={Array.isArray(d.conditions) ? d.conditions.join(", ") : d.conditions} />
        <InfoRow label="Urgency Type" value={Array.isArray(d.urgencyTypes) ? d.urgencyTypes.join(", ") : d.urgencyTypes} />
        <InfoRow label="Emergency Level" value={d.urgency} />
      </>
    );
  }

  if (request.type === "logistics") {
    return (
      <>
        <InfoRow label="Payload Type" value={d.payloadType} />
        <InfoRow label="Payload Weight" value={d.payloadWeight ? `${d.payloadWeight} kg` : "Not provided"} />
        <InfoRow label="Priority" value={d.priority} />
        <InfoRow label="Schedule Type" value={d.scheduleType} />
        <InfoRow label="Schedule Time" value={d.scheduleTime} />
      </>
    );
  }

  if (request.type === "oilgas") {
    return (
      <>
        <InfoRow label="Infrastructure Type" value={d.infrastructureType} />
        <InfoRow label="Monitoring Purpose" value={d.monitoringPurpose} />
        <InfoRow label="Area Size" value={d.areaSize ? `${d.areaSize} km²` : "Not provided"} />
        <InfoRow label="Frequency" value={d.frequency} />
        <InfoRow label="Risk Level" value={d.riskLevel} />
        <InfoRow label="Sensor Type" value={d.sensorType} />
      </>
    );
  }

  if (request.type === "industrial") {
    return (
      <>
        <InfoRow label="Facility Type" value={d.facilityType} />
        <InfoRow label="Inspection Type" value={d.inspectionType} />
        <InfoRow label="Height" value={d.height ? `${d.height} m` : "Not provided"} />
        <InfoRow label="Priority" value={d.priority} />
        <InfoRow label="AI Analysis" value={d.aiAnalysis} />
      </>
    );
  }

  if (request.type === "security") {
    return (
      <>
        <InfoRow label="Patrol Type" value={d.patrolType} />
        <InfoRow label="Threat Type" value={d.threatType} />
        <InfoRow label="Duration" value={d.duration} />
        <InfoRow label="Surveillance Mode" value={d.surveillanceMode} />
        <InfoRow label="Alert Sensitivity" value={d.alertSensitivity} />
        <InfoRow label="Night Vision" value={d.nightVision} />
      </>
    );
  }

  return <InfoRow label="Details" value="No details available" />;
}

export default function RequestPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrediction, setShowPrediction] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);

  const fetchRequest = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/emergency-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.data) {
  setRequest(data.data);
} else {
  setRequest(data);
}
    } catch (error) {
      console.error("Failed to fetch request:", error);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: "accepted" | "rejected") => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/emergency-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.request) {
        setRequest(data.request);
      } else {
        await fetchRequest();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update request status");
    }
  };

  const handlePrediction = () => {
    setPredictionLoading(true);
    setShowPrediction(false);

    setTimeout(() => {
      setPredictionLoading(false);
      setShowPrediction(true);
    }, 900);
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center text-white">
          Loading request...
        </div>
      </AppShell>
    );
  }

  if (!request) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-white">
          <p>Request not found.</p>
          <button
            onClick={() => navigate("/EmergencyRequestsPage")}
            className="rounded-lg bg-primary px-5 py-2 text-primary-foreground"
          >
            Go Back
          </button>
        </div>
      </AppShell>
    );
  }

  const prediction = predictionFor(request);

  const mapPin =
    request.location?.lat && request.location?.lng
      ? {
          lat: request.location.lat,
          lng: request.location.lng,
        }
      : null;

  return (
    <AppShell>
      <div className="relative z-10 w-full px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Glass className="p-6">
            <button
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to requests
            </button>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
                  {serviceIcon(request.type)}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Request #{shortId(request._id)}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {serviceLabel(request.type)} request submitted by{" "}
                    {request.user?.name || "Unknown user"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                      {serviceLabel(request.type)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${urgencyClass(request.urgency)}`}>
                      {request.urgency || "Medium"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(request.status || "pending")}`}>
                      {request.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Submitted:{" "}
                <span className="font-semibold text-white">
                  {formatDate(request.createdAt)}
                </span>
              </div>
            </div>
          </Glass>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Glass className="p-6">
                <SectionTitle
                  icon={<Activity className="h-5 w-5 text-primary" />}
                  title="Mission Details"
                />

                <DetailsBlock request={request} />
              </Glass>

              <Glass className="p-6">
                <SectionTitle
                  icon={<MapPin className="h-5 w-5 text-primary" />}
                  title={request.type === "logistics" ? "Route Information" : "Location"}
                />

                {request.type === "logistics" && (
                  <>
                    <InfoRow label="Pickup From" value={request.fromLocation?.name} />
                    <InfoRow
                      label="Pickup Coordinates"
                      value={
                        request.fromLocation?.lat && request.fromLocation?.lng
                          ? `${request.fromLocation.lat}, ${request.fromLocation.lng}`
                          : "Not provided"
                      }
                    />
                  </>
                )}

                <InfoRow
                  label={request.type === "logistics" ? "Delivery To" : "Mission Location"}
                  value={request.location?.name}
                />

                <InfoRow
                  label="Coordinates"
                  value={
                    request.location?.lat && request.location?.lng
                      ? `${request.location.lat}, ${request.location.lng}`
                      : "Not provided"
                  }
                />

                <div className="mt-5 h-72 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  {mapPin ? (
                    <LeafletMap
                      userPin={mapPin}
                      onLocationPick={() => {}}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No map location available
                    </div>
                  )}
                </div>
              </Glass>

              <Glass className="p-6">
                <SectionTitle
                  icon={<AlertTriangle className="h-5 w-5 text-primary" />}
                  title="Additional Description"
                />

                <p className="min-h-[90px] rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white">
                  {request.description || "No description provided."}
                </p>
              </Glass>
            </div>

            <div className="space-y-6">
              <Glass className="p-6">
                <SectionTitle
                  icon={<Sparkles className="h-5 w-5 text-yellow-300" />}
                  title="Mission Prediction"
                />

                <button
                  onClick={handlePrediction}
                  className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-4 font-bold text-black hover:bg-yellow-300"
                >
                  <Sparkles className="h-5 w-5" />
                  Mission's Prediction
                </button>

                {predictionLoading && (
                  <div className="rounded-xl border border-yellow-300/30 bg-yellow-400/10 p-4 text-sm text-yellow-200">
                    Analyzing mission data...
                  </div>
                )}

                {showPrediction && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Radar className="h-4 w-4 text-primary" />
                        Recommended Drone
                      </div>
                      <p className="mt-2 text-lg font-bold text-white">{prediction.drone}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <Clock className="h-4 w-4 text-blue-300" />
                        <p className="mt-2 text-xs text-muted-foreground">Duration</p>
                        <p className="font-bold text-white">{prediction.duration}</p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <Battery className="h-4 w-4 text-green-300" />
                        <p className="mt-2 text-xs text-muted-foreground">Battery Use</p>
                        <p className="font-bold text-white">{prediction.battery}</p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <AlertTriangle className="h-4 w-4 text-red-300" />
                        <p className="mt-2 text-xs text-muted-foreground">Risk</p>
                        <p className="font-bold text-white">{prediction.risk}</p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <CheckCircle className="h-4 w-4 text-emerald-300" />
                        <p className="mt-2 text-xs text-muted-foreground">Success</p>
                        <p className="font-bold text-white">{prediction.success}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <p className="mb-3 text-sm font-bold text-white">Suggested Sensors</p>
                      <div className="flex flex-wrap gap-2">
                        {prediction.sensors.map((sensor) => (
                          <span
                            key={sensor}
                            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                          >
                            {sensor}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <p className="mb-3 text-sm font-bold text-white">AI Notes</p>
                      <div className="space-y-2">
                        {prediction.notes.map((note) => (
                          <div key={note} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-300" />
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Glass>

              <Glass className="p-6">
                <SectionTitle
                  icon={<Route className="h-5 w-5 text-primary" />}
                  title="Admin Actions"
                />

                <div className="space-y-3">
                  <button
                    onClick={() => updateStatus("accepted")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Accept Request
                  </button>

                  <button
                    onClick={() => updateStatus("rejected")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject Request
                  </button>

                  <button
                    onClick={() => navigate(`/missions/create?requestId=${request._id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground hover:opacity-90"
                  >
                    <Send className="h-5 w-5" />
                    Create Mission
                  </button>
                </div>
              </Glass>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}