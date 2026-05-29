const urgencyColor: Record<string, string> = {
  Critical: "text-red-400",
  High:     "text-orange-400",
  Medium:   "text-yellow-400",
  Low:      "text-green-400",
};

interface Props {
  selectedMission: any | null;
}

const MissionInfo = ({ selectedMission }: Props) => {
  const m = selectedMission;

  if (!m) {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-white text-sm">Mission Information</h3>
        <p className="text-xs text-white/40 italic">No active mission</p>
        <div className="space-y-2">
          {["Type", "Status", "ID", "Started", "Location", "Drone", "Urgency"].map((label) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-muted-foreground text-xs">{label}</span>
              <span className="text-xs font-medium text-white/30">—</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const targetLat = m.targetArea?.lat ?? 0;
  const targetLng = m.targetArea?.lng ?? 0;
  const startedAt = m.startedAt
    ? new Date(m.startedAt).toLocaleTimeString()
    : "—";
  const droneName = m.drone?.name || "—";
  const status = m.status || "pending";
  const urgency = m.urgency || "—";

  const rows: [string, string][] = [
    ["Type",     m.type     || "—"],
    ["Status",   status.toUpperCase()],
    ["ID",       m._id ? m._id.slice(-6) : "—"],
    ["Started",  startedAt],
    ["Location", `${targetLat.toFixed(3)}, ${targetLng.toFixed(3)}`],
    ["Drone",    droneName],
    ["Urgency",  urgency],
  ];

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">Mission Information</h3>
      <p className="text-xs text-white/70 font-medium truncate">{m.title || "—"}</p>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className={`text-xs font-medium text-right ${
              label === "Status"
                ? status === "active" ? "text-green-400" : status === "completed" ? "text-blue-400" : "text-gray-400"
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