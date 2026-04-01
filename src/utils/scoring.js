const { haversineKm, flightTimeMinutes, canReachRoundTrip } = require("./geo");
const { estimateBatteryDrain, hasSufficientBattery } = require("./battery");
const { getRiskScore } = require("./weather");

const URGENCY_WEIGHT = {
  Critical: 100,
  High:      60,
  Medium:    30,
  Low:       10,
};

function scoreDrone(drone, mission, weather) {
  // first — hard filters, if any of these fail the drone is disqualified completely

  // drone must be free
  if (drone.status !== "idle") return null;

  // drone must have enough battery for the round trip
  if (!hasSufficientBattery(drone, mission, weather)) return null;

  // drone must physically be able to reach the target
  if (!canReachRoundTrip(drone, mission.targetArea)) return null;

  // drone must be able to carry the payload
  if (drone.payloadCapacity < mission.payloadWeight) return null;

  // drone type must match mission type
  // SAR mission needs SAR or hybrid drone
  // delivery mission needs delivery or hybrid drone
  if (mission.type === "delivery" && drone.type === "SAR") return null;
  if (mission.type === "SAR"      && drone.type === "delivery") return null;

  // second — scoring, higher is better

  // battery score: more battery = better (0 to 30 points)
  const batteryScore = (drone.battery / 100) * 30;

  // proximity score: closer drone = better (0 to 30 points)
  const distance = haversineKm(drone.homeBase, mission.targetArea);
  const proximityScore = Math.max(0, 30 - (distance / drone.maxRange) * 30);

  // speed score: faster drone = better for urgent missions (0 to 20 points)
  const flightMins = flightTimeMinutes(distance, drone.speed);
  const speedScore = Math.max(0, 20 - flightMins);

  // payload score: drone that fits the payload best from 0 to 10 points
  // ! huge drone for a tiny package
  const payloadScore = mission.payloadWeight > 0
    ? 10 - Math.abs(drone.payloadCapacity - mission.payloadWeight) / drone.payloadCapacity * 10
    : 10;

  // weather penalty: bad weather reduces the score (0 to 10 points deducted)
  const weatherPenalty = weather ? getRiskScore(weather) : 0;

  const total = batteryScore + proximityScore + speedScore + payloadScore - weatherPenalty;

  return Math.max(0, total);
}

function chooseBestDrone(drones, mission, weather) {
  const scored = drones
    .map(drone => ({
      drone,
      score: scoreDrone(drone, mission, weather),
    }))
    .filter(entry => entry.score !== null) // remove disqualified drones
    .sort((a, b) => b.score - a.score);    // highest score first

  if (scored.length === 0) return null;

  // log the top candidates so you can see in the console why a drone was chosen
  console.log("🏆 Drone candidates for mission", mission._id);
  scored.slice(0, 3).forEach((entry, i) => {
    console.log(`  ${i + 1}. Drone ${entry.drone._id} — score: ${entry.score.toFixed(1)}`);
  });

  return scored[0].drone;
}

// Sort missions by urgency so Critical missions always get served first
function prioritizeMissions(missions) {
  return missions.sort((a, b) => {
    const scoreA = URGENCY_WEIGHT[a.urgency] || 10;
    const scoreB = URGENCY_WEIGHT[b.urgency] || 10;
    return scoreB - scoreA;
  });
}

module.exports = { chooseBestDrone, prioritizeMissions, scoreDrone };