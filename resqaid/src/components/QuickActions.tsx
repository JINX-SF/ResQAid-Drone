import { useState } from "react";
import API from "../api";

interface Props {
  selectedMission: any;
}

const QuickActions = ({ selectedMission }: Props) => {
  const droneId = selectedMission?.drone?._id || "";

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const playAudio = (file: string) => {
    const audio = new Audio(`/audio/${file}`);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  };

  const send = async (action: string) => {
    if (!droneId) {
      return setMsg("⚠️ No drone assigned to this mission");
    }

    setLoading(true);
    setMsg("");

    try {
      if (action === "goto") {
        const target =
          selectedMission?.targetArea ||
          selectedMission?.departureLocation;

        if (!target) {
          return setMsg("⚠️ Mission has no target location");
        }

        await API.post(`/drones/${droneId}/goto`, {
          lat: target.lat,
          lng: target.lng,
          altitude: 80,
        });

        playAudio("soundOftakeoff.m4a");

        setTimeout(() => {
          playAudio("Started.m4a");
        }, 1200);

        setMsg(
          `🚁 ${selectedMission?.drone?.name || "Drone"} launched to target`
        );
      }

      if (action === "home") {
        await API.post(`/drones/${droneId}/return-home`);

        playAudio("SoundOfStartEnd.m4a");

        setTimeout(() => {
          playAudio("Returnbase.m4a");
        }, 1000);

        setMsg("🏠 Drone returning to base");
      }

      if (action === "stop") {
        await API.post(`/drones/${droneId}/emergency-stop`);

        playAudio("Sound of stop.m4a");

        setTimeout(() => {
          playAudio("Stop.m4a");
        }, 1000);

        setMsg("🛑 Emergency stop executed");
      }
    } catch (err: any) {
      setMsg(
        `❌ ${
          err?.response?.data?.message ||
          "Command failed"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl backdrop-blur-md border border-white/10 bg-black/20 p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">
        Quick Actions
      </h3>

      {/* Mission Summary */}
      <div className="bg-white/5 rounded-lg p-3 text-xs space-y-1 border border-white/10">
        <div className="text-white/70">
          Mission:
          <span className="text-cyan-400 ml-2 font-medium">
            {selectedMission?.title || "None"}
          </span>
        </div>

        <div className="text-white/70">
          Drone:
          <span className="text-green-400 ml-2 font-medium">
            {selectedMission?.drone?.name || "None"}
          </span>
        </div>

        <div className="text-white/70">
          Status:
          <span className="text-orange-400 ml-2 font-medium">
            {selectedMission?.status || "Unknown"}
          </span>
        </div>
      </div>

      <button
        onClick={() => send("goto")}
        disabled={loading || !selectedMission}
        className="w-full bg-green-600/80 hover:bg-green-600 disabled:opacity-50 text-white text-xs py-2 rounded transition-colors font-medium"
      >
        📍 Send To Location
      </button>

      <button
        onClick={() => send("home")}
        disabled={loading || !selectedMission}
        className="w-full bg-blue-600/80 hover:bg-blue-600 disabled:opacity-50 text-white text-xs py-2 rounded transition-colors font-medium"
      >
        🏠 Return To Base
      </button>

      <button
        onClick={() => send("stop")}
        disabled={loading || !selectedMission}
        className="w-full bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white text-xs py-2 rounded transition-colors font-medium"
      >
        🛑 Emergency Stop
      </button>

      {msg && (
        <p className="text-[10px] text-center text-white/80 bg-white/5 rounded px-2 py-1.5">
          {msg}
        </p>
      )}
    </div>
  );
};

export default QuickActions;