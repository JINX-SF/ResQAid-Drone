import { useEffect, useState } from "react";
import socket from "@/socket";

// this is the shape of data coming from backend every second
interface CameraData {
  name: string;
  scene: string;      // what the drone "sees" — text description
  lat: string;        // current GPS latitude as string
  lng: string;        // current GPS longitude as string
  altitude: number;   // meters above ground
  speed: number;      // km/h
  heading: number;    // compass direction 0-360
  timestamp: string;  // current time as string
  recording: boolean; // is drone actively recording
}

const CameraFeed = () => {
  // default state — shows before any mission starts
  const [camera, setCamera] = useState<CameraData>({
    name: "No drone active",
    scene: "Waiting for mission...",
    lat: "0.000000", lng: "0.000000",
    altitude: 0, speed: 0, heading: 0,
    timestamp: "--:--:--", recording: false,
  });

  const [nightVision, setNightVision] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    // listen for camera data from backend — fires every 1 second during mission
    socket.on("cameraFeed", (data) => {
      setCamera(data); // React re-renders automatically with new data
    });

    // animate the scan line in night vision mode
    const scanInterval = setInterval(() => {
      setScanLine((prev) => (prev + 2) % 100);
    }, 50);

    // cleanup — stop listening when component unmounts
    return () => {
      socket.off("cameraFeed");
      clearInterval(scanInterval);
    };
  }, []);

  // day mode: real satellite map from OpenStreetMap centered on drone GPS
  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${camera.lat},${camera.lng}&zoom=15&size=800x400&markers=${camera.lat},${camera.lng},red`;

  return (
    <div className="relative rounded-xl overflow-hidden flex-1 min-h-[300px] bg-black border border-white/10">

      {/* ── DAY MODE ── */}
      {!nightVision && (
        <>
          <img src={mapUrl} alt="Drone camera"
            className="w-full h-full object-cover absolute inset-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-black/20" />
          {/* corner brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/70" />
          <div className="absolute top-3 right-14 w-6 h-6 border-t-2 border-r-2 border-white/70" />
          <div className="absolute bottom-12 left-3 w-6 h-6 border-b-2 border-l-2 border-white/70" />
          <div className="absolute bottom-12 right-3 w-6 h-6 border-b-2 border-r-2 border-white/70" />
          {/* crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-16 h-16">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/60" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/60" />
              <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 border border-white/70 rounded-full" />
            </div>
          </div>
          {/* top label */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <span className="text-white text-xs font-mono font-bold tracking-widest drop-shadow">
              {camera.name.toUpperCase()}
            </span>
            {camera.recording && (
              <span className="flex items-center gap-1 text-red-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC
              </span>
            )}
          </div>
          {/* scene text */}
          <div className="absolute bottom-16 left-0 right-0 flex justify-center">
            <span className="text-white text-xs font-mono bg-black/50 px-3 py-1 rounded">
              {camera.scene}
            </span>
          </div>
        </>
      )}

      {/* ── NIGHT VISION MODE ── */}
      {nightVision && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-black to-green-950/40" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0,255,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute left-0 right-0 h-px bg-green-400/30 blur-sm" style={{ top: `${scanLine}%` }} />
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-green-400/70" />
          <div className="absolute top-3 right-14 w-6 h-6 border-t-2 border-r-2 border-green-400/70" />
          <div className="absolute bottom-12 left-3 w-6 h-6 border-b-2 border-l-2 border-green-400/70" />
          <div className="absolute bottom-12 right-3 w-6 h-6 border-b-2 border-r-2 border-green-400/70" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-16 h-16">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-green-400/50" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-400/50" />
              <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 border border-green-400/70 rounded-full" />
            </div>
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <span className="text-green-400 text-xs font-mono font-bold tracking-widest">{camera.name.toUpperCase()}</span>
            {camera.recording && (
              <span className="flex items-center gap-1 text-red-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC
              </span>
            )}
          </div>
          <div className="absolute bottom-16 left-0 right-0 flex justify-center">
            <span className="text-green-300 text-xs font-mono bg-black/40 px-3 py-1 rounded">{camera.scene}</span>
          </div>
        </>
      )}

      {/* ── BOTTOM HUD — same in both modes ── */}
      <div className={`absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-2 flex justify-between font-mono text-[10px] ${nightVision ? "text-green-400" : "text-white"}`}>
        <div><div>LAT: {camera.lat}</div><div>LNG: {camera.lng}</div></div>
        <div className="text-center"><div>ALT: {camera.altitude}m</div><div>SPD: {camera.speed} km/h</div></div>
        <div className="text-right"><div>HDG: {camera.heading}°</div><div>{camera.timestamp}</div></div>
      </div>

      {/* ── TOGGLE BUTTON ── */}
      <button
        onClick={() => setNightVision(!nightVision)}
        className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded border border-white/20"
      >
        {nightVision ? "☀️ DAY" : "🌙 NIGHT"}
      </button>
    </div>
  );
};

export default CameraFeed;