const Mission = require("../models/Mission");
const Drone = require("../models/Drone");
const { chooseBestDrone, prioritizeMissions } = require("../utils/scoring");
const { getWeatherAt } = require("./weatherService");
const { estimateBatteryDrain } = require("../utils/battery");

let simRunning = false;

async function runSimulation(io) {
  if (simRunning) return;
  simRunning = true;

  try {
    console.log("🔁 Simulation running...");

    let pendingMissions = await Mission.find({ status: "pending" });
    const drones = await Drone.find();

    // sort missions based on urgency
    pendingMissions = prioritizeMissions(pendingMissions);

    console.log("Pending missions:", pendingMissions.length);

    for (const mission of pendingMissions) {
      // get real weather at the mission location
      const weather = await getWeatherAt(
        mission.targetArea.lat,
        mission.targetArea.lng
      );console.log(`🌤️ Weather at mission location: wind=${weather.windSpeed}km/h,
         rain=${weather.rainMm}mm, visibility=${weather.visibility}km, 
         condition=${weather.condition}`);

      // if weather is too dangerous, skip this mission for now
      const { isFlyable } = require("../utils/weather");
      if (!isFlyable(weather)) {
        console.log(`⛈️ Weather unsafe for mission ${mission._id}, skipping`);
        continue;
      }

      // find the best drone using the full scoring algorithm
      const bestDrone = chooseBestDrone(drones, mission, weather);

      if (!bestDrone) {
        console.log("❌ No suitable drone for mission:", mission._id);
        continue;
      }

      console.log(`🚁 Assigning drone ${bestDrone._id} to mission ${mission._id}`);

      mission.drone = bestDrone._id;
      mission.status = "active";
      mission.startedAt = new Date();
      await mission.save();

      bestDrone.status = "in_mission";
      await bestDrone.save();

      io.emit("missionUpdated", {
        missionId: mission._id,
        status: mission.status,
        drone: bestDrone._id,
        weather,
      });

      io.emit("droneUpdated", {
        droneId: bestDrone._id,
        status: bestDrone.status,
      });

      setTimeout(async () => {
        mission.status = "completed";
        mission.completedAt = new Date();
        await mission.save();

        bestDrone.status = "idle";

        // use the real battery calculation
        const drain = estimateBatteryDrain(bestDrone, mission, weather);
        bestDrone.battery = Math.max(0, bestDrone.battery - drain);
        await bestDrone.save();

        io.emit("missionUpdated", {
          missionId: mission._id,
          status: mission.status,
          drone: bestDrone._id,
        });

        io.emit("droneUpdated", {
          droneId: bestDrone._id,
          status: bestDrone.status,
          battery: bestDrone.battery,
        });
      }, 10000);
    }
  } catch (err) {
    console.error("Simulation error:", err.message);
  } finally {
    simRunning = false;
  }
}

module.exports = { runSimulation };
//The flow when a mission comes in:

//New mission created (status: pending)
      // ↓
//simulationService wakes up every 5 seconds
      // ↓
//prioritizeMissions() — sort by urgency, Critical goes first
    //   ↓
//getWeatherAt() — check real weather at mission location
    //   ↓
//isFlyable() — is it safe to fly at all?
//    NO → skip, try again next tick
      // ↓ YES
//chooseBestDrone() — runs scoreDrone() on every idle drone
    //canReachRoundTrip() — can it physically get there and back?
    //hasSufficientBattery() — enough charge including 15% reserve?
    //payloadCapacity check — can it carry the weight?
    //type check — right drone for the right mission?
    // then scores: battery + proximity + speed + payload - weather penalty
       // ↓
//best scoring drone wins, gets assigned
      //  ↓
//after 10 seconds → mission completed, battery drained accurately