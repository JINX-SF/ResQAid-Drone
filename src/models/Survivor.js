const mongoose = require("mongoose");
const SurvivorSchema = new mongoose.Schema({
  fullName : {type : String, trim : true},
  status :{
    type : String,
    enum :["unknown" , "found", "rescued"],
    default :"unknown",
  },
  lastSeenLocation :{
    lat :{type : Number , default :0},
    lng :{type : Number , default :0},
  },
  notes : {type : String,default : ""},
},
{timestamps: true}
);
module.exports = mongoose.model("Survivor",SurvivorSchema);