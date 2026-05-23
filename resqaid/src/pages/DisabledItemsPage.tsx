import { useEffect, useState } from "react";
import API from "../api";

export default function DisabledItemsPage() {
  const [disabledDrones, setDisabledDrones] = useState<any[]>([]);

  const [selectedDroneToReactivate, setSelectedDroneToReactivate] = useState<any>(null);

  const [showReactivateDroneModal, setshowReactivateDroneModal] = useState(false);
  const [showReactivateMissionModal, setshowReactivateMissionModal] = useState(false);

  const [selectedMissionToReactivate, setSelectedMissionToReactivate] = useState<any>(null);

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

  const handleReactivateDrone = async () => {
    try {
      await API.patch(`/drones/${selectedDroneToReactivate._id}/reactivate`);

      // remove drone instantly from disabled page
      setDrones((prev) => prev.filter((d) => d._id !== selectedDroneToReactivate._id));

      // close modal
      setshowReactivateDroneModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReactivateMission = async () => {
    try {
      await API.patch(`/missions/${selectedMissionToReactivate._id}/reactivate`);

      setDisabledMissions((prev) => prev.filter((m) => m._id !== selectedMissionToReactivate._id));

      setshowReactivateMissionModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const reactivateMission = async (id: string) => {
    try {
      await API.patch(`/missions/${id}/reactivate`);

      setDisabledMissions((prev: any) => prev.filter((m: any) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07110d] text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Disabled Drones &amp; Missions</h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-2xl font-semibold mb-5">Disabled Drones</h2>

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
                  {d.disableReason && (
                    <div className="mt-2 text-sm text-red-400">Reason: {d.disableReason}</div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedDroneToReactivate(d);
                    setshowReactivateDroneModal(true);
                  }}
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
        <h2 className="text-2xl font-semibold mb-5">Disabled Missions</h2>

        {disabledMissions.length === 0 ? (
          <p className="text-white/50">No disabled missions.</p>
        ) : (
          <div className="space-y-4">
            {disabledMissions.map((m: any) => (
              <div
                key={m._id}
                className="flex items-center justify-between rounded-xl bg-black/30 p-4 border border-white/10"
              >
                <div>
                  <div className="font-bold capitalize">{m.title}</div>

                  <div className="text-sm text-white/50">
                    Type: {m.type} — Status: {m.status}
                  </div>

                  <div className="text-sm text-white/40 mt-1">
                    Drone: {m.drone?.name || "No drone assigned"}
                  </div>
                  {m.disableReason && (
                    <div className="mt-2 text-sm text-red-400">Reason: {m.disableReason}</div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedMissionToReactivate(m);
                    setshowReactivateMissionModal(true);
                  }}
                  className="rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-white transition-all hover:bg-cyan-400 shadow-lg shadow-cyan-500/30"
                >
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REACTIVATE MISSION MODAL */}
      {showReactivateMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[440px] rounded-2xl border border-white/5 bg-[#0f141c]/90 p-7 backdrop-blur-xl shadow-2xl text-white">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] shrink-0" />
                Reactivate Mission
              </h2>
              <p className="text-[12px] text-white/40 mt-1 leading-normal">
                Please confirm if you wish to return this system target configuration back into production queuing frameworks safely.
              </p>
            </div>

            <p className="text-[13px] text-white/70 bg-[#161b26] p-3.5 rounded-xl border border-white/[0.03] mb-6">
              Are you sure you want to reactivate the mission{" "}
              <span className="text-cyan-300 font-semibold">
                "{selectedMissionToReactivate?.title}"
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setshowReactivateMissionModal(false)}
                className="flex-1 rounded-xl bg-[#1e2533] hover:bg-[#252e3f] py-3 text-xs font-semibold text-white/80 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleReactivateMission}
                className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition"
              >
                Confirm Reactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REACTIVATE DRONE MODAL */}
      {showReactivateDroneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[440px] rounded-2xl border border-white/5 bg-[#0f141c]/90 p-7 backdrop-blur-xl shadow-2xl text-white">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] shrink-0" />
                Reactivate Drone
              </h2>
              <p className="text-[12px] text-white/40 mt-1 leading-normal">
                Please verify structural health limits before updating system status back into active grid operation tracking layers.
              </p>
            </div>

            <p className="text-[13px] text-white/70 bg-[#161b26] p-3.5 rounded-xl border border-white/[0.03] mb-6">
              Are you sure you want to reactivate{" "}
              <span className="text-emerald-300 font-semibold">
                {selectedDroneToReactivate?.name}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setshowReactivateDroneModal(false)}
                className="flex-1 rounded-xl bg-[#1e2533] hover:bg-[#252e3f] py-3 text-xs font-semibold text-white/80 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleReactivateDrone}
                className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition"
              >
                Confirm Reactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}