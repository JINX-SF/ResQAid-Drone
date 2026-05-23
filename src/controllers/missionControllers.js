const Mission = require("../models/Mission");
const Drone = require("../models/Drone");
const Survivor = require("../models/Survivor");
const MissionHistory = require("../models/MissionHistory");

const allowedNext = {
  pending: ["active"],
  active: ["completed"],
  completed: [],
};

exports.createMission = async (req, res, next) => {
  try {
    // CREATE MISSION
    const mission = await Mission.create(req.body);

    // FIND BEST AVAILABLE DRONE
    const bestDrone = await Drone.findOne({
      status: "idle", // ONLY AVAILABLE DRONES
      battery: { $gte: 40 }, // MINIMUM BATTERY
    }).sort({
      battery: -1, // HIGHEST BATTERY FIRST
    });

    // IF DRONE FOUND
    if (bestDrone) {
      // ASSIGN DRONE TO MISSION
      mission.drone = bestDrone._id;

      // CHANGE MISSION STATUS
      mission.status = "assigned";

      await mission.save();

      // CHANGE DRONE STATUS
      bestDrone.status = "in_mission";

      await bestDrone.save();

      console.log(
        `🚁 Drone ${bestDrone.name} auto assigned to mission`
      );
    } else {
      console.log("❌ No available drone found");
    }

    res.status(201).json({
      success: true,
      data: mission,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMissions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // hide disabled missions
    const filter = {
      status: { $ne: "disabled" },
    };

    // if frontend requests specific status
    if (status) {
      filter.status = status;
    }

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
      return res.status(400).json({
        message: "Reason is required",
      });
    }

    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        message: "Mission not found",
      });
    }

    mission.status = "disabled";
    mission.isDisabled = true;
    mission.disableReason = reason;

    await mission.save();

    res.json({
      success: true,
      mission,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.reactivateMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: "Mission not found",
      });
    }

    mission.status = "pending";

    await mission.save();

    res.json({
      success: true,
      data: mission,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDisabledMissions = async (req, res, next) => {
  try {
    const missions = await Mission.find({
      status: "disabled",
    });

    res.json({
      success: true,
      data: missions,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate("drone")
      .populate("survivor");
    if (!mission)
      return res.status(404).json({ success: false, message: "Mission not found" });
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
};

exports.assignDrone = async (req, res, next) => {
  try {
    const { droneId } = req.body;
    if (!droneId)
      return res.status(400).json({ success: false, message: "droneId is required" });

    const mission = await Mission.findById(req.params.id);
    if (!mission)
      return res.status(404).json({ success: false, message: "Mission not found" });
    if (mission.drone)
      return res.status(400).json({ success: false, message: "Mission already has a drone assigned" });

    const drone = await Drone.findById(droneId);
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });
    if (drone.status !== "idle")
      return res.status(400).json({ success: false, message: "Drone is not idle" });

    mission.drone = drone._id;
    await mission.save();
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
};

exports.updateMission = async (req, res, next) => {
  try {
    req.body.lastEditedBy = req.user?._id;
    req.body.lastEditedAt = new Date();

    const oldMission = await Mission.findById(req.params.id);

    if (!oldMission) {
      return res.status(404).json({
        success: false,
        message: "Mission not found",
      });
    }

    const oldData = oldMission.toObject();

    const updatedMission =
      await Mission.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    const changes = [];

    Object.keys(req.body).forEach((key) => {
      const oldValue = oldData[key];
      const newValue = req.body[key];

      if (
        JSON.stringify(oldValue) !==
        JSON.stringify(newValue)
      ) {
        changes.push({
          field: key,
          oldValue,
          newValue,
        });
      }
    });

    await MissionHistory.create({
      missionId: updatedMission._id,

      editedBy: req.user?._id,

      editorName:
        req.user?.name || "Unknown User",

      action: "updated",

      changes,

      previousData: oldData,

      updatedData: updatedMission,
    });

    res.json({
      success: true,
      data: updatedMission,
    });
  } catch (err) {
    next(err);
  }
};
exports.assignSurvivor = async (req, res, next) => {
  try {
    const { survivorId } = req.body;
    if (!survivorId)
      return res.status(400).json({ success: false, message: "survivorId is required" });

    const mission = await Mission.findById(req.params.id);
    if (!mission)
      return res.status(404).json({ success: false, message: "Mission not found" });

    const survivor = await Survivor.findById(survivorId);
    if (!survivor)
      return res.status(404).json({ success: false, message: "Survivor not found" });

    mission.survivor = survivor._id;
    await mission.save();
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
};

exports.updateMissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ success: false, message: "status is required in body" });

    const mission = await Mission.findById(req.params.id);
    if (!mission)
      return res.status(404).json({ success: false, message: "Mission not found" });

    const can = allowedNext[mission.status]?.includes(status);
    if (!can)
      return res.status(400).json({
        success: false,
        message: `Invalid status change: ${mission.status} -> ${status}`,
      });

    if (mission.status === "pending" && status === "active") {
      mission.startedAt = new Date();
      if (mission.drone)
        await Drone.findByIdAndUpdate(mission.drone, { status: "in_mission" });
    }

    if (mission.status === "active" && status === "completed") {
      mission.completedAt = new Date();
      if (mission.drone)
        await Drone.findByIdAndUpdate(mission.drone, { status: "idle" });
    }

    mission.status = status;
    await mission.save();
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
};

exports.deleteMission = async (req, res, next) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission)
      return res.status(404).json({ success: false, message: "Mission not found" });
    res.json({ success: true, message: "Mission deleted" });
  } catch (err) { next(err); }
};
exports.getMissionHistory = async (
  req,
  res,
  next
) => {
  try {
    const history = await MissionHistory.find({
      missionId: req.params.id,
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