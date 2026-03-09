require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");


const app = require("./app");
const connectDB = require("./config/db");

const { runSimulation } = require("./services/simulationService");

const PORT = process.env.PORT || 5000;

/*async function start() {
  try {
    await connectDB();
    app.listen(PORT, ()=> console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:",err);
    process.exit(1);
  }
}
start();*/
async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
    });

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    setInterval(() => {
      runSimulation(io);
    }, 5000);

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();