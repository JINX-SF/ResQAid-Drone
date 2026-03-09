const mongoose = require("mongoose");
const DroneSchema = new mongoose.Schema({
  name : {type : String, required:true, trim : true},
  status : {
    type : String,
    enum:["idle" ,"in_mission","maintenance"],
    default:"idle",
  },
  speed: { type: Number, default: 0 },
maxRange: { type: Number, default: 0 },
payloadCapacity: { type: Number, default: 0 },
  battery : {type : Number,min: 0, max : 100, default: 100},
  location: {
    lat :{ type :Number,default :0},
    lng :{ type :Number,default :0},

  },

},
{timestamps : true}
);
module.exports = mongoose.model("Drone",DroneSchema);