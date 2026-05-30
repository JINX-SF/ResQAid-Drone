const Mission = require("../models/Mission");
const Drone = require("../models/Drone");
const { chooseBestDrone, prioritizeMissions } = require("../utils/scoring");
const { getWeatherAt } = require("./weatherService");
const { estimateBatteryDrain } = require("../utils/battery");
const { isFlyable } = require("../utils/weather");

let simRunning = false;

// stores active intervals so we never start two for same drone
const activeMissions = new Map();

async function runSimulation(io) {
  if (simRunning) return; // lock — prevents two ticks overlapping
  simRunning = true;

  try {
    console.log("🔁 Simulation running...");

    // This query is perfect! It finds missions matching your strict status enum
    let pendingMissions = await Mission.find({ status: "assigned" });
    const drones = await Drone.find();

    // Critical missions go first
    pendingMissions = prioritizeMissions(pendingMissions);
    console.log("Pending missions:", pendingMissions.length);

    for (const mission of pendingMissions) {
      // fetch real weather at mission GPS location
      const weather = await getWeatherAt(
        mission.targetArea.lat,
        mission.targetArea.lng
      );

      console.log(`🌤️ Weather: wind=${weather.windSpeed}km/h rain=${weather.rainMm}mm vis=${weather.visibility}km`);

      // tell frontend about weather so widget updates
      io.emit("weatherUpdate", {
        missionId: mission._id,
        windSpeed:   weather.windSpeed,
        rainMm:      weather.rainMm,
        visibility:  weather.visibility,
        temperature: weather.temperature,
        condition:   weather.condition || "Clear",
        isFlyable:   isFlyable(weather),
      });

      // if weather is dangerous, block the mission
      if (!isFlyable(weather)) {
        console.log(`⛈️ Weather unsafe for mission ${mission._id}`);
        io.emit("missionBlocked", {
          missionId: mission._id,
          reason: "Weather too dangerous to fly",
        });
        continue; // skip to next mission
      }

      // scoring algorithm picks the best drone
      const bestDrone = chooseBestDrone(drones, mission, weather);
      if (!bestDrone) {
        console.log("❌ No suitable drone for mission:", mission._id);
        io.emit("missionBlocked", {
          missionId: mission._id,
          reason: "No available drone",
        });
        continue;
      }

      console.log(`🚁 Assigning ${bestDrone.name} to mission ${mission._id}`);

      // update database — values match strict schema rules perfectly
      mission.drone = bestDrone._id;
      mission.status = "active";
      mission.startedAt = new Date();
      await mission.save();

      bestDrone.status = "in_mission";
      await bestDrone.save();

      // 🌟 FIX: Also send an update to the user's private socket room if a user is attached
      if (mission.user) {
        io.to(mission.user.toString()).emit("request-updated", {
          requestId: mission._id,
          status: "active",
          mission: {
            drone: { name: bestDrone.name }
          }
        });
      }

      // tell frontend mission started — MissionInfo updates
      io.emit("missionUpdated", {
        missionId:  mission._id,
        title:      mission.title,
        type:       mission.type, // This will naturally be "SAR" from your database documents
        urgency:    mission.urgency,
        status:     "active",
        droneId:    bestDrone._id,
        droneName:  bestDrone.name,
        startedAt:  mission.startedAt,
        targetArea: mission.targetArea,
      });

      // tell frontend drone is busy — DroneStatus updates
      io.emit("droneUpdated", {
        droneId: bestDrone._id,
        name:    bestDrone.name,
        status:  "in_mission",
        battery: bestDrone.battery,
      });

      // add to activity feed
      io.emit("activityEvent", {
        type:  "mission_started",
        title: `Drone ${bestDrone.name} launched`,
        desc:  `Heading to: ${mission.title}`,
        time:  new Date().toLocaleTimeString(),
      });

      // start live tracking — moves marker every 1 second
      startTracking(io, bestDrone, mission, weather);
    }
  } catch (err) {
    console.error("Simulation error:", err.message);
  } finally {
    simRunning = false; // always unlock
  }
}

