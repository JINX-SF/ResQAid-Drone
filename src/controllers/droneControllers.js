const Drone = require("../models/Drone");
const DroneHistory = require("../models/DroneHistory");
const activeFlights = new Map();

exports.createDrone = async (req, res, next) => {
  try {
     const body = req.body || {};
    const { name, battery } = body;
    if (!name)
      return res.status(400).json({ success: false, message: "Drone name is required" });
    if (battery != null && (battery < 0 || battery > 100))
      return res.status(400).json({ success: false, message: "Battery must be between 0 and 100" });
    const drone = await Drone.create(req.body);
    res.status(201).json({ success: true, data: drone });
  } catch (err) { next(err); }
};

exports.getDrones = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {
      status: { $ne: "disabled" }, // hide disabled drones
    };

    // if frontend requests a specific status
    if (status) {
      filter.status = status;
    }

    const drones = await Drone.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Drone.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: drones,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDrone = async (req, res, next) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, data: drone });
  } catch (err) { next(err); }
};

exports.updateDrone = async (req, res, next) => {
  try { 
    req.body.lastEditedBy = req.user?._id;
    req.body.lastEditedAt = new Date();

    const oldDrone = await Drone.findById(req.params.id);

    if (!oldDrone) {
      return res.status(404).json({
        success: false,
        message: "Drone not found",
      });
    }

    // SAVE OLD DATA BEFORE UPDATE
    const oldData = oldDrone.toObject();

    // UPDATE DRONE
    const updatedDrone = await Drone.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );// DETECT CHANGES
    const changes = [];

    Object.keys(req.body).forEach((key) => {
      const oldValue = oldData[key];
      const newValue = req.body[key];

      if (
        JSON.stringify(oldValue) !== JSON.stringify(newValue)
      ) {
        changes.push({
          field: key,
          oldValue,
          newValue,
        });
      }
    });
    // SAVE HISTORY
    await DroneHistory.create({
      droneId: updatedDrone._id,

      editedBy: req.user?._id,

      editorName: req.user?.name || "Unknown User",

      action: "updated",

      changes,

      previousData: oldData,

      updatedData: updatedDrone,
    });

    res.json({
      success: true,
      data: updatedDrone, });
  } catch (err) {
    next(err);
  }
};
exports.deleteDrone = async (req, res, next) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, message: "Drone deleted" });
  } catch (err) { next(err); }
};
exports.getDroneHistory = async (req, res, next) => {
  try {
    const history = await DroneHistory.find({
      droneId: req.params.id,
    })
      .sort({ createdAt: -1 })
      .populate("editedBy", "name email");

    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
};
// ─── MANUAL DRONE CONTROL ─────────────────────────────────────────

// helper — calculates compass direction between two GPS points
function calcHeading(lat1, lng1, lat2, lng2) {
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
             Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

// sends drone to specific GPS coordinates
// called by: POST /api/drones/:id/goto
exports.gotoLocation = async (req, res, next) => {
  try {
    const { lat, lng, altitude } = req.body;
    if (!lat || !lng)
      return res.status(400).json({ success: false, message: "lat and lng required" });

    const drone = await Drone.findById(req.params.id);
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });
    if (drone.status === "maintenance")
      return res.status(400).json({ success: false, message: "Drone is in maintenance" });

    const io = req.app.get("io"); // get socket.io from server.js

    const startLat = drone.location.lat || drone.homeBase.lat;
    const startLng = drone.location.lng || drone.homeBase.lng;
    const endLat   = parseFloat(lat);
    const endLng   = parseFloat(lng);
    const alt      = altitude || 50;
    const totalSteps = 15;
    let step = 0;

    // mark drone as busy immediately
    drone.status = "in_mission";
    await drone.save();

    io.emit("droneUpdated", {
      droneId: drone._id,
      name:    drone.name,
      status:  "in_mission",
      battery: drone.battery,
    });

    io.emit("activityEvent", {
      type:  "manual_flight",
      title: `${drone.name} manually launched`,
      desc:  `Flying to ${endLat.toFixed(4)}, ${endLng.toFixed(4)}`,
      time:  new Date().toLocaleTimeString(),
    });

    // move drone step by step — same as simulation tracking
    const interval = setInterval(async () => {
      step++;
      const progress = step / totalSteps;

      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;

      drone.battery = Math.max(0, drone.battery - 0.4);

      io.emit("dronePosition", {
        droneId:   drone._id,
        name:      drone.name,
        lat:       parseFloat(currentLat.toFixed(6)),
        lng:       parseFloat(currentLng.toFixed(6)),
        altitude:  alt,
        speed:     drone.speed,
        heading:   calcHeading(startLat, startLng, endLat, endLng),
        battery:   Math.round(drone.battery),
        progress:  Math.round(progress * 100),
        missionId: null,
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
        scene:     progress < 0.5
          ? "Manual flight — en route to waypoint..."
          : "Approaching destination...",
        lat:       currentLat.toFixed(5),
        lng:       currentLng.toFixed(5),
        altitude:  alt,
        speed:     drone.speed,
        heading:   calcHeading(startLat, startLng, endLat, endLng),
        timestamp: new Date().toLocaleTimeString(),
        recording: true,
      });

      if (step >= totalSteps) {
        clearInterval(interval);
        activeFlights.delete(drone._id.toString());
        drone.status = "idle";
        drone.location.lat = endLat;
        drone.location.lng = endLng;
        drone.location.alt = alt;
        await drone.save();

        io.emit("droneUpdated", {
          droneId: drone._id, name: drone.name,
          status: "idle", battery: Math.round(drone.battery),
        });

        io.emit("cameraFeed", {
          droneId: drone._id, name: drone.name,
          scene: "Destination reached. Hovering.",
          lat: endLat.toFixed(5), lng: endLng.toFixed(5),
          altitude: alt, speed: 0, heading: 0,
          timestamp: new Date().toLocaleTimeString(),
          recording: true,
        });

        io.emit("activityEvent", {
          type: "waypoint_reached",
          title: `${drone.name} reached waypoint`,
          desc: `Position: ${endLat.toFixed(4)}, ${endLng.toFixed(4)}`,
          time: new Date().toLocaleTimeString(),
        });
      }
    }, 1000);
    activeFlights.set(drone._id.toString(), interval);

    res.json({
      success: true,
      message: `${drone.name} flying to ${lat}, ${lng}`,
      estimatedSeconds: totalSteps,
    });
  } catch (err) { next(err); }
};

