require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken"); // Moved to the top for clean resource allocation

const app = require("./app");
const connectDB = require("./config/db");
const { runSimulation } = require("./services/simulationService");
const { verifyEmailConfig } = require("./services/emailService");
const cron = require("node-cron");
const Mission = require("./models/Mission");
const Drone = require("./models/Drone");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await verifyEmailConfig();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: { origin: "*" },
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // FIX: Real-time socket user room assignment pipeline
      socket.on("join-user-room", (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.join(decoded.id); // Joins a room named after the userId
          console.log(`Socket ${socket.id} joined room: ${decoded.id}`);
        } catch (e) {
          console.log("Invalid token for room join alignment verification rejection.");
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

   /* setInterval(() => {
      runSimulation(io);
    }, 10000);*/

    // Runs every minute — promotes assigned missions to active when startTime arrives
    // FIX: Mission status enum is "active" not "in_mission" ("in_mission" is only for Drone)
    cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();
        const due = await Mission.find({
          status: "assigned",
          startTime: { $lte: new Date(now.getTime() + 60 * 1000), $ne: null },
        });

        for (const mission of due) {
          mission.status = "active";   // ← was "in_mission" which is NOT a valid Mission status
          mission.startedAt = now;
          await mission.save();

          if (mission.drone) {
            // Drone model DOES allow "in_mission" — this is correct
            await Drone.findByIdAndUpdate(mission.drone, { status: "in_mission" });
          }

          console.log(`⏱ Mission "${mission.title}" auto-activated at ${now.toISOString()}`);
        }
      } catch (err) {
        console.error("Cron job error:", err.message);
      }
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();