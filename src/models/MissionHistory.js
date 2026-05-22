const mongoose = require("mongoose");

const MissionHistorySchema = new mongoose.Schema(
  {
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
    },

    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    previousData: mongoose.Schema.Types.Mixed,

    updatedData: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MissionHistory",
  MissionHistorySchema
);