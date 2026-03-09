const mongoose = require("mongoose");
const MissionSchema = new mongoose.Schema({
  title : {type : String,required : true , trim : true},
  status :{
    type : String,
    enum : ["pending","active","completed"],
    default : "pending",
  },
  drone : {type : mongoose.Schema.Types.ObjectId, ref: "Drone" , default : null},
  survivor : {type : mongoose.Schema.Types.ObjectId, ref: "Survivor" , default : null},
  targetArea :{
    lat : {type : Number,default :0},
    lng : {type : Number,default :0},
    radiusKm : {type : Number ,default:1},
  },
  startedAt :{type : Date, default : null},
  completedAt : {type : Date,default : null},

payloadWeight: { type: Number, default: 0 },
urgency: { type: String, default: "Low" },
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

},
{timeseries : true}
);

module.exports = mongoose.model("Mission",MissionSchema);