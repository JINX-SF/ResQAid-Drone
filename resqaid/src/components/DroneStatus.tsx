import { useEffect, useState } from "react";
import { Battery, Wind, Eye, Thermometer } from "lucide-react";
import socket from "@/socket";

const DroneStatus = () => {
  const [name, setName]         = useState("No drone active");
  const [status, setStatus]     = useState("idle");
  const [battery, setBattery]   = useState(100);
  const [draining, setDraining] = useState(false);
  const [speed, setSpeed]       = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [heading, setHeading]   = useState(0);

  const [wind, setWind]         = useState(0);
  const [temp, setTemp]         = useState(20);
  const [vis, setVis]           = useState(10);
  const [condition, setCondition] = useState("Clear");
  const [flyable, setFlyable]   = useState(true);

  useEffect(() => {
    // battery bar — fires every 1 second during mission
    socket.on("batteryUpdate", (data) => {
      setName(data.name);
      setBattery(data.battery);
      setDraining(data.draining);
    });

    // speed, altitude, heading — fires every 1 second during mission
    socket.on("dronePosition", (data) => {
      setName(data.name);
      setSpeed(data.speed);
      setAltitude(data.altitude);
      setHeading(data.heading);
    });

    // drone status changed (idle, in_mission, maintenance)
    socket.on("droneUpdated", (data) => {
      setName(data.name);
      setStatus(data.status);
      setBattery(data.battery);
      if (data.status !== "in_mission") {
        setSpeed(0);
        setAltitude(0);
        setDraining(false);
      }
    });

    // weather data — fires before each mission
    socket.on("weatherUpdate", (data) => {
      setWind(data.windSpeed);
      setTemp(data.temperature);
      setVis(data.visibility);
      setCondition(data.condition);
      setFlyable(data.isFlyable);
    });

    return () => {
      socket.off("batteryUpdate");
      socket.off("dronePosition");
      socket.off("droneUpdated");
      socket.off("weatherUpdate");
    };
  }, []);

  const batteryColor =
    battery > 50 ? "text-green-400" :
    battery > 20 ? "text-yellow-400" : "text-red-400";

  const batteryBar =
    battery > 50 ? "bg-green-500" :
    battery > 20 ? "bg-yellow-500" : "bg-red-500";

  const statusColor =
    status === "in_mission" ? "text-green-400" :
    status === "maintenance" ? "text-red-400" : "text-gray-400";

  return (
    <div className="glass rounded-xl backdrop-blur-md border border-white/10 p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">Drone Status</h3>

      <div className="flex items-center gap-3">
        <div className="w-12 h-8 rounded bg-secondary flex items-center justify-center text-lg">🛩️</div>
        <div>
          <p className="text-sm text-white font-semibold">{name}</p>
          <p className={`text-[10px] ${statusColor}`}>
            {status === "in_mission" ? "● In Mission" : status === "maintenance" ? "● Maintenance" : "● Idle"}
          </p>
        </div>
      </div>

      {/* battery bar — animates every second */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Battery size={12} /> Battery {draining ? "▼" : ""}
          </span>
          <span className={`text-xs font-bold ${batteryColor}`}>{battery}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${batteryBar}`}
            style={{ width: `${battery}%` }}
          />
        </div>
      </div>

      {/* flight data */}
      <div className="space-y-1.5">
        {[
          ["Speed",    `${speed} km/h`],
          ["Altitude", `${altitude} m`],
          ["Heading",  `${heading}°`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="text-xs text-white font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* weather */}
      <div className="border-t border-white/10 pt-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Weather</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="text-white flex items-center gap-1"><Wind size={10} className="text-blue-400" /> {wind} km/h</span>
          <span className="text-white flex items-center gap-1"><Thermometer size={10} className="text-orange-400" /> {temp}°C</span>
          <span className="text-white flex items-center gap-1"><Eye size={10} className="text-purple-400" /> {vis} km</span>
          <span className={`font-medium ${flyable ? "text-green-400" : "text-red-400"}`}>
            {flyable ? "✓ Flyable" : "✗ Unsafe"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DroneStatus;