const Drone = require("../models/Drone");
exports.createDrone = async (req,res)=>{
  const drone = await Drone.create(req.body);
  res.status(201).json({ success: true, data: drone});
};
exports.getDrones = async (req,res)=>{
  const drones = await Drone.find().sort({createdAt : -1});
  res.json({success : true, data : drones});
};
exports.getDrone = async (req,res) => {
  const drone = await Drone.findById(req.params.id);
  if(!drone) return res.status(404).json({success : false , message : "Drone not found"});
  res.json({success : true,data : drone});
};
exports.updateDrone = async (req,res) => {
  const drone = await Drone.findByIdAndUpdate(req.params.id,req.body,{new : true ,runValidators : true});
  if (!drone)
    return res.status(404).json({
      success: false,
      message: "Drone not found"
    });
  res.json({success : true , data : drone});
};
exports.deleteDrone = async (req,res) => {
  const drone = await Drone.findByIdAndDelete(req.params.id);
  if(!drone) return res.status(404).json({success : false , message : "Drone not found"});
  res.json({success : true, message : "Drone deleted"});
};