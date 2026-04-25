const mongoose = require("mongoose");
module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URL is missing in the .env");
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected") ;
};