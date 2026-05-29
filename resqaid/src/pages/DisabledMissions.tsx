import { useEffect, useState } from "react";
import { 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Radio,
  Search, 
  Package, 
  Gauge, 
  Wrench, 
  Shield 
} from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";
import API from "../api";

// Mapping dictionary for mission classifications
const classificationMap: Record<string, { icon: React.ReactNode; label: string }> = {
  sar: { 
    icon: <Search className="h-5 w-5 text-cyan-400 shrink-0" />, 
    label: "Search & Rescue" 
  },
  logistics: { 
    icon: <Package className="h-5 w-5 text-yellow-400 shrink-0" />, 
    label: "Remote Logistics" 
  },
  oilgas: { 
    icon: <Gauge className="h-5 w-5 text-orange-500 shrink-0" />, 
    label: "Oil & Gas Monitoring" 
  },
  industrial: { 
    icon: <Wrench className="h-5 w-5 text-orange-400 shrink-0" />, 
    label: "Industrial Inspection" 
  },
  security: { 
    icon: <Shield className="h-5 w-5 text-red-400 shrink-0" />, 
    label: "Security Patrol" 
  }
};

export default function DisabledMissionsPage() {
  const [disabledMissions, setDisabledMissions] = useState<any[]>([]);
  const [selectedMissionToReactivate, setSelectedMissionToReactivate] = useState<any>(null);
  const [showReactivateMissionModal, setShowReactivateMissionModal] = useState(false);

  const fetchDisabledMissions = async () => {
    try {
      const res = await API.get("/missions/disabled");
      setDisabledMissions(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch disabled missions:", err);
    }
  };

  useEffect(() => {
    fetchDisabledMissions();
  }, []);

  const handleReactivateMission = async () => {
    try {
      await API.patch(`/missions/${selectedMissionToReactivate._id}/reactivate`);
      setDisabledMissions((prev) => prev.filter((m) => m._id !== selectedMissionToReactivate._id));
      setShowReactivateMissionModal(false);
    } catch (error) {
      console.error("Error reactivating mission:", error);
    }
  };

  return (
    <div>
      <AppShell>
        {/* Main Glass Card Wrapper */}
        <Glass className="overflow-hidden bg-[#18181b]/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl p-2">
          
          {/* Header Panel Layout - Kept large and bold as requested */}
          <div className="bg-black/20 px-8 py-6 border-b border-white/5 rounded-t-lg">
            <div>
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
                Aborted / Disabled Missions Log
              </h2>
              <p className="text-sm text-zinc-400 mt-2 font-medium">Review broken pipelines or restore structural system targets back to dispatch networks.</p>
            </div>
          </div>

          {/* Table Headers - Adjusted slightly to text-xs to fit the grid perfectly */}
          <div className="grid grid-cols-[1.2fr_1.1fr_1fr_1.3fr_0.9fr] items-center gap-6 border-b border-white/5 bg-black/10 px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
            <div>Mission Title</div>
            <div>Classification</div>
            <div>Assigned Drone</div>
            <div>Suspension Reason</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Content Items */}
          {disabledMissions.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-base font-medium">
              No aborted or disabled missions found inside the operational cache.
            </div>
          ) : (
            <ul className="flex flex-col">
              {disabledMissions.map((m) => {
                const normalizedType = m.type?.toLowerCase().replace(/[^a-z]/g, "") || "";
                const classification = classificationMap[normalizedType] || {
                  icon: null,
                  label: m.type || "N/A"
                };

                return (
                  <li
                    key={m._id}
                    className="grid grid-cols-[1.2fr_1.1fr_1fr_1.3fr_0.9fr] items-center gap-6 px-8 py-5 border border-white/[0.03] bg-black/5 rounded-xl mb-4 transition-all duration-200 hover:bg-white/[0.02]"
                  >
                    {/* Mission Title - Adjusted down to text-base for perfect layout clearance */}
                    <div className="font-bold text-base text-zinc-100 capitalize flex items-center gap-2.5">
                      <Activity className="h-5 w-5 text-yellow-400 shrink-0" />
                      <span className="truncate">{m.title}</span>
                    </div>

                    {/* Classification Row - Standardized to text-sm font-semibold */}
                    <div className="flex items-center gap-2 text-sm text-zinc-300 font-semibold">
                      {classification.icon}
                      <span className="truncate">{classification.label}</span>
                    </div>

                    {/* Assigned Drone Container - Standardized to text-sm font-semibold */}
                    <div className="flex items-center gap-2 text-sm text-zinc-300 font-semibold">
                      <Radio className="h-4.5 w-4.5 text-orange-400/80 shrink-0" />
                      <span className="truncate">{m.drone?.name || "No drone assigned"}</span>
                    </div>

                    {/* Suspension Reason Banner Pill */}
                    <div>
                      {m.disableReason ? (
                        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1 text-xs font-bold text-red-400 max-w-full">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                          <span className="truncate">{m.disableReason}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 italic font-semibold">No reason recorded</span>
                      )}
                    </div>

                    {/* Green Reactivate Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedMissionToReactivate(m);
                          setShowReactivateMissionModal(true);
                        }}
                        className="rounded-xl bg-[#059669] hover:bg-[#10b981] px-4 py-2 text-xs font-black text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-900/20"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reactivate
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Glass>
      </AppShell>

      {/* CONFIRMATION MODAL */}
      {showReactivateMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[440px] rounded-xl border border-white/10 bg-[#18181b]/95 p-7 shadow-2xl text-white backdrop-blur-md">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] shrink-0" />
                Reactivate Mission Target
              </h2>
              <p className="text-xs text-zinc-400 mt-1.5 leading-normal">
                Please confirm if you wish to return this system target configuration back into production queuing frameworks safely.
              </p>
            </div>

            <p className="text-sm text-zinc-300 bg-black/30 p-4 rounded-lg border border-white/5 mb-6 font-semibold">
              Are you sure you want to reactivate the mission{" "}
              <span className="text-emerald-400 font-bold">
                "{selectedMissionToReactivate?.title}"
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReactivateMissionModal(false)}
                className="flex-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 py-3 text-xs font-bold text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateMission}
                className="flex-1 rounded-lg bg-[#059669] hover:bg-[#10b981] py-3 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition"
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