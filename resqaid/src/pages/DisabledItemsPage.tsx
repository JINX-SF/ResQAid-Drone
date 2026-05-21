import { useEffect, useState } from "react";
import API from "../api";

export default function DisabledItemsPage() {
  const [drones, setDrones] = useState<any[]>([]);
  const [disabledMissions, setDisabledMissions] = useState([]);

  const fetchDisabled = async () => {
    const res = await API.get("/drones/disabled");
    setDrones(res.data.data || []);
  };

  useEffect(() => {
    fetchDisabled();
    fetchDisabledMissions();
  }, []);

  const reactivateDrone = async (id: string) => {
    await API.patch(`/drones/${id}/reactivate`);
    fetchDisabled();
  };

  const fetchDisabledMissions = async () => {
  try {
    const res = await API.get("/missions/disabled");

    setDisabledMissions(res.data.data);
  } catch (err) {
    console.error(err);
  }
};
const reactivateMission = async (id: string) => {
  try {
    await API.patch(`/missions/${id}/reactivate`);

    setDisabledMissions((prev: any) =>
      prev.filter((m: any) => m._id !== id)
    );
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen bg-[#07110d] text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Disabled Drones & Missions
      </h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-2xl font-semibold mb-5">
          Disabled Drones
        </h2>

        {drones.length === 0 ? (
          <p className="text-white/50">No disabled drones.</p>
        ) : (
          <div className="space-y-4">
            {drones.map((d) => (
              <div
                key={d._id}
                className="flex items-center justify-between rounded-xl bg-black/30 p-4 border border-white/10"
              >
                <div>
                  <div className="font-bold">{d.name}</div>
                  <div className="text-sm text-white/50">
                    Battery: {d.battery}% — Location: {d.location?.lat}, {d.location?.lng}
                  </div>
                </div>

                <button
                  onClick={() => reactivateDrone(d._id)}
                  className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-400"
                >
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
  <h2 className="text-2xl font-semibold mb-5">
    Disabled Missions
  </h2>

  {disabledMissions.length === 0 ? (
    <p className="text-white/50">
      No disabled missions.
    </p>
  ) : (
    <div className="space-y-4">
      {disabledMissions.map((m) => (
        <div
          key={m._id}
          className="flex items-center justify-between rounded-xl bg-black/30 p-4 border border-white/10"
        >
          <div>
            <div className="font-bold capitalize">
              {m.title}
            </div>

            <div className="text-sm text-white/50">
              Type: {m.type} — Status: {m.status}
            </div>

            <div className="text-sm text-white/40 mt-1">
              Drone:{" "}
              {m.drone?.name || "No drone assigned"}
            </div>
          </div>

          <button
            onClick={() => reactivateMission(m._id)}
            className="
              rounded-xl
              bg-cyan-500
              px-5
              py-2
              font-semibold
              text-white
              transition-all
              hover:bg-cyan-400
              shadow-lg
              shadow-cyan-500/30
            "
          >
            Reactivate
          </button>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
}