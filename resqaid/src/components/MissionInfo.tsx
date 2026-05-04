import { useEffect, useState } from "react";
import socket from "@/socket";

const urgencyColor: Record<string, string> = {
  Critical: "text-red-400",
  High:     "text-orange-400",
  Medium:   "text-yellow-400",
  Low:      "text-green-400",
};

const MissionInfo = () => {
  const [mission, setMission] = useState({
    missionId:  "—",
    title:      "No active mission",
    type:       "—",
    urgency:    "—",
    status:     "pending",
    droneName:  "—",
    startedAt:  "—",
    targetLat:  0,
    targetLng:  0,
  });

  useEffect(() => {
    // fires when mission is assigned or completed
    socket.on("missionUpdated", (data) => {
      setMission((prev) => ({
        ...prev,
        missionId:  data.missionId   || prev.missionId,
        title:      data.title       || prev.title,
        type:       data.type        || prev.type,
        urgency:    data.urgency     || prev.urgency,
        status:     data.status,
        droneName:  data.droneName   || prev.droneName,
        startedAt:  data.startedAt
          ? new Date(data.startedAt).toLocaleTimeString()
          : prev.startedAt,
        targetLat:  data.targetArea?.lat ?? prev.targetLat,
        targetLng:  data.targetArea?.lng ?? prev.targetLng,
      }));
    });

    return () => {
      socket.off("missionUpdated");
    };
  }, []);

  const rows = [
    ["Type",     mission.type],
    ["Status",   mission.status.toUpperCase()],
    ["ID",       mission.missionId.slice(-6)],
    ["Started",  mission.startedAt],
    ["Location", `${mission.targetLat.toFixed(3)}, ${mission.targetLng.toFixed(3)}`],
    ["Drone",    mission.droneName],
    ["Urgency",  mission.urgency],
  ];

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">Mission Information</h3>
      <p className="text-xs text-white/70 font-medium truncate">{mission.title}</p>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className={`text-xs font-medium text-right ${
              label === "Status"
                ? mission.status === "active" ? "text-green-400" : mission.status === "completed" ? "text-blue-400" : "text-gray-400"
                : label === "Urgency"
                ? urgencyColor[value] || "text-white"
                : "text-white"
            }`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionInfo;