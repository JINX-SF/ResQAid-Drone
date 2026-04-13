const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const session = require("express-session");
const passport = require("./config/passport");

const droneRoutes = require("./routes/droneRoutes");
const missionRoutes = require("./routes/missionRoutes");
const survivorRoutes = require ("./routes/survivorRoutes");
const authRoutes = require("./routes/authRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req,res)=> {
  res.json({ok :true,message:"Drone platform API is running..."});
});

app.use("/api/drones",droneRoutes);
app.use("/api/missions",missionRoutes);
app.use("/api/survivors",survivorRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
