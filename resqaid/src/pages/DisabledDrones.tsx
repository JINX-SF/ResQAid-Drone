import { useEffect, useState } from "react";
import { Shield, Battery, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";
import API from "../api";

export default function DisabledDronesPage() {
  const [drones, setDrones] = useState<any[]>([]);
  const [selectedDroneToReactivate, setSelectedDroneToReactivate] = useState<any>(null);
  const [showReactivateDroneModal, setShowReactivateDroneModal] = useState(false);

  const fetchDisabledDrones = async () => {
    try {
      const res = await API.get("/drones/disabled");
      setDrones(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch disabled drones:", err);
    }
  };

  useEffect(() => {
    fetchDisabledDrones();
  }, []);

  const handleReactivateDrone = async () => {
    try {
      await API.patch(`/drones/${selectedDroneToReactivate._id}/reactivate`);
      setDrones((prev) => prev.filter((d) => d._id !== selectedDroneToReactivate._id));
      setShowReactivateDroneModal(false);
    } catch (error) {
      console.error("Error reactivating drone:", error);
    }
  };

  return (
    <div>
      <AppShell>
        <Glass className="overflow-hidden">
          {/* Header section */}
          <div className="flex items-center justify-between bg-black/40 px-8 py-5 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white/90 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                Disabled Drones Storage
              </h2>
              <p className="text-xs text-white/50 mt-1">Review operational flags or return grounded drones back into rotation grids.</p>
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-[1fr_0.8fr_1.2fr_1.5fr_1.2fr] items-center gap-6 border-b border-white/10 bg-black/30 px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white/80">
            <div>Drone Name</div>
            <div>Battery</div>
            <div>Last Location</div>
            <div>Grounding Reason</div>
            <div className="text-right">Actions</div>
          </div>

          {/* List items */}
          {drones.length === 0 ? (
            <div className="p-12 text-center text-white/40 font-medium text-base">
              No grounded or disabled drones found in this sector profile.
            </div>
          ) : (
            <ul className="divide-y text-white/70 divide-white/5">
              {drones.map((d) => (
                <li
                  key={d._id}
                  className="grid grid-cols-[1fr_0.8fr_1.2fr_1.5fr_1.2fr] items-center gap-6 px-8 py-6 border-b border-white/5 transition-all duration-300 hover:bg-white/[0.02]"
                >
                  {/* Name field */}
                  <div className="font-bold text-base text-white/95 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-400 shrink-0" />
                    <span>{d.name}</span>
                  </div>

                  {/* Battery percentage */}
                  <div className="flex items-center gap-2 font-semibold text-base text-white/90">
                    <Battery className={`h-5 w-5 ${d.battery < 30 ? "text-red-400" : "text-white/60"}`} />
                    {d.battery}%
                  </div>

                  {/* Position coordinates */}
                  <div className="flex items-center gap-2 text-base font-medium text-white/85">
                    <MapPin className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span className="truncate">{d.location ? `${d.location.lat}, ${d.location.lng}` : "No coordinates"}</span>
                  </div>

                  {/* Isolated Red Issue Notification Reason tag box style */}
                  <div>
                    {d.disableReason ? (
                      <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-1.5 text-sm font-semibold text-red-300 max-w-full">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                        <span className="truncate">{d.disableReason}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-white/30 italic">No technical log registered</span>
                    )}
                  </div>

                  {/* Immediate Reactivate Button Row trigger */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedDroneToReactivate(d);
                        setShowReactivateDroneModal(true);
                      }}
                      className="rounded-xl bg-emerald-500/90 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-400 active:scale-95 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <RefreshCw className="h-4 w-4" /> Reactivate
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Glass>
      </AppShell>

      {/* REACTIVATE DRONE MODAL */}
      {showReactivateDroneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[440px] rounded-2xl border border-white/5 bg-[#0f141c]/90 p-7 backdrop-blur-xl shadow-2xl text-white">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] shrink-0" />
                Reactivate Unit
              </h2>
              <p className="text-[12px] text-white/40 mt-1 leading-normal">
                Please verify structural health limits before updating system status back into active grid operation tracking layers.
              </p>
            </div>

            <p className="text-[13px] text-white/70 bg-[#161b26] p-4 rounded-xl border border-white/[0.03] mb-6">
              Are you sure you want to reactivate drone frame{" "}
              <span className="text-emerald-300 font-bold">
                "{selectedDroneToReactivate?.name}"
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReactivateDroneModal(false)}
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