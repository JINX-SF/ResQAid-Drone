const Mission = require("../models/Mission")
const Drone = require("../models/Drone")

function chooseBestDrone(drones) {
  const available = drones
  .filter((d) => d.status === "idle" && d.battery > 20)
  .sort((a,b) => b.battery - a.battery );
  return available[0] || null;
}
async function runSimulation(io) {
  try {
    console.log("🔁 Simulation running...");
    const pendingMissions = await Mission.find({status:"pending"});
    const drones = await Drone.find();
    console.log("Pending missions:", pendingMissions.length);
    for (const mission of pendingMissions) {
      const bestDrone = chooseBestDrone(drones);
      if (!bestDrone)  {
        console.log("❌ No available drone");
        continue;
      }
 console.log(`🚁 Assigning drone ${bestDrone._id} to mission ${mission._id}`);

      mission.drone = bestDrone._id;
      mission.status = "active";
      mission.startedAt = new Date();
      await mission.save();

      bestDrone.status = "in_mission";
      await bestDrone.save();

      io.emit("missionUpdated",{
        missionId : mission._id,
        status : mission.status,
        drone : bestDrone._id,
      });

      io.emit("droneUpdated",{
        droneId : bestDrone._id,
        status : bestDrone.status,
      });
      setTimeout(async () =>{
        mission.status = "completed";
        mission.completedAt = new Date();
        await mission.save();

        bestDrone.status ="idle";
        bestDrone.battery = Math.max(0,bestDrone.battery - 15);
        await bestDrone.save();

        io.emit("missionUpdated",{
          missionId : mission._id,
          status : mission.status,
          drone : bestDrone._id,
        });
     io.emit("droneUpdated",{

          droneId: bestDrone._id,
          status: bestDrone.status,
          battery: bestDrone.battery,
     });
      },10000);
    }
  }
  catch (err) {
    console.error("Simulation error :",err.message);
  }
  
}
module.exports = { runSimulation };