const Mission = require("../models/Mission");
const Drone = require("../models/Drone");
const Survivor = require("../models/Survivor");
const MissionHistory = require("../models/MissionHistory");

const allowedNext = {
  pending: ["assigned", "active"],
  assigned: ["active", "completed"],
  active: ["completed"],
  completed: [],
};

exports.createMission = async (req, res, next) => {
  try {
    console.log("MISSION STATUS RECEIVED:", req.body.status);
    const mission = await Mission.create(req.body);

    // If the user already picked a drone (from Mission Intelligence),
    // use that drone — do NOT auto-override with a different one.
    if (req.body.drone) {
      const pickedDrone = await Drone.findById(req.body.drone);
      if (pickedDrone) {
        mission.drone = pickedDrone._id;
        mission.status = "assigned";
        await mission.save();

        pickedDrone.status = "assigned";
        pickedDrone.assignedMissionName = mission.title;
        pickedDrone.assignedAt = new Date();
        await pickedDrone.save();

        console.log(`🚁 Drone ${pickedDrone.name} assigned to mission (user picked)`);
      }
    } else {
  // Auto assign ONLY if mission is assigned or in_progress
  if (
    mission.status === "assigned" ||
    mission.status === "in_progress" ||
    mission.status === "active"
  ) {
    const bestDrone = await Drone.findOne({
      status: "idle",
      battery: { $gte: 40 },
      isDisabled: { $ne: true },
    }).sort({ battery: -1 });

    if (bestDrone) {
      mission.drone = bestDrone._id;
      await mission.save();

      bestDrone.status =
        mission.status === "in_progress"
          ? "in_mission"
          : "assigned";

      bestDrone.assignedMissionName = mission.title;
      bestDrone.assignedAt = new Date();

      await bestDrone.save();

      console.log(
        `🚁 Drone ${bestDrone.name} auto assigned to mission`
      );
    } else {
      console.log("❌ No available drone found");
    }
  } else {
    console.log(
      "📝 Pending mission created without drone assignment"
    );
  }
}

    const populated = await Mission.findById(mission._id).populate("drone");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

exports.getMissions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { status: { $ne: "disabled" } };
    if (status) filter.status = status;

    const missions = await Mission.find(filter)
      .populate("drone")
      .populate("survivor")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Mission.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: missions,
    });
  } catch (err) {
    next(err);
  }
};

exports.disableMission = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: "Mission not found" });

    // Free the drone if it was assigned or active
    if (mission.drone && (mission.status === "assigned" || mission.status === "active")) {
      await Drone.findByIdAndUpdate(mission.drone, {
        status: "idle",
        assignedMissionName: "",
        assignedAt: null,
      });
    }

    mission.status = "disabled";
    mission.isDisabled = true;
    mission.disableReason = reason;
    await mission.save();

    res.json({ success: true, mission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reactivateMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });

    mission.status = "assigned";
    await mission.save();

    res.json({ success: true, data: mission });
  } catch (err) {
    next(err);
  }
};

exports.getDisabledMissions = async (req, res, next) => {
  try {
    const missions = await Mission.find({ status: "disabled" });
    res.json({ success: true, data: missions });
  } catch (err) {
    next(err);
  }
};

exports.getMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate("drone")
      .populate("survivor");
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });
    res.json({ success: true, data: mission });
  } catch (err) {
    next(err);
  }
};

