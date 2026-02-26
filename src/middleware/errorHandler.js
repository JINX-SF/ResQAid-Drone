module.exports = (err, req,res, next) =>{
  console.error("🔥 Error:", err);
  res.status(500).json({success : false, message : "Server error" , error : err.message});
};