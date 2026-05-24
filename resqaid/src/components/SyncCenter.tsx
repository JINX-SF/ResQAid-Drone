import {
  getPendingMissions,
  syncPendingMissions,
  removePendingMission,
} from "@/utils/offlineMissions";

import { useEffect, useState } from "react";

export default function SyncCenter() {

  const [missions, setMissions] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadMissions = () => {
    const data = getPendingMissions();
    setMissions(data);
  };

  useEffect(() => {
    loadMissions();

    const interval = setInterval(() => {
      loadMissions();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    try {

      setSyncing(true);

      const result =
        await syncPendingMissions();

      alert(
        `🟢 ${result.synced} synced\n🔴 ${result.failed} failed`
      );

      loadMissions();

    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = (
    localId: string
  ) => {

    removePendingMission(localId);

    loadMissions();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#1b3a32]/50 p-6 backdrop-blur-2xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Sync Center
          </h2>

          <p className="text-sm text-white/60">
            Offline mission synchronization
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {syncing
            ? "Syncing..."
            : "Sync Now"}
        </button>
      </div>

      {missions.length === 0 ? (

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">

          ✅ All missions synchronized

        </div>

      ) : (

        <div className="space-y-4">

          {missions.map((mission) => (

            <div
              key={mission.localId}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-lg font-semibold text-white">
                    {mission.data.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/50">
                    {mission.data.type}
                  </p>

                  <p className="mt-2 text-xs text-white/40">
                    {new Date(
                      mission.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

                <div>

                  {mission.status ===
                    "pending_sync" && (

                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                      🟡 Pending Sync
                    </span>

                  )}

                  {mission.status ===
                    "syncing" && (

                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                      🔵 Syncing
                    </span>

                  )}

                  {mission.status ===
                    "sync_failed" && (

                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                      🔴 Sync Failed
                    </span>

                  )}

                </div>
              </div>

              {mission.error && (

                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">

                  {mission.error}

                </div>

              )}

              <div className="mt-4 flex gap-3">

                <button
                  onClick={handleSync}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm text-white"
                >
                  Retry Sync
                </button>

                <button
                  onClick={() =>
                    handleDelete(
                      mission.localId
                    )
                  }
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}