exports.getMissionIntelligence = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });

    const drones = await Drone.find({ status: { $ne: ["in_mission", "disabled"] } });

    const topDrones = drones
      .map((drone) => {
        let score = 0;
        score += drone.battery * 0.5;
        score += drone.speed * 0.2;
        score += drone.maxRange * 0.1;
        if (drone.status === "idle") score += 30;
        if (drone.status === "assigned") score += 10;
        return {
          drone,
          score: Math.round(score),
          distanceKm: Math.floor(Math.random() * 20) + 1,
          etaMinutes: Math.floor(Math.random() * 10) + 1,
          estimatedDrain: Math.floor(Math.random() * 30) + 10,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    res.json({ success: true, data: { request: mission, topDrones } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignDrone = async (req, res, next) => {
  try {
    const { droneId } = req.body;
    if (!droneId) return res.status(400).json({ success: false, message: "droneId is required" });

    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });

    const drone = await Drone.findById(droneId);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    if (drone.status === "in_mission")
      return res.status(400).json({ success: false, message: "Drone is currently flying and cannot be reassigned" });

    // Free the OLD drone if there was one assigned before
    if (mission.drone && mission.drone.toString() !== drone._id.toString()) {
      await Drone.findByIdAndUpdate(mission.drone, {
        status: "idle",
        assignedMissionName: "",
        assignedAt: null,
      });
    }

    mission.drone = drone._id;

    // If the mission is already active, the new drone should be in_mission immediately
    // Otherwise just mark it as assigned
    const newDroneStatus = mission.status === "active" ? "in_mission" : "assigned";
    drone.status = newDroneStatus;
    drone.assignedMissionName = mission.title;
    drone.assignedAt = new Date();

    await drone.save();
    await mission.save();

    const updated = await Mission.findById(mission._id).populate("drone");
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.updateMission = async (req, res, next) => {
  try {
    req.body.lastEditedBy = req.user?._id;
    req.body.lastEditedAt = new Date();

    const oldMission = await Mission.findById(req.params.id);
    if (!oldMission) {
      return res.status(404).json({ success: false, message: "Mission not found" });
    }

    const oldData = oldMission.toObject();

    const mission = await Mission.findById(req.params.id);
    Object.assign(mission, req.body);

    const needsDrone =
      (mission.status === "assigned" || mission.status === "active") &&
      !mission.drone;

    if (needsDrone) {
      const bestDrone = await Drone.findOne({
        status: "idle",
        battery: { $gte: 40 },
        isDisabled: { $ne: true },
      }).sort({ battery: -1 });

      if (bestDrone) {
        mission.drone = bestDrone._id;

        bestDrone.status = mission.status === "active" ? "in_mission" : "assigned";
        bestDrone.assignedMissionName = mission.title;
        bestDrone.assignedAt = new Date();

        await bestDrone.save();
      }
    }

    if (mission.drone && mission.status === "active") {
      await Drone.findByIdAndUpdate(mission.drone, {
        status: "in_mission",
        assignedMissionName: mission.title,
        assignedAt: new Date(),
      });
    }

    if (mission.drone && mission.status === "assigned") {
      await Drone.findByIdAndUpdate(mission.drone, {
        status: "assigned",
        assignedMissionName: mission.title,
        assignedAt: new Date(),
      });
    }

    if (mission.status === "completed" && mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, {
        status: "idle",
        assignedMissionName: "",
        assignedAt: null,
      });
    }

    await mission.save();

    const changes = [];
    Object.keys(req.body).forEach((key) => {
      const oldValue = oldData[key];
      const newValue = req.body[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    await MissionHistory.create({
      missionId: mission._id,
      editedBy: req.user?._id,
      editorName: req.user?.name || "Unknown User",
      action: "updated",
      changes,
      previousData: oldData,
      updatedData: mission,
    });

    const populated = await Mission.findById(mission._id).populate("drone");

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

exports.assignSurvivor = async (req, res, next) => {
  try {
    const { survivorId } = req.body;
    if (!survivorId) return res.status(400).json({ success: false, message: "survivorId is required" });

    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });

    const survivor = await Survivor.findById(survivorId);
    if (!survivor) return res.status(404).json({ success: false, message: "Survivor not found" });

    mission.survivor = survivor._id;
    await mission.save();
    res.json({ success: true, data: mission });
  } catch (err) {
    next(err);
  }
};

exports.updateMissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "status is required in body" });

    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });

    const can = allowedNext[mission.status]?.includes(status);
    if (!can)
      return res.status(400).json({
        success: false,
        message: `Invalid status change: ${mission.status} -> ${status}`,
      });

    if ((mission.status === "assigned" || mission.status === "pending") && status === "active") {
      mission.startedAt = new Date();
      if (mission.drone)
        await Drone.findByIdAndUpdate(mission.drone, { status: "in_mission" });
    }

    if (mission.status === "active" && status === "completed") {
      mission.completedAt = new Date();
      if (mission.drone)
        await Drone.findByIdAndUpdate(mission.drone, {
          status: "idle",
          assignedMissionName: "",
          assignedAt: null,
        });
    }

    mission.status = status;
    await mission.save();
    res.json({ success: true, data: mission });
  } catch (err) {
    next(err);
  }
};

exports.deleteMission = async (req, res, next) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });
    res.json({ success: true, message: "Mission deleted" });
  } catch (err) {
    next(err);
  }
};

exports.getMissionHistory = async (req, res, next) => {
  try {
    const history = await MissionHistory.find({ missionId: req.params.id })
      .sort({ createdAt: -1 })
      .populate("editedBy", "name email");
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW: activateMission
// Called automatically when entering Control Panel.
// Transitions: assigned -> active
// Also sets the assigned drone status to: in_mission
// ─────────────────────────────────────────────────────────────────────────────
exports.activateMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id).populate("drone");
    if (!mission)
      return res.status(404).json({ success: false, message: "Mission not found" });

    // If already active, still sync the drone to in_mission (fixes stale idle status)
    if (mission.status === "active") {
      if (mission.drone) {
        await Drone.findByIdAndUpdate(mission.drone._id || mission.drone, {
          status: "in_mission",
        });
      }
      const synced = await Mission.findById(mission._id).populate("drone");
      return res.json({ success: true, data: synced, alreadyActive: true });
    }

    if (mission.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot activate a mission with status "${mission.status}"`,
      });
    }

    mission.status = "active";
    mission.startedAt = new Date();
    await mission.save();

    if (mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone._id || mission.drone, {
        status: "in_mission",
      });
    }

    // Return the fully populated mission
    const updated = await Mission.findById(mission._id).populate("drone");
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// completeMission  (Resume Mission button)
// Transitions: active -> completed
// Also sets drone status back to: idle
// ─────────────────────────────────────────────────────────────────────────────
exports.completeMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id).populate("drone");
    if (!mission)
      return res.status(404).json({ success: false, message: "Mission not found" });

    // Allow completing from active OR assigned (safety fallback)
    if (mission.status !== "active" && mission.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a mission with status "${mission.status}"`,
      });
    }

    mission.status = "completed";
    mission.completedAt = new Date();
    await mission.save();

    if (mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone._id || mission.drone, {
        status: "idle",
        assignedMissionName: "",
        assignedAt: null,
      });
    }

    res.json({ success: true, data: mission });
  } catch (err) {
    next(err);
  }
};