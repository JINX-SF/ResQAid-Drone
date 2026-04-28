import { AlertTriangle, Plane, Flame } from "lucide-react";
import DroneIcon from "./DroneIcon";

const activities = [
  { icon: <span className="bg-red-700 text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">SOS</span>, title: "New SOS request received", desc: "2 hikers missing near ridge" },
  { icon: <DroneIcon  className="h-4 w-4 text-green-600 text-glow-green" style={{
  filter: "brightness(0) saturate(100%) sepia(100%) hue-rotate(90deg) brightness(1.2)"
}}/>, title: "Drone DR-08 launched", desc: "Heading to search area" },
  { icon: <Flame size={16} className="text-orange-500" />, title: "Thermal target locked", desc: "3 heat sources detected" },
];

const ActivityFeed = () => (
  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
    <h3 className="font-semibold text-sm text-white">Activity feed</h3>
    <div className="space-y-3">
      {activities.map((a, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{a.icon}</div>
          <div>
            <p className="text-sm font-medium text-white leading-tight">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActivityFeed;
