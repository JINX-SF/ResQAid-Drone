const mongoose = require("mongoose");

const MissionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["SAR", "delivery", "general"],
      default: "general",
    },

    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },

    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    drone:    { type: mongoose.Schema.Types.ObjectId, ref: "Drone",    default: null },
    survivor: { type: mongoose.Schema.Types.ObjectId, ref: "Survivor", default: null },

    targetArea: {
      lat:      { type: Number, default: 0 },
      lng:      { type: Number, default: 0 },
      radiusKm: { type: Number, default: 1 },
    },

   
    start: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    destination: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },

    payloadWeight: { type: Number, default: 0 },

    // from src2 — useful for frontend display and tracking
    description: { type: String, default: "" },
    details:     { type: String, default: "" },
    cameras:     { type: [String], default: [] },

    // track what was requested and what the response was
    request:  { type: mongoose.Schema.Types.Mixed, default: null },
    response: { type: mongoose.Schema.Types.Mixed, default: null },

    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);


MissionSchema.methods.describe = function () {
  return `${this.type} mission — urgency: ${this.urgency}, status: ${this.status}`;
};

MissionSchema.methods.startMission = function () {
  this.status = "active";
  this.startedAt = new Date();
};

MissionSchema.methods.completeMission = function () {
  this.status = "completed";
  this.completedAt = new Date();
};

module.exports = mongoose.model("Mission", MissionSchema);