import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" }); // Load from root
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import routes from "./routes.js";
import connectionManager from "./connectionManager.js";
const app = express();
const PORT = process.env.PORT || 8085;
app.use(cors());
app.use(bodyParser.json());
app.use("/api", routes);
app.get("/status", (req, res) =>
  res.json({ server: "Unified Multi-Protocol Server", status: "running" }));
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Set WebSocket server reference in connection manager
connectionManager.setWebSocketServer(wss);

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === "relay") {
        console.log(`📡 Relayed data received for ${data.connectionId} via WS`);
        connectionManager.broadcastUpdate(data.connectionId, data.protocol, data.payload);
      }
    } catch (e) { /* ignore malformed */ }
  });

  ws.on("close", () => { });
});
httpServer.listen(PORT, () => {
  console.log(`🚀 Unified Multi-Protocol Server running on port ${PORT}`);
});
