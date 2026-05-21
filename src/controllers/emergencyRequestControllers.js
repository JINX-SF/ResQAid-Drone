const EmergencyRequest = require("../models/EmergencyRequest");
const Mission = require("../models/Mission");
const Drone = require("../models/Drone");

exports.createRequest = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.create({
      user: req.user?._id || null,
      type: req.body.type,
      description: req.body.description,
      urgency: req.body.urgency,
      phone: req.body.phone,
      location: {
        name: req.body.locationName,
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
      },
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

exports.getEmergencyRequestById = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

exports.getEmergencyRequests = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id)
      .populate("user", "name email phone");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "accepted";
    await request.save();

    const mission = await Mission.create({
      title: `Emergency mission - ${request.type}`,

      type: request.type === "medical" ? "general" : "SAR",

      status: "pending",

      urgency: request.urgency || "Low",

      payloadWeight: 0,

      targetArea: {
        lat: request.location?.lat || 0,
        lng: request.location?.lng || 0,
        radiusKm: 1,
      },

      start: {
        x: 0,
        y: 0,
        z: 0,
      },

      destination: {
        x: request.location?.lat || 0,
        y: request.location?.lng || 0,
        z: 0,
      },

      description: request.description || "",

      request: request._id,
    });

  // FIND BEST AVAILABLE DRONE
const availableDrone = await Drone.findOne({
  status: "idle",
})
.sort({ battery: -1 });

if (availableDrone) {

  // ASSIGN DRONE TO MISSION
  mission.drone = availableDrone._id;

  mission.status = "assigned";

  await mission.save();

  // UPDATE DRONE STATUS
  availableDrone.status = "in_mission";

  await availableDrone.save();
}

    res.json({
      success: true,
      message: "Request accepted and mission created",
      data: {
        request,
        mission,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "rejected";

    await request.save();

    res.json({
      success: true,
      message: "Mission rejected",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    await EmergencyRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Request deleted",
    });
  } catch (err) {
    next(err);
  }
};