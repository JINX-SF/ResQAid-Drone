const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const droneRoutes = require("./routes/droneRoutes");
const missionRoutes = require("./routes/missionRoutes");
const survivorRoutes = require ("./routes/survivorRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req,res)=> {
  res.json({ok :true,message:"Drone platform API is running..."});
});

app.use("/api/drones",droneRoutes);
app.use("/api/missions",missionRoutes);
app.use("/api/survivors",survivorRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
