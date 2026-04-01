const { haversineKm } = require("./geo");

function estimateBatteryDrain(drone, mission, weather) {
  // base drain from distance — round trip
  const distance = haversineKm(drone.homeBase, mission.targetArea) * 2;
  const baseDrain = (distance / drone.maxRange) * 100;

  // heavier payload = more battery used, up to 30% extra
  const loadRatio = mission.payloadWeight / Math.max(1, drone.payloadCapacity);
  const payloadFactor = 1 + loadRatio * 0.3;

  // strong wind = more battery used, up to 20% extra
  const windFactor = weather ? 1 + (weather.windSpeed / 100) * 0.2 : 1;

  const totalDrain = baseDrain * payloadFactor * windFactor;

  // never return more than 100
  return Math.min(100, Math.round(totalDrain));
}

// Check if drone has enough battery to complete the mission safely
// We keep 15% as a safety reserve  never drain to 0
function hasSufficientBattery(drone, mission, weather) {
  const drain = estimateBatteryDrain(drone, mission, weather);
  const batteryAfterMission = drone.battery - drain;
  return batteryAfterMission >= 15; // 15% safety reserve
}

module.exports = { estimateBatteryDrain, hasSufficientBattery };