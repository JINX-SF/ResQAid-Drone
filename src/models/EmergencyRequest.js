const mongoose = require("mongoose");

const EmergencyRequestSchema = new mongoose.Schema(
  {
    // ───────────────── USER ─────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ───────────────── SERVICE TYPE ─────────────────
    type: {
      type: String,
      required: true,
      enum: [
        "sar",
        "logistics",
        "oilgas",
        "industrial",
        "security",
      ],
    },

    // ───────────────── DESCRIPTION ─────────────────
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ───────────────── URGENCY ─────────────────
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    // ───────────────── DYNAMIC DETAILS ─────────────────
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ───────────────── PHONE ─────────────────
    phone: {
      type: String,
      default: "",
    },

    // ───────────────── MAIN LOCATION ─────────────────
    location: {
      name: {
        type: String,
        default: "",
      },

      lat: {
        type: Number,
        default: 0,
      },

      lng: {
        type: Number,
        default: 0,
      },
    },

    // ───────────────── LOGISTICS PICKUP LOCATION ─────────────────
    fromLocation: {
      name: {
        type: String,
        default: "",
      },

      lat: {
        type: Number,
        default: 0,
      },

      lng: {
        type: Number,
        default: 0,
      },
    },

    // ───────────────── STATUS ─────────────────
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    // ───────────────── ADMIN NOTE ─────────────────
    adminNote: {
      type: String,
      default: "",
    },
    mission: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Mission",
  default: null,
},
  },

  {
    timestamps: true,
  }

);

module.exports = mongoose.model(
  "EmergencyRequest",
  EmergencyRequestSchema
);
