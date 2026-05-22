const mongoose = require("mongoose");

const DroneHistorySchema = new mongoose.Schema(
  {
    droneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
      required: true,
    },

    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    editorName: {
      type: String,
      default: "Unknown",
    },

    action: {
      type: String,
      default: "updated",
       },

    changes: [
      {
        field: String,

        oldValue: mongoose.Schema.Types.Mixed,

        newValue: mongoose.Schema.Types.Mixed,
      },
    ],

    previousData: {
      type: mongoose.Schema.Types.Mixed,
    },

    updatedData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("DroneHistory", DroneHistorySchema);