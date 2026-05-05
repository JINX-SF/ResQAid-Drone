import { io, Socket } from "socket.io-client";

// creates ONE connection to your backend
// every component that imports this file shares this same connection
const socket = io("http://localhost:5000", {
  autoConnect: true,   // connects immediately when imported
  reconnection: true,  // reconnects automatically if server restarts
});

socket.on("connect", () => {
  console.log("✅ Connected to backend — socket id:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from backend");
});

export default socket;