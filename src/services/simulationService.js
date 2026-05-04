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

    let pendingMissions = await Mission.find({ status: "pending" });
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

      // update database
      mission.drone = bestDrone._id;
      mission.status = "active";
      mission.startedAt = new Date();
      await mission.save();

      bestDrone.status = "in_mission";
      await bestDrone.save();

      // tell frontend mission started — MissionInfo updates
      io.emit("missionUpdated", {
        missionId:  mission._id,
        title:      mission.title,
        type:       mission.type,
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

  // what the camera "sees" at different stages of flight
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

  // total battery to drain over the whole mission
  const totalDrain = estimateBatteryDrain(drone, mission, weather);

  const interval = setInterval(async () => {
    step++;
    const progress = step / totalSteps; // 0.0 to 1.0

    // GPS moves smoothly from homeBase to targetArea
    // progress=0 means at home, progress=1 means at target
    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLng = startLng + (endLng - startLng) * progress;

    // altitude: climb at start, cruise in middle, descend at end
    const altitude =
      progress < 0.1  ? progress * 10 * 50          // 0→50m climbing
      : progress > 0.85 ? (1 - progress) / 0.15 * 50 // 50→0m descending
      : 50;                                            // 50m cruising

    // speed: slower when climbing/descending
    const speed =
      progress < 0.1 || progress > 0.85
        ? Math.round(drone.speed * 0.4)
        : drone.speed;

    // drain battery a little each step
    const drainPerStep = totalDrain / totalSteps;
    drone.battery = Math.max(0, drone.battery - drainPerStep);

    const heading = calcHeading(startLat, startLng, endLat, endLng);
    const sceneIdx = Math.min(
      Math.floor(progress * scenes.length),
      scenes.length - 1
    );

    // ── EMIT 1: GPS position → MissionMap marker moves ──
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

    // ── EMIT 2: battery draining → DroneStatus bar animates ──
    io.emit("batteryUpdate", {
      droneId:  drone._id,
      name:     drone.name,
      battery:  Math.round(drone.battery),
      draining: true,
    });

    // ── EMIT 3: camera data → CameraFeed panel updates ──
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

      // tell frontend everything is done
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

      console.log(`✅ Mission ${mission._id} done. Battery: ${Math.round(drone.battery)}%`);
    }
  }, 1000); // fires every 1 second

  activeMissions.set(drone._id.toString(), interval);
}

// calculates compass direction from point A to point B in degrees
function calcHeading(lat1, lng1, lat2, lng2) {
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
             Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

module.exports = { runSimulation };