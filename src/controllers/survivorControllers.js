const Survivor = require("../models/Survivor");
exports.createSurvivor = async (req,res)=> {
  const survivor = await Survivor.create(req.body);
  res.status(201).json({success : true , data : survivor});
};
exports.getSurvivors = async (req,res)=>{
  const survivors = await Survivor.find().sort({createdAt : -1});
  res.json({success : true , data : survivors});
};
exports.getSurvivor = async (req,res)=> {
  const survivor = await Survivor.findById(req.params.id);
  if (!survivor) return res.status(404).json({success : false , message : "Survivor not found"});
  res.json({success : true , data : survivor});
};
exports.updateSurvivor = async (req,res) =>{
  const survivor = await Survivor.findByIdAndUpdate(req.params.id ,req.body, {new : true , runValidators : true});
  if (!survivor) return res.status(404).json({success : false , message : "Survivor not found"});
  res.json({success : true , data :survivor});
};
exports.deleteSurvivor = async (req,res) => {
  const survivor = await Survivor.findByIdAndDelete(req.params.id);
 if (!survivor) return res.status(404).json({success : false , message : "Survivor not found"});
 res.json({success : true ,message :"Survivor deleted"});;
};