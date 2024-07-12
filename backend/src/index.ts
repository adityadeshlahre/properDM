import express from "express";
import bodyParser from "body-parser";
import path from "path";
import * as http from "http";
import * as fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dataPath = path.resolve(__dirname, "data");

const updateMessageFile = (chatId: string, message: any) => {
  const dataPath = path.resolve(__dirname, "data");
  const filePath = path.join(dataPath, `messages_${chatId}.json`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const initialMessages = {
        messages: [message],
      };

      fs.writeFile(filePath, JSON.stringify(initialMessages), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`File created and message added to ${filePath}`);
      });
    } else {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        let messages = JSON.parse(data);
        messages.messages.push(message);

        fs.writeFile(filePath, JSON.stringify(messages), (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`Message added to ${filePath}`);
        });
      });
    }
  });
};

const updateChatReadStatus = (chatId: string, read: boolean) => {
  const filePath = path.join(dataPath, "chats.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let chats = JSON.parse(data);
    const updatedChats = chats.map((chat: any) => {
      if (chat.chat_id === parseInt(chatId)) {
        chat.last_message.read = read.toString(); // Update read status
      }
      return chat;
    });

    fs.writeFile(filePath, JSON.stringify({ chats: updatedChats }), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Chat ${chatId} marked as read: ${read}`);
    });
  });
};

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

app.get("/api/messages/:chat_id", (req: any, res: any) => {
  const { chat_id } = req.params;
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

app.post("/api/sendmessage/:chat_id", (req, res) => {
  const { chat_id } = req.params;
  const { content, created_at } = req.body;

  const newMessage = {
    id: Math.random().toString(36).substring(7),
    content,
    created_at,
  };

  updateMessageFile(chat_id, newMessage);
  res.status(200).json({ message: "Message received and stored." });
});

app.put("/api/markasread/:chat_id", (req, res) => {
  const { chat_id } = req.params;
  const { read } = req.body;
  console.log(`Marking chat ${chat_id} as read: ${read}`);

  updateChatReadStatus(chat_id, read === "true");

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
