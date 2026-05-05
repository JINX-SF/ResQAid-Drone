import { useEffect, useRef, useState, useCallback } from "react";

interface SimState {
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  time: number;
}

const CameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const simRef = useRef<SimState>({
    lat: 35.6971,
    lng: -0.6308,
    altitude: 85,
    speed: 32,
    heading: 47,
    time: 0,
  });

  const [isFlying, setIsFlying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timestamp, setTimestamp] = useState("--:--:--");

  // ============================
  // 🎥 VIDEO CONTROL
  // ============================
  const startVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setIsFlying(true);
    setRecording(true);
  };

  const stopVideo = () => {
    videoRef.current?.pause();
    setIsFlying(false);
    setRecording(false);
  };

  // ============================
  // 🕒 CLOCK
  // ============================
  useEffect(() => {
    const id = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString("en-GB"));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ============================
  // 🎯 DRAW HUD (overlay)
  // ============================
  const drawHUD = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const sim = simRef.current;

    ctx.clearRect(0, 0, w, h);

    sim.time += 0.016;
    sim.heading = (sim.heading + 0.05) % 360;
    sim.altitude = 85 + Math.sin(sim.time * 0.3) * 8;
    sim.speed = 28 + Math.sin(sim.time * 0.5) * 10;

    // 🎯 CROSSHAIR
    const cx = w / 2;
    const cy = h / 2;

    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx - 30, cy);
    ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 30, cy);
    ctx.moveTo(cx, cy - 30);
    ctx.lineTo(cx, cy - 10);
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx, cy + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();

    // 📊 TEXT
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";

    ctx.fillText(`ALT: ${Math.round(sim.altitude)}m`, 20, h - 40);
    ctx.fillText(`SPD: ${Math.round(sim.speed)} km/h`, 20, h - 20);
    ctx.fillText(`HDG: ${Math.round(sim.heading)}°`, w - 120, h - 20);

    // 🔴 REC BLINK
    if (recording && Math.sin(sim.time * 6) > 0) {
      ctx.fillStyle = "red";
      ctx.fillText("● REC", w / 2 - 20, 30);
    }

    animRef.current = requestAnimationFrame(drawHUD);
  }, [recording]);

  // ============================
  // ▶️ START HUD LOOP
  // ============================
  useEffect(() => {
    animRef.current = requestAnimationFrame(drawHUD);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawHUD]);

  // ============================
  // 📐 CANVAS RESIZE
  // ============================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  const sim = simRef.current;

  return (
    <div className="relative rounded-xl overflow-hidden w-full h-[400px] bg-black border border-white/10">

      {/* 🎥 VIDEO FEED */}
      <video
        ref={videoRef}
        src="/videos/drone.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
      />

      {/* 🎯 HUD OVERLAY */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 🔝 TOP INFO */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-3 text-white font-mono text-xs">
        <span>DR-08</span>
        {recording && (
          <span className="text-red-400 flex items-center gap-1">
            ● REC
          </span>
        )}
      </div>

      {/* 🔻 BOTTOM INFO */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-2 flex justify-between text-white text-xs font-mono">
        <div>
          LAT: {sim.lat.toFixed(6)} <br />
          LNG: {sim.lng.toFixed(6)}
        </div>

        <div>
          ALT: {Math.round(sim.altitude)}m <br />
          SPD: {Math.round(sim.speed)}
        </div>

        <div>
          HDG: {Math.round(sim.heading)}° <br />
          {timestamp}
        </div>
      </div>

      {/* 🎮 CONTROLS */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        <button
          onClick={startVideo}
          className="bg-green-600 px-4 py-2 rounded text-white"
        >
          🚀 Launch
        </button>

        <button
          onClick={stopVideo}
          className="bg-red-600 px-4 py-2 rounded text-white"
        >
          🛑 Emergency Stop
        </button>
      </div>
    </div>
  );
};

export default CameraFeed;