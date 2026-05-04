import { useEffect, useState } from "react";
import socket from "@/socket";

interface DronePos {
  droneId: string;
  name: string;
  lat: number;   // real GPS latitude
  lng: number;   // real GPS longitude
  progress: number; // 0-100%
  heading: number;  // compass direction
  battery: number;
}

interface Target {
  lat: number;
  lng: number;
}

const MissionMap = () => {
  const [dronePos, setDronePos] = useState<DronePos | null>(null);
  const [target, setTarget]     = useState<Target | null>(null);
  const [homeLat, setHomeLat]   = useState<number | null>(null);
  const [homeLng, setHomeLng]   = useState<number | null>(null);

  useEffect(() => {
    // fires every 1 second — moves the drone marker
    socket.on("dronePosition", (data) => {
      setDronePos(data);
    });

    // fires when mission starts — sets the target marker
    socket.on("missionUpdated", (data) => {
      if (data.targetArea) setTarget(data.targetArea);
    });

    return () => {
      socket.off("dronePosition");
      socket.off("missionUpdated");
    };
  }, []);

  // converts GPS coordinate to a percentage position on the map div
  // min/max are the bounds of the visible area
  // flip=true for latitude because Y axis is inverted (north = top = 0%)
  function toPercent(value: number, min: number, max: number, flip = false) {
    const range = max - min || 0.001; // avoid division by zero
    const pct = ((value - min) / range) * 80 + 10; // keep within 10%-90%
    return flip ? 100 - pct : pct;
  }

  const hasData = dronePos !== null;

  // calculate bounding box from drone + target positions
  const latMin = hasData ? Math.min(dronePos.lat, target?.lat ?? dronePos.lat) - 0.005 : 0;
  const latMax = hasData ? Math.max(dronePos.lat, target?.lat ?? dronePos.lat) + 0.005 : 1;
  const lngMin = hasData ? Math.min(dronePos.lng, target?.lng ?? dronePos.lng) - 0.005 : 0;
  const lngMax = hasData ? Math.max(dronePos.lng, target?.lng ?? dronePos.lng) + 0.005 : 1;

  // drone marker position in % — updates every second
  const droneX = hasData ? toPercent(dronePos.lng, lngMin, lngMax) : 30;
  const droneY = hasData ? toPercent(dronePos.lat, latMin, latMax, true) : 30;

  // target marker position in %
  const targetX = target ? toPercent(target.lng, lngMin, lngMax) : 65;
  const targetY = target ? toPercent(target.lat, latMin, latMax, true) : 45;

  return (
    <div className="rounded-xl backdrop-blur-md border border-white/10 bg-black/20 p-4 space-y-3 flex flex-col">
      <h3 className="font-semibold text-sm uppercase text-white tracking-wider text-[10px]">
        Mission Map {hasData && <span className="text-green-400">● LIVE</span>}
      </h3>

      <div className="flex-1 rounded-lg bg-secondary/50 min-h-[140px] relative overflow-hidden">
        {/* map background gradient */}
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 60% 40%, hsl(152 60% 30%), transparent 60%), radial-gradient(circle at 30% 70%, hsl(200 30% 15%), transparent 50%)" }} />

        {/* dashed route line from drone to target — drawn with SVG */}
        {hasData && target && (
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
            <line
              x1={`${droneX}%`} y1={`${droneY}%`}
              x2={`${targetX}%`} y2={`${targetY}%`}
              stroke="rgba(100,200,100,0.5)"
              strokeWidth="1.5"
              strokeDasharray="5,3"
            />
          </svg>
        )}

        {/* drone marker — moves every second via CSS transition */}
        <div
          className="absolute flex flex-col items-center transition-all duration-1000"
          style={{
            left: `${droneX}%`,
            top:  `${droneY}%`,
            transform: "translate(-50%, -50%)"
          }}
        >
          <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse" />
          <span className="text-[9px] text-green-400 mt-0.5 font-medium whitespace-nowrap">
            {dronePos?.name || "DR-08"}
          </span>
          {hasData && (
            <span className="text-[8px] text-green-300">{dronePos.progress}%</span>
          )}
        </div>

        {/* target marker */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: `${targetX}%`,
            top:  `${targetY}%`,
            transform: "translate(-50%, -50%)"
          }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
          <span className="text-[9px] text-red-400 mt-0.5 font-medium">Target</span>
        </div>

        {/* base marker — fixed at bottom left */}
        <div className="absolute bottom-[15%] left-[15%] flex flex-col items-center">
          <div className="w-3 h-3 border-2 border-white/40 rounded-full" />
          <span className="text-[9px] text-white/50 mt-0.5">Base</span>
        </div>
      </div>

      <div className="flex gap-4 text-[9px] text-muted-foreground justify-center">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Drone</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />Base</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Target</span>
        <span className="flex items-center gap-1"><span className="w-3 h-px bg-green-400/50" />Route</span>
      </div>
    </div>
  );
};

export default MissionMap;