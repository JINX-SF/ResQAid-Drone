const axios = require("axios");

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
async function getDrones() {
  const res = await api.get("/drones");
  return res.data.data;
}

async function getMissions() {
  const res = await api.get("/missions");
  return res.data.data;
}

async function getSurvivors() {
  const res = await api.get("/survivors");
  return res.data.data;
}

async function assignDroneToMission(missionId, droneId) {
  const res = await api.patch(`/missions/${missionId}/assign-drone`, {
    droneId,
  });
  return res.data.data;
}

async function activateMission(missionId) {
  const res = await api.patch(`/missions/${missionId}/status`, {
    status: "active",
  });
  return res.data.data;
}

async function completeMission(missionId) {
  const res = await api.patch(`/missions/${missionId}/status`, {
    status: "completed",
  });
  return res.data.data;
}

module.exports = {
  getDrones,
  getMissions,
  getSurvivors,
  assignDroneToMission,
  activateMission,
  completeMission,
};
