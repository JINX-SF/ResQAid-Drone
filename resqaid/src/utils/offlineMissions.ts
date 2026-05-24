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

export const syncPendingMissions = async () => {
  const pendingMissions = getPendingMissions();

  if (pendingMissions.length === 0) {
    return {
      synced: 0,
      failed: 0,
    };
  }

  let synced = 0;
  let failed = 0;

  for (const mission of pendingMissions) {
    try {
      updatePendingMissionStatus(
        mission.localId,
        "syncing"
      );

      await API.post("/missions", mission.data);

      removePendingMission(mission.localId);

      synced++;
    } catch (error) {
      updatePendingMissionStatus(
        mission.localId,
        "failed"
      );

      failed++;
    }
  }

  return {
    synced,
    failed,
  };
};