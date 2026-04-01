const Drone = require("../models/Drone");

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
    const filter = {};
    if (status) filter.status = status;

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
  } catch (err) { next(err); }
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
    const drone = await Drone.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, data: drone });
  } catch (err) { next(err); }
};

exports.deleteDrone = async (req, res, next) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone)
      return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, message: "Drone deleted" });
  } catch (err) { next(err); }
};