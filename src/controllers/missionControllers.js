const Mission = require("../models/Mission");
const Drone = require("../models/Drone");
const Survivor = require("../models/Survivor");
const allowedNext = {
  pending : ["active"],
  active : ["completed"],
  completed : [],
};
exports.createMission = async (req,res) => {
  const mission = await Mission.create(req.body);
  res.status(201).json({success : true , data : mission});
};
exports.getMissions = async (req,res) =>{
  const missions = await Mission.find()
  .populate("drone")
  .populate("survivor")
  .sort({createdAt : -1});
  res.json({success : true , data : missions});
};
exports.getMission = async (req,res) => {
  const mission = await Mission.findById(req.params.id).populate("drone").populate("survivor");
  if(!mission) return res.status(404).json({success : false , message :"Mission not found"});
  res.json({success : true , data : mission});
};
exports.assignDrone = async (req,res) => {
  const {droneId} = req.body;

  const mission = await Mission.findById(req.params.id);
  if (!mission) return res.status(404).json({success : false , message :"Mission not found"});

  const drone = await Drone.findById(droneId);
  if (!drone) return res.status(404).json({success : false , message :"Drone not found"});

  if (drone.status !== "idle" ) {
    return res.status(400).json({success : false , message : "Drone not idle"});
  }
  mission.drone = drone._id;
  await mission.save();
  
  res.json({success : true , data : mission })
};
exports.assignSurvivor = async (req,res) => {
  const {survivorId} = req.body;
  const mission = await Mission.findById(req.params.id);
  if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });

  const survivor = await Survivor.findById(survivorId);
  if (!survivor) return res.status(404).json({ success: false, message: "Survivor not found" });

  mission.survivor = survivor._id;
  await mission.save();
  res.json({success : true , data : mission});

};

exports.updateMissionStatus = async (req,res) => {
  const {status} = req.body;
  const mission = await Mission.findById(req.params.id);
  if (!mission) return res.status(404).json({success : false , message :"Mission not found"});

  const can = allowedNext[mission.status]?.includes(status);
  if (!can) {
    return res.status(400).json({
      success : false,
      message : `Invalid status change : ${mission.status} -> ${status}`,
    });
  }
  if (mission.status === "pending" && status ==="active") {
    mission.startedAt = new Date();
    if (mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, {status : "in_mission"});
    }
  }
  if (mission.status === "active" && status ==="completed") {
    mission.completedAt = new Date();
    if (mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, {status : "idle"});
    }
  }
  mission.status = status;
  await mission.save();

  res.json({success : true , data : mission});
};
exports.deleteMission = async (req,res) =>{
  const mission = await Mission.findByIdAndDelete(req.params.id);
  if (!mission) return res.status(404).json({success : false , message :"Mission not found"});
  res.json({success : true , message : "Mission deleted "});
};