function startTracking(io, drone, mission, weather) {
  // don't start two trackers for same drone
  if (activeMissions.has(drone._id.toString())) return;

  const startLat = drone.homeBase.lat;
  const startLng = drone.homeBase.lng;
  const endLat   = mission.targetArea.lat;
  const endLng   = mission.targetArea.lng;

  const totalSteps = 20; // 20 seconds of live flight
  let step = 0;

  const scenes = [
    "Initiating takeoff sequence...",
    "Climbing to cruise altitude...",
    "En route to target area...",
    "Scanning ground below...",
    "Target zone approaching...",
    "Hovering over location...",
    "Area inspection in progress...",
    "Payload delivery in progress...",
    "Scanning for survivors...",
    "Mission objective reached...",
    "Preparing return flight...",
    "Returning to base...",
  ];

  const totalDrain = estimateBatteryDrain(drone, mission, weather);

  const interval = setInterval(async () => {
    step++;
    const progress = step / totalSteps;

    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLng = startLng + (endLng - startLng) * progress;

    const altitude =
      progress < 0.1  ? progress * 10 * 50
      : progress > 0.85 ? (1 - progress) / 0.15 * 50
      : 50;

    const speed =
      progress < 0.1 || progress > 0.85
        ? Math.round(drone.speed * 0.4)
        : drone.speed;

    const drainPerStep = totalDrain / totalSteps;
    drone.battery = Math.max(0, drone.battery - drainPerStep);

    const heading = calcHeading(startLat, startLng, endLat, endLng);
    const sceneIdx = Math.min(
      Math.floor(progress * scenes.length),
      scenes.length - 1
    );

    io.emit("dronePosition", {
      droneId:   drone._id,
      name:      drone.name,
      lat:       parseFloat(currentLat.toFixed(6)),
      lng:       parseFloat(currentLng.toFixed(6)),
      altitude:  Math.round(altitude),
      speed,
      heading,
      battery:   Math.round(drone.battery),
      progress:  Math.round(progress * 100),
      missionId: mission._id,
    });

    io.emit("batteryUpdate", {
      droneId:  drone._id,
      name:     drone.name,
      battery:  Math.round(drone.battery),
      draining: true,
    });

    io.emit("cameraFeed", {
      droneId:   drone._id,
      name:      drone.name,
      scene:     scenes[sceneIdx],
      lat:       currentLat.toFixed(5),
      lng:       currentLng.toFixed(5),
      altitude:  Math.round(altitude),
      speed,
      heading,
      timestamp: new Date().toLocaleTimeString(),
      recording: true,
    });

    // ── MISSION COMPLETE ──
    if (step >= totalSteps) {
      clearInterval(interval);
      activeMissions.delete(drone._id.toString());

      mission.status = "completed";
      mission.completedAt = new Date();
      await mission.save();

      drone.status = "idle";
      await drone.save();

      // 🌟 FIX: Update private room when tracking completes
      if (mission.user) {
        io.to(mission.user.toString()).emit("request-updated", {
          requestId: mission._id,
          status: "completed"
        });
      }

      io.emit("missionUpdated", {
        missionId:   mission._id,
        title:       mission.title,
        status:      "completed",
        droneId:     drone._id,
        droneName:   drone.name,
        completedAt: mission.completedAt,
      });

      io.emit("droneUpdated", {
        droneId: drone._id,
        name:    drone.name,
        status:  "idle",
        battery: Math.round(drone.battery),
      });

      io.emit("batteryUpdate", {
        droneId:  drone._id,
        name:     drone.name,
        battery:  Math.round(drone.battery),
        draining: false,
      });

      io.emit("cameraFeed", {
        droneId:   drone._id,
        name:      drone.name,
        scene:     "Mission completed. Drone returned to base.",
        lat:       startLat.toFixed(5),
        lng:       startLng.toFixed(5),
        altitude:  0,
        speed:     0,
        heading:   0,
        timestamp: new Date().toLocaleTimeString(),
        recording: false,
      });

      io.emit("activityEvent", {
        type:  "mission_completed",
        title: `Mission completed`,
        desc:  `${drone.name} returned to base. Battery: ${Math.round(drone.battery)}%`,
        time:  new Date().toLocaleTimeString(),
      });
// ... code above
      console.log(`✅ Mission ${mission._id} done. Battery: ${Math.round(drone.battery)}%`);
    }
  }, 1000); // 

  activeMissions.set(drone._id.toString(), interval);
}

function calcHeading(lat1, lng1, lat2, lng2) {
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
             Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

module.exports = { runSimulation };