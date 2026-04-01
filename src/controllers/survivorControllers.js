const Survivor = require("../models/Survivor");

exports.createSurvivor = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    if (!fullName)
      return res.status(400).json({ success: false, message: "fullName is required" });
    const survivor = await Survivor.create(req.body);
    res.status(201).json({ success: true, data: survivor });
  } catch (err) { next(err); }
};

exports.getSurvivors = async (req, res, next) => {
  try {
    const survivors = await Survivor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: survivors });
  } catch (err) { next(err); }
};

exports.getSurvivor = async (req, res, next) => {
  try {
    const survivor = await Survivor.findById(req.params.id);
    if (!survivor)
      return res.status(404).json({ success: false, message: "Survivor not found" });
    res.json({ success: true, data: survivor });
  } catch (err) { next(err); }
};

exports.updateSurvivor = async (req, res, next) => {
  try {
    const survivor = await Survivor.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!survivor)
      return res.status(404).json({ success: false, message: "Survivor not found" });
    res.json({ success: true, data: survivor });
  } catch (err) { next(err); }
};

exports.deleteSurvivor = async (req, res, next) => {
  try {
    const survivor = await Survivor.findByIdAndDelete(req.params.id);
    if (!survivor)
      return res.status(404).json({ success: false, message: "Survivor not found" });
    res.json({ success: true, message: "Survivor deleted" });
  } catch (err) { next(err); }
};