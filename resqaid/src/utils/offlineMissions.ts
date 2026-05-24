const PENDING_MISSIONS_KEY = "pending_missions_queue";

export type PendingMission = {
  localId: string;
  data: any;
  createdAt: string;

  status:
    | "pending_sync"
    | "syncing"
    | "sync_failed"
    | "synced";

  error?: string;
};

export const getPendingMissions = (): PendingMission[] => {
  const stored = localStorage.getItem(PENDING_MISSIONS_KEY);

  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const savePendingMission = (missionData: any) => {
  const pendingMissions = getPendingMissions();

  const newPendingMission: PendingMission = {
    localId: crypto.randomUUID(),
    data: missionData,
    createdAt: new Date().toISOString(),
    status: "pending_sync",
  };

  localStorage.setItem(
    PENDING_MISSIONS_KEY,
    JSON.stringify([newPendingMission, ...pendingMissions])
  );

  return newPendingMission;
};

export const removePendingMission = (localId: string) => {
  const pendingMissions = getPendingMissions();

  const updated = pendingMissions.filter(
    (mission) => mission.localId !== localId
  );

  localStorage.setItem(
    PENDING_MISSIONS_KEY,
    JSON.stringify(updated)
  );
};

export const updatePendingMissionStatus = (
  localId: string,
  status: PendingMission["status"]
) => {
  const pendingMissions = getPendingMissions();

  const updated = pendingMissions.map((mission) =>
    mission.localId === localId
      ? { ...mission, status }
      : mission
  );

  localStorage.setItem(
    PENDING_MISSIONS_KEY,
    JSON.stringify(updated)
  );
};

import API from "@/api";

// ... Keep your types, getPendingMissions, and savePendingMissions exactly as they are ...

export const syncPendingMissions = async () => {
  // 1. Get a fresh snapshot of the queue
  const pendingMissions = getPendingMissions();

  if (pendingMissions.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let syncedCount = 0;
  let failedCount = 0;

  // We will build a brand new array to replace localStorage cleanly at the end
  const updatedMissionsQueue = [...pendingMissions];

  for (let i = 0; i < updatedMissionsQueue.length; i++) {
    const mission = updatedMissionsQueue[i];

    // Skip items already processed or currently syncing in another thread
    if (mission.status === "synced" || mission.status === "syncing") continue;

    try {
      // Mark as syncing in memory
      mission.status = "syncing";

      // Send payload to backend
      await API.post("/missions", mission.data);

      // Success! Mark it as synced so we can filter it out later
      mission.status = "synced";
      syncedCount++;
    } catch (error: any) {
      failedCount++;
      
      console.error("CRITICAL SYNC DEBUG LOG:", {
        message: error?.message,
        code: error?.code,
        hasResponse: !!error?.response,
        status: error?.response?.status
      });

      // 2. STABLIZED NETWORK CHECK
      // If the backend is turned off entirely, error.response will NEVER exist.
      // We also check for typical browser offline behaviors.
      const isServerOffline = 
        !error.response || 
        error.code === "ERR_NETWORK" || 
        error.message?.toLowerCase().includes("network error") ||
        error.message?.toLowerCase().includes("timeout");

      if (isServerOffline) {
        // Server is dead: Rollback status gracefully to wait for the next attempt
        mission.status = "pending_sync";
        mission.error = "Server unreachable. Retrying automatically when online...";
      } else {
        // Server is running, but rejected data intentionally (400 Bad Request, 500 Crash, etc)
        mission.status = "sync_failed";
        mission.error = error?.response?.data?.message || "Invalid mission schema or server validation error.";
      }
    }
  }

  // 3. Clean up and write to localStorage exactly ONCE
  // Remove items successfully synced, keep items that are failing or pending retry
  const finalQueue = updatedMissionsQueue.filter(m => m.status !== "synced");
  
  localStorage.setItem(PENDING_MISSIONS_KEY, JSON.stringify(finalQueue));

  return {
    synced: syncedCount,
    failed: failedCount,
  };
};