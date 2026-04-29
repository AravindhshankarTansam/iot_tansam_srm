import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { WebSocketServer } from "ws";

import routes from "./routes.js";
import connectionManager from "./connectionManager.js";

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use("/api", routes);

// Health check
app.get("/status", (req, res) => {
  res.json({
    server: "Unified Multi-Protocol Server",
    status: "running",
    time: new Date().toISOString()
  });
});

// Create HTTP server
const httpServer = createServer(app);

// ✅ WebSocket server with PATH FIX
const wss = new WebSocketServer({
  server: httpServer,
  path: "/ws"   // 🔥 IMPORTANT (matches Nginx + frontend)
});

// Attach WS to connection manager
connectionManager.setWebSocketServer(wss);

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  console.log("🔌 New WebSocket connection:", req.socket.remoteAddress);

  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "relay") {
        console.log(`📡 Relay for ${data.connectionId}`);
        connectionManager.broadcastUpdate(
          data.connectionId,
          data.protocol,
          data.payload
        );
      }
    } catch (err) {
      console.error("❌ Invalid WS message:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("❌ WebSocket disconnected");
  });

  ws.on("error", (err) => {
    console.error("⚠️ WebSocket error:", err.message);
  });
});

// 💓 Heartbeat (prevents ghost connections)
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log("💀 Terminating dead connection");
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Cleanup on shutdown
wss.on("close", () => {
  clearInterval(interval);
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WS: ws://localhost:${PORT}/ws`);
});