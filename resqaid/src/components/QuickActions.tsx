import { useState } from "react";
import API from "../api";

interface Props {
  selectedMission: any;
}

const QuickActions = ({ selectedMission }: Props) => {
  const droneId = selectedMission?.drone?._id || "";
  const [lat, setLat]         = useState("");
  const [lng, setLng]         = useState("");
  const [msg, setMsg]         = useState("");
  const [loading, setLoading] = useState(false);


  const send = async (action: string) => {
    if (!droneId.trim()) return setMsg("⚠️ Enter a drone ID first");
    setLoading(true);
    setMsg("");
    try {
      if (action === "goto") {
        if (!lat || !lng) return setMsg("⚠️ Enter lat and lng");
        await API.post(`/drones/${droneId}/goto`, {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          altitude: 50,
        });
        setMsg(`✅ Drone flying to ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`);
      }
      if (action === "home") {
        await API.post(`/drones/${droneId}/return-home`);
        setMsg("✅ Drone returning to base");
      }
      if (action === "stop") {
        await API.post(`/drones/${droneId}/emergency-stop`);
        setMsg("🛑 Emergency stop executed");
      }
    } catch (err: any) {
      setMsg(`❌ ${err?.response?.data?.message || "Command failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl backdrop-blur-md border border-white/10 bg-black/20 p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">Quick Actions</h3>

    

      <div className="flex gap-2">
        <input
          className="flex-1 bg-white/10 text-white text-xs rounded px-2 py-1.5 placeholder-white/30 border border-white/10 outline-none focus:border-white/30"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          className="flex-1 bg-white/10 text-white text-xs rounded px-2 py-1.5 placeholder-white/30 border border-white/10 outline-none focus:border-white/30"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </div>

      <button
        onClick={() => send("goto")}
        disabled={loading}
        className="w-full bg-green-600/80 hover:bg-green-600 disabled:opacity-50 text-white text-xs py-2 rounded transition-colors font-medium"
      >
        📍 Send to Location
      </button>

      <button
        onClick={() => send("home")}
        disabled={loading}
        className="w-full bg-blue-600/80 hover:bg-blue-600 disabled:opacity-50 text-white text-xs py-2 rounded transition-colors font-medium"
      >
        🏠 Return to Base
      </button>

      <button
        onClick={() => send("stop")}
        disabled={loading}
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