/*const mongoose = require("mongoose");
module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing in the .env");
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected") ;
};*/
const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing in the .env");

  await mongoose.connect(uri, {
    family: 4,
  });

  console.log("✅ MongoDB connected");
};
