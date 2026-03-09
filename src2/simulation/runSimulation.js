const Drone = require("../core/models/drone");
const Mission = require("../core/models/mission");

const {
  getDrones,
  getMissions,
  assignDroneToMission,
  activateMission,
} = require("../services/api");

function chooseBestDrone(drones, mission) {
  const availableDrones = drones.filter(
    (drone) => drone.status === "idle" && drone.battery > 20
  );

  if (availableDrones.length === 0) return null;

  availableDrones.sort((a, b) => b.battery - a.battery);

  return availableDrones[0];
}

async function runSimulation() {
  try {
    const dronesData = await getDrones();
    const missionsData = await getMissions();

    const drones = dronesData.map((d) => new Drone(d));
    const missions = missionsData
      .filter((m) => m.status === "pending")
      .map((m) => new Mission(m));

    for (const mission of missions) {
      const bestDrone = chooseBestDrone(drones, mission);
console.log("Chosen drone:", bestDrone);
      console.log("Mission:", mission);
      if (!bestDrone) {
        console.log(`No available drone for mission ${mission.id}`);
        continue;
      }

      await assignDroneToMission(mission.id, bestDrone.id);
      await activateMission(mission.id);

      console.log(`Drone ${bestDrone.id} assigned to mission ${mission.id}`);
    }
  } catch (err) {
   console.error("Simulation error full:", err);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("URL:", err.config?.url);
    console.error("Method:", err.config?.method);
    console.error("Message:", err.message);
  }
}

runSimulation();