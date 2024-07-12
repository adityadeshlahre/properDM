import express from "express";
import bodyParser from "body-parser";
import path from "path";
import * as http from "http";
import * as fs from "fs";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dataPath = path.resolve(__dirname, "data");

app.get("/", (req: any, res: any) => {
  res.status(200).json("Welcome to properDM! Your backend is up and running.");
});

app.get("/api/chats", (req: any, res: any) => {
  fs.readFile(path.join(dataPath, "chats.json"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.get("/api/messages/", (req: any, res: any) => {
  const { chat_id } = req.body;
  const filePath = path.join(dataPath, `messages_${chat_id}.json`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.put("/api/mark-as-read/", (req, res) => {
  const {} = req.params;
  const { chat_id, read } = req.body;
  console.log(`Marking chat ${chat_id} as read: ${read}`);

  res.status(200).json({ message: `Chat ${chat_id} marked as read: ${read}` });
});

app.post("/api/poll", (req, res) => {
  const { chat_id, last_message_id } = req.body;
  const filePath = path.join(dataPath, `poll_${chat_id}.json`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(JSON.parse(data));
  });
});

wss.on("connection", (ws: WebSocket) => {
  console.log("New WebSocket connection");

  ws.on("message", (message, isBinary) => {
    console.log(`Received message: ${isBinary ? "Binary" : message}`);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message, { binary: isBinary });
      }
    });
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
