const EmergencyRequest = require("../models/EmergencyRequest");

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

    res.json({
      success: true,
      message: "Mission accepted",
      data: request,
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