exports.disableDrone = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Disable reason is required",
      });
    }

    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        message: "Drone not found",
      });
    }

    drone.isDisabled = true;
    drone.disableReason = reason;
    drone.status = "disabled";

    await drone.save();

    res.json({
      success: true,
      drone,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



exports.reactivateDrone = async (req, res) => {
  try {

    const drone = await Drone.findById(
      req.params.id
    );

    if (!drone) {
      return res.status(404).json({
        message: "Drone not found",
      });
    }

    drone.isDisabled = false;
    drone.disableReason = "";
    drone.status = "idle";

    await drone.save();

    res.json({
      success: true,
      drone,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getDisabledDrones = async (req, res, next) => {
  try {
    const drones = await Drone.find({ status: "disabled" });

    res.json({ success: true, data: drones });
  } catch (err) {
    next(err);
  }
};

// returns drone to its home base
// called by: POST /api/drones/:id/return-home
exports.returnHome = async (req, res, next) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });

    const io = req.app.get("io");

    const startLat = drone.location.lat;
    const startLng = drone.location.lng;
    const endLat   = drone.homeBase.lat;
    const endLng   = drone.homeBase.lng;
    const totalSteps = 15;
    let step = 0;

    drone.status = "in_mission";
    await drone.save();

    io.emit("droneUpdated", {
      droneId: drone._id, name: drone.name,
      status: "in_mission", battery: drone.battery,
    });

    io.emit("activityEvent", {
      type: "return_home",
      title: `${drone.name} returning to base`,
      desc: "RTH command received",
      time: new Date().toLocaleTimeString(),
    });

    const interval = setInterval(async () => {
      step++;
      const progress = step / totalSteps;
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;

      drone.battery = Math.max(0, drone.battery - 0.3);

      io.emit("dronePosition", {
        droneId: drone._id, name: drone.name,
        lat: parseFloat(currentLat.toFixed(6)),
        lng: parseFloat(currentLng.toFixed(6)),
        altitude: 50, speed: drone.speed,
        heading: calcHeading(startLat, startLng, endLat, endLng),
        battery: Math.round(drone.battery),
        progress: Math.round(progress * 100), missionId: null,
      });

      io.emit("batteryUpdate", {
        droneId: drone._id, name: drone.name,
        battery: Math.round(drone.battery), draining: true,
      });

      io.emit("cameraFeed", {
        droneId: drone._id, name: drone.name,
        scene: "Returning to home base...",
        lat: currentLat.toFixed(5), lng: currentLng.toFixed(5),
        altitude: 50, speed: drone.speed,
        heading: calcHeading(startLat, startLng, endLat, endLng),
        timestamp: new Date().toLocaleTimeString(), recording: true,
      });

      if (step >= totalSteps) {
        clearInterval(interval);
        activeFlights.delete(drone._id.toString());
        io.emit("missionCompleted", {
  droneId: drone._id,
  droneName: drone.name,
});
        drone.status = "idle";
        drone.location.lat = endLat;
        drone.location.lng = endLng;
        drone.location.alt = 0;
        await drone.save();

        io.emit("droneUpdated", {
          droneId: drone._id, name: drone.name,
          status: "idle", battery: Math.round(drone.battery),
        });

        io.emit("cameraFeed", {
          droneId: drone._id, name: drone.name,
          scene: "Landed at home base. Standing by.",
          lat: endLat.toFixed(5), lng: endLng.toFixed(5),
          altitude: 0, speed: 0, heading: 0,
          timestamp: new Date().toLocaleTimeString(), recording: false,
        });
      }
    }, 1000);
    activeFlights.set(drone._id.toString(), interval);

    res.json({ success: true, message: `${drone.name} returning to base` });
  } catch (err) { next(err); }
};

// emergency stop — immediately halts drone
// called by: POST /api/drones/:id/emergency-stop
exports.emergencyStop = async (req, res, next) => {
  try {
    const flight = activeFlights.get(req.params.id);

if (flight) {
  clearInterval(flight);
  activeFlights.delete(req.params.id);
}
    const drone = await Drone.findByIdAndUpdate(
      req.params.id,
      { status: "maintenance" },
      { new: true }
    );
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });

    const io = req.app.get("io");

    io.emit("droneUpdated", {
      droneId: drone._id, name: drone.name,
      status: "maintenance", battery: drone.battery,
    });

    io.emit("cameraFeed", {
      droneId: drone._id, name: drone.name,
      scene: "⚠️ EMERGENCY STOP EXECUTED",
      lat: drone.location.lat.toFixed(5),
      lng: drone.location.lng.toFixed(5),
      altitude: 0, speed: 0, heading: 0,
      timestamp: new Date().toLocaleTimeString(), recording: false,
    });

    io.emit("activityEvent", {
      type: "emergency",
      title: `⚠️ Emergency stop — ${drone.name}`,
      desc: "Drone set to maintenance mode",
      time: new Date().toLocaleTimeString(),
    });

    res.json({ success: true, message: `Emergency stop on ${drone.name}`, data: drone });
  } catch (err) { next(err); }
};
