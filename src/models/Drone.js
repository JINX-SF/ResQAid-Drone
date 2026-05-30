const mongoose = require("mongoose");

const DroneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["idle", "assigned", "in_mission", "disabled"],
      default: "idle",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    disableReason: {
      type: String,
      default: "",
    },
    speed:           { type: Number, default: 0 },
    maxRange:        { type: Number, default: 0 },
    payloadCapacity: { type: Number, default: 0 },
    battery:         { type: Number, min: 0, max: 100, default: 100 },

    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      alt: { type: Number, default: 0 },
    },

    homeBase: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      alt: { type: Number, default: 0 },
    },

    type: {
      type: String,
      enum: ["camera_quadcopter", "thermal_drone", "fixed_wing", "vtol_hybrid", "sensor_drone"],
      default: "camera_quadcopter",
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastEditedAt: {
      type: Date,
    },
    assignedMissionName: {
      type: String,
      default: "",
    },
    assignedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// checks payload then marks drone as busy
DroneSchema.methods.assignMission = function (mission) {
  if (mission.payloadWeight > this.payloadCapacity) {
    throw new Error(
      `Payload ${mission.payloadWeight}kg exceeds drone capacity ${this.payloadCapacity}kg`
    );
  }
  this.currentMission = mission;
  this.status = "in_mission";
};

// updates GPS position during flight
DroneSchema.methods.updatePosition = function (newPosition) {
  this.location.lat = newPosition.lat;
  this.location.lng = newPosition.lng;
  if (newPosition.alt !== undefined) this.location.alt = newPosition.alt;
};

// drains battery and automatically sends drone to maintenance if too low
DroneSchema.methods.consumeBattery = function (amount) {
  this.battery = Math.max(0, this.battery - amount);
  if (this.battery <= 15) {
    this.status = "disabled";
  }
};

// resets drone after mission is done
DroneSchema.methods.completeMission = function () {
  this.status = "idle";
  this.assignedMissionName = "";
  this.assignedAt = null;
};

module.exports = mongoose.model("Drone", DroneSchema);