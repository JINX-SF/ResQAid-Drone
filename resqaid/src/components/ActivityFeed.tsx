import { useEffect, useState } from "react";
import { Plane, AlertTriangle, CheckCircle, MapPin, Home } from "lucide-react";
import socket from "@/socket";

interface Activity {
  id: number;
  type: string;
  title: string;
  desc: string;
  time: string;
}

// icon and color for each event type
const config: Record<string, { icon: JSX.Element; color: string }> = {
  mission_started:   { icon: <Plane size={14} />,          color: "text-green-400" },
  mission_completed: { icon: <CheckCircle size={14} />,     color: "text-blue-400" },
  manual_flight:     { icon: <MapPin size={14} />,          color: "text-yellow-400" },
  waypoint_reached:  { icon: <MapPin size={14} />,          color: "text-green-300" },
  return_home:       { icon: <Home size={14} />,            color: "text-blue-300" },
  emergency:         { icon: <AlertTriangle size={14} />,   color: "text-red-400" },
  default:           { icon: <Plane size={14} />,           color: "text-white/60" },
};

let idCounter = 0;

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 0, type: "default", title: "System ready", desc: "Waiting for missions...", time: new Date().toLocaleTimeString() },
  ]);

  useEffect(() => {
    // fires whenever something happens — mission starts, completes, emergency, etc.
    socket.on("activityEvent", (data) => {
      const newEvent: Activity = {
        id:    ++idCounter,
        type:  data.type,
        title: data.title,
        desc:  data.desc,
        time:  data.time,
      };
      // add to top, keep max 20 events
      setActivities((prev) => [newEvent, ...prev].slice(0, 20));
    });

    return () => {
      socket.off("activityEvent");
    };
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-sm text-white">Activity Feed</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {activities.map((a) => {
          const { icon, color } = config[a.type] || config.default;
          return (
            <div key={a.id} className="flex items-start gap-3">
              <div className={`mt-0.5 shrink-0 ${color}`}>{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white leading-tight">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
              </div>
              <span className="text-[9px] text-muted-foreground shrink-0">{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;