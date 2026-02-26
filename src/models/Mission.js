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
},
{timeseries : true}
);
module.exports = mongoose.model("Mission",MissionSchema);