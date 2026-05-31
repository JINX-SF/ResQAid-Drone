const EmergencyRequest = require("../models/EmergencyRequest");
const Mission = require("../models/Mission");
const Drone = require("../models/Drone");
const { haversineKm, flightTimeMinutes } = require("../utils/geo");
const { estimateBatteryDrain }           = require("../utils/battery");
const { getRiskScore, getConditionLabel } = require("../utils/weather");

// ── deterministic RNG seeded from request _id ─────────────────────────────────
function idToSeed(idStr) {
  return idStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}
function makeRng(seed) {
  let s = seed;
  return function rand() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function randInt(rand, min, max)            { return Math.round(min + rand() * (max - min)); }
function randFloat(rand, min, max, dec = 1) { return parseFloat((min + rand() * (max - min)).toFixed(dec)); }

// ── sensor map ────────────────────────────────────────────────────────────────
const SENSOR_MAP = {
  sar:        ["Thermal Camera", "HD Camera", "GPS Tracker"],
  logistics:  ["GPS", "Weight Sensor", "Stabilized Camera"],
  oilgas:     ["Thermal Camera", "Gas Sensor", "Zoom Camera"],
  industrial: ["Zoom Camera", "Thermal Camera", "AI Detection"],
  security:   ["Night Vision", "HD Camera", "AI Detection"],
};

// ── payload compatibility by mission type ─────────────────────────────────────
const PAYLOAD_MAP = {
  logistics:  10,
  sar:         5,
  oilgas:      3,
  industrial:  3,
  security:    2,
};

// ── score a single drone against a request ────────────────────────────────────
function scoreDroneForRequest(drone, request, weatherRisk) {
  if (drone.status === "disabled" || drone.isDisabled) return null;
  if (drone.battery < 30) return null;

  const targetLat = request.location?.lat || 0;
  const targetLng = request.location?.lng || 0;

  const droneLat = drone.homeBase?.lat || drone.location?.lat || 0;
  const droneLng = drone.homeBase?.lng || drone.location?.lng || 0;

  if (!droneLat && !droneLng) return null;

  const distanceKm = haversineKm(
    { lat: droneLat, lng: droneLng },
    { lat: targetLat, lng: targetLng }
  );

  const effectiveRange = (drone.maxRange || 50) * (drone.battery / 100);
  if (distanceKm * 2 > effectiveRange) {
    return {
      score: 5,
      distanceKm: Math.round(distanceKm * 10) / 10,
      etaMinutes: 999,
      estimatedDrain: 100,
    };
  }

  const batteryScore = (drone.battery / 100) * 35;
  const maxRange = drone.maxRange || 50;
  const distanceScore = Math.max(0, 25 - (distanceKm / maxRange) * 25);

  const neededPayload = PAYLOAD_MAP[request.type] || 3;
  const payloadScore = drone.payloadCapacity >= neededPayload
    ? 20
    : (drone.payloadCapacity / neededPayload) * 20;

  let sensorScore = 10;
  if (request.type === "sar"       && drone.type === "SAR")      sensorScore = 20;
  if (request.type === "logistics" && drone.type === "delivery") sensorScore = 20;
  if (drone.type === "hybrid")                                   sensorScore = 15;

  const statusPenalty = drone.status === "idle" ? 0
    : drone.status === "in_mission" ? 15
    : 25;

  const weatherPenalty = weatherRisk * 1.5;
  const total = batteryScore + distanceScore + payloadScore + sensorScore - weatherPenalty - statusPenalty;

  const speedKmh     = drone.speed || 60;
  const etaMinutes   = Math.round(flightTimeMinutes(distanceKm, speedKmh));
  const estimatedDrain = Math.round((distanceKm * 2 / (drone.maxRange || 50)) * 100);

  return {
    score:          Math.max(0, Math.round(total * 10) / 10),
    distanceKm:     Math.round(distanceKm * 10) / 10,
    etaMinutes,
    estimatedDrain: Math.min(100, estimatedDrain),
  };
}

const URGENCY_RISK = { Critical: 35, High: 25, Medium: 15, Low: 5 };

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

exports.createRequest = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.create({
      user:        req.user?._id || null,
      type:        req.body.type,
      description: req.body.description || "",
      urgency:     req.body.urgency || "Medium",
      details:     req.body.details || {},
      phone:       req.body.phone || "",
      location: {
        name: req.body.locationName || "",
        lat:  Number(req.body.lat)  || 0,
        lng:  Number(req.body.lng)  || 0,
      },
      fromLocation: {
        name: req.body.fromLocationName || "",
        lat:  Number(req.body.fromLat)  || 0,
        lng:  Number(req.body.fromLng)  || 0,
      },
      status: "pending",
    });

    // 🚨 EMIT SOCKET EVENT TO ALL ADMINS when urgency is Critical or High
    const io = req.app.get("io");
    if (io && (request.urgency === "Critical" || request.urgency === "High")) {
      io.emit("critical-request", {
        _id:         request._id,
        type:        request.type,
        urgency:     request.urgency,
        description: request.description,
        location:    request.location,
        createdAt:   request.createdAt,
      });
    }

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;
    
    const requests = await EmergencyRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate({
        path: "mission",
        populate: {
          path: "drone",
        },
      });

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

exports.getEmergencyRequests = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id)
      .populate("user", "name email phone");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    request.status = "accepted";

    const mission = await Mission.create({
      title: `Emergency mission - ${request.type}`,
      type: (() => {
        const typeMap = {
          sar: "SAR",
          medical: "logistics",
          logistics: "logistics",
          oilgas: "oilgas",
          industrial: "industrial",
          security: "security",
          general: "general",
        };
        return typeMap[request.type] || "general";
      })(),
      status: "assigned",
      urgency: request.urgency || "Low",
      payloadWeight: 0,
      targetArea: {
        lat: request.location?.lat || 0,
        lng: request.location?.lng || 0,
        radiusKm: 1,
      },
      destination: {
        x: request.location?.lat || 0,
        y: request.location?.lng || 0,
        z: 0,
      },
      description: request.description || "",
      request: request._id,
    });

    request.mission = mission._id;
    await request.save();

    let droneToAssign = null;
    if (req.body.droneId) {
      droneToAssign = await Drone.findById(req.body.droneId);
    }
    if (!droneToAssign) {
      droneToAssign = await Drone.findOne({ status: "idle" }).sort({ battery: -1 });
    }

    if (droneToAssign) {
      mission.drone  = droneToAssign._id;
      await mission.save();

      droneToAssign.status = "assigned";
      droneToAssign.assignedMissionName = mission.title;
      droneToAssign.assignedAt = new Date();
      await droneToAssign.save();
    }

    res.json({
      success: true,
      message: "Request accepted and mission created",
      data: { request, mission },
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    request.status = "rejected";
    await request.save();
    res.json({ success: true, message: "Mission rejected", data: request });
  } catch (err) {
    next(err);
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    await EmergencyRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Request deleted" });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "accepted", "rejected", "in_progress", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }
    const updated = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.getMissionIntelligence = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id).populate("user", "name email");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    const rand = makeRng(idToSeed(request._id.toString()));

    const weather = {
      windSpeed:   randInt(rand, 10, 35),
      visibility:  randInt(rand, 4, 10),
      temperature: randInt(rand, 18, 30),
      rainMm:      randFloat(rand, 0, 3, 1),
      humidity:    randInt(rand, 40, 80),
    };

    const weatherRisk  = getRiskScore(weather);
    const weatherLabel = getConditionLabel(weather);
    const flightSafety = Math.max(0, Math.round(100 - weatherRisk * 12));

    const allDrones = await Drone.find({
      status:     { $nin: ["disabled", "in_mission"] },
      isDisabled: { $ne: true },
    });

    const scored = allDrones
      .map(drone => {
        const result = scoreDroneForRequest(drone, request, weatherRisk);
        if (!result) return null;
        return {
          drone: {
            _id:             drone._id,
            name:            drone.name,
            status:          drone.status,
            battery:         drone.battery,
            speed:           drone.speed,
            maxRange:        drone.maxRange,
            payloadCapacity: drone.payloadCapacity,
            type:            drone.type,
            location:        drone.location,
            homeBase:        drone.homeBase,
          },
          score:          result.score,
          distanceKm:     result.distanceKm,
          etaMinutes:     result.etaMinutes,
          estimatedDrain: result.estimatedDrain,
          rank:           0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    const urgencyRisk  = URGENCY_RISK[request.urgency] || 15;
    const distanceRisk = scored[0] ? Math.min(20, scored[0].distanceKm / 2) : 10;
    const batteryRisk  = scored[0] ? Math.max(0, 15 - (scored[0].drone.battery / 100) * 15) : 10;
    const missionRisk  = Math.min(95, Math.round(urgencyRisk + distanceRisk + batteryRisk + weatherRisk * 2));

    const areaSize = request.details?.areaSize || randFloat(rand, 1.5, 3.5, 1);
    const altitude = request.type === "security" ? 80 : 120;
    const scanTime = Math.round(Number(areaSize) * 7 + 5);

    const obstacles = [];
    if (weather.windSpeed > 25)
      obstacles.push({ type: "weather",  label: "High wind zone detected",    icon: "⚠" });
    if (weather.visibility < 5)
      obstacles.push({ type: "visibility", label: "Low visibility conditions",   icon: "🌫" });
    if (request.urgency === "Critical")
      obstacles.push({ type: "terrain",    label: "Priority airspace zone active", icon: "🚨" });
    obstacles.push({ type: "info", label: "Standard flight corridor available", icon: "✅" });

    const sensors = SENSOR_MAP[request.type] || ["HD Camera", "GPS Tracker"];

    res.json({
      success: true,
      data: {
        request: {
          _id:          request._id,
          type:         request.type,
          urgency:      request.urgency,
          status:       request.status,
          location:     request.location,
          fromLocation: request.fromLocation,
          description:  request.description,
          details:      request.details,
          user:         request.user,
          createdAt:    request.createdAt,
        },
        weather: {
          ...weather,
          label:       weatherLabel,
          flightSafety,
          riskScore:   weatherRisk,
        },
        topDrones:  scored,
        missionRisk,
        targetArea: { areaSize: Number(areaSize), altitude, scanTime },
        obstacles,
        sensors,
      },
    });
  } catch (err) {
    next(err);
  }
};