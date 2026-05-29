import { useEffect, useState } from "react";
import { Battery, Wind, Eye, Thermometer } from "lucide-react";
import socket from "@/socket";
import API from "@/api";

interface Props {
  selectedMission: any | null;
}

const DroneStatus = ({ selectedMission }: Props) => {
  const [name, setName]         = useState("No drone active");
  const [status, setStatus]     = useState("idle");
  const [battery, setBattery]   = useState(100);
  const [draining, setDraining] = useState(false);
  const [speed, setSpeed]       = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [heading, setHeading]   = useState(0);

  const [wind, setWind]           = useState(0);
  const [temp, setTemp]           = useState(20);
  const [vis, setVis]             = useState(10);
  const [condition, setCondition] = useState("Clear");
  const [flyable, setFlyable]     = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // ── When selected mission changes, pull fresh drone info & weather ──────
  useEffect(() => {
    const drone = selectedMission?.drone;
    if (!drone) {
      setName("No drone active");
      setStatus("idle");
      setBattery(100);
      setDraining(false);
      setSpeed(0);
      setAltitude(0);
      setHeading(0);
      return;
    }

    // Set drone info directly from the populated mission object
    setName(drone.name || "Unknown");
    setStatus(drone.status || "idle");
    setBattery(drone.battery ?? 100);
    setSpeed(0);       // real-time speed comes via socket
    setAltitude(0);
    setHeading(0);
    setDraining(false);

    // Fetch weather for the mission's target area
    const lat = selectedMission.targetArea?.lat;
const lng = selectedMission.targetArea?.lng;

if (lat !== undefined && lng !== undefined) {
      setWeatherLoading(true);
      API.get(`/weather?lat=${lat}&lng=${lng}`)
        .then((res) => {
          const w = res.data;
          setWind(w.windSpeed   ?? 0);
          setTemp(w.temperature ?? 20);
          setVis(w.visibility   ?? 10);
          setCondition(w.condition ?? "Clear");
          setFlyable(w.isFlyable  ?? true);
        })
        
        .catch((err) => {
          console.warn("Weather fetch failed:", err);
        })
        .finally(() => setWeatherLoading(false));
    }
  }, [selectedMission]);

  // ── Real-time socket updates (flight telemetry) ─────────────────────────
  useEffect(() => {
    socket.on("batteryUpdate", (data) => {
      setBattery(data.battery);
      setDraining(data.draining);
      if (data.name) setName(data.name);
    });

    socket.on("dronePosition", (data) => {
      setSpeed(data.speed);
      setAltitude(data.altitude);
      setHeading(data.heading);
      if (data.name) setName(data.name);
    });

    socket.on("droneUpdated", (data) => {
      if (data.name) setName(data.name);
      setStatus(data.status);
      setBattery(data.battery);
      if (data.status !== "in_mission") {
        setSpeed(0);
        setAltitude(0);
        setDraining(false);
      }
    });

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

      {/* battery bar */}
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

      {/* flight data — real-time from simulation */}
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
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          Weather {weatherLoading && <span className="text-yellow-400/70">· loading…</span>}
        </p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="text-white flex items-center gap-1"><Wind size={10} className="text-blue-400" /> {wind} km/h</span>
          <span className="text-white flex items-center gap-1"><Thermometer size={10} className="text-orange-400" /> {temp}°C</span>
          <span className="text-white flex items-center gap-1"><Eye size={10} className="text-purple-400" /> {vis} km</span>
          <span className={`font-medium ${flyable ? "text-green-400" : "text-red-400"}`}>
            {flyable ? "✓ Flyable" : "✗ Unsafe"}
          </span>
        </div>
        {condition !== "Clear" && (
          <p className="text-[10px] text-white/50 mt-1">{condition}</p>
        )}
      </div>
    </div>
  );
};

export default DroneStatus;