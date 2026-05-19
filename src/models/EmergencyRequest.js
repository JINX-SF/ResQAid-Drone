const mongoose = require("mongoose");

const EmergencyRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      required: true,
      enum: ["fire", "flood", "missing_person", "medical", "other"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      name: { type: String, default: "" },
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    status: {
  type: String,
  enum: ["pending", "accepted", "rejected"],
  default: "pending",
},

    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("EmergencyRequest", EmergencyRequestSchema);