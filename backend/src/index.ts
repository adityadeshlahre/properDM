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

const updateLastMessages = (chatId: string) => {
  const messagesFilePath = path.join(dataPath, `messages_${chatId}.json`);
  const chatsFilePath = path.join(dataPath, "chats.json");

  fs.readFile(messagesFilePath, "utf8", (err, messagesData) => {
    if (err) {
      console.error(`Failed to read messages for chat ${chatId}:`, err);
      return;
    }

    let messages;
    try {
      messages = JSON.parse(messagesData);
    } catch (err) {
      console.error(`Failed to parse messages for chat ${chatId}:`, err);
      return;
    }

    if (!messages || !messages.messages || messages.messages.length === 0) {
      console.warn(`No messages found for chat ${chatId}`);
      return;
    }

    const lastMessage = messages.messages[messages.messages.length - 1];

    fs.readFile(chatsFilePath, "utf8", (err, chatsData) => {
      if (err) {
        console.error(`Failed to read chats file:`, err);
        return;
      }

      let chats;
      try {
        chats = JSON.parse(chatsData);
      } catch (err) {
        console.error(`Failed to parse chats data:`, err);
        return;
      }

      const updatedChats = chats.chats.map((chat: any) => {
        if (chat.chat_id === parseInt(chatId)) {
          chat.last_message = {
            id: lastMessage.id,
            content: lastMessage.content,
            created_at: lastMessage.created_at,
            status: "DELIVERED",
            read: "true",
          };
        }
        return chat;
      });

      fs.writeFile(
        chatsFilePath,
        JSON.stringify({ chats: updatedChats }, null, 2),
        (err) => {
          if (err) {
            console.error(`Failed to update chats file:`, err);
            return;
          }
          console.log(`Chat ${chatId} last message updated.`);
        }
      );
    });
  });
};

const addChatIdToChats = (chatId: string) => {
  const chatsFilePath = path.join(dataPath, "chats.json");
  const messagesFilePath = path.join(dataPath, `messages_${chatId}.json`);

  const getRandomString = (length: number) =>
    Math.random()
      .toString(36)
      .substring(2, 2 + length);
  const getRandomNumber = (length: number) =>
    Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, "0");

  const newChat = {
    chat_id: chatId,
    sender_details: {
      user_id: getRandomNumber(3),
      profile_data: {
        first_name: getRandomString(6),
        last_name: getRandomString(6),
        profile_picture: "",
        headline: "",
        followers: getRandomNumber(6),
      },
    },
    last_message: {
      id: "",
      content: "",
      created_at: "",
      status: "DELIVERED",
      read: "true",
    },
  };

  fs.readFile(chatsFilePath, "utf8", (err, data) => {
    let chats: { chats: any[] } = { chats: [] };

    if (!err) {
      try {
        chats = JSON.parse(data);
      } catch (err) {
        console.error("Failed to parse chats data:", err);
        return;
      }
    } else {
      // Create chats.json if it doesn't exist
      fs.writeFile(chatsFilePath, JSON.stringify(chats, null, 2), (err) => {
        if (err) {
          console.error("Failed to create chats file:", err);
          return;
        }
        console.log("Created chats.json");
      });
    }
    chats.chats.push(newChat);

    fs.writeFile(chatsFilePath, JSON.stringify(chats, null, 2), (err) => {
      if (err) {
        console.error("Failed to update chats file:", err);
        return;
      }
      console.log(`Chat ${chatId} added successfully.`);
      fs.access(messagesFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          fs.writeFile(
            messagesFilePath,
            JSON.stringify({ messages: [] }),
            (err) => {
              if (err) {
                console.error(
                  `Failed to create messages file for chat ${chatId}:`,
                  err
                );
                return;
              }
              console.log(`Created messages file for chat ${chatId}`);
              updateLastMessages(chatId);
            }
          );
        } else {
          updateLastMessages(chatId);
        }
      });
    });
  });
};

const updateMessageFile = (chatId: string, message: any) => {
  const filePath = path.join(dataPath, `messages_${chatId}.json`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const initialMessages = {
        messages: [message],
      };

      fs.writeFile(filePath, JSON.stringify(initialMessages), async (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`File created and message added to ${filePath}`);
        addChatIdToChats(chatId);
      });
    } else {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        let messages;
        try {
          messages = JSON.parse(data);
        } catch (err) {
          console.error(`Error parsing JSON data for file ${filePath}:`, err);
          return;
        }

        messages.messages.push(message);

        fs.writeFile(filePath, JSON.stringify(messages), (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`Message added to ${filePath}`);
          updateLastMessages(chatId);
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

    let chats;
    try {
      chats = JSON.parse(data);
    } catch (err) {
      console.error("Failed to parse chats data:", err);
      return;
    }

    const updatedChats = chats.chats.map((chat: any) => {
      if (chat.chat_id === chatId) {
        chat.last_message.read = read.toString();
      }
      return chat;
    });

    fs.writeFile(
      filePath,
      JSON.stringify({ chats: updatedChats }, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Chat ${chatId} marked as read: ${read}`);
      }
    );
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

app.get("/api/message/:chat_id", (req, res) => {
  const { chat_id } = req.params;
  const filePath = path.join(dataPath, `chats.json`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    let chatsData;
    try {
      chatsData = JSON.parse(data);
    } catch (err) {
      console.error("Error parsing JSON data:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const chat = chatsData.chats.find(
      (chat: { chat_id: string }) => chat.chat_id == chat_id
    );
    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    if (chat.last_message.read !== "true") {
      chat.last_message.read = "true";
      fs.writeFile(filePath, JSON.stringify(chatsData, null, 2), (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        console.log(`Chat ${chat_id} marked as read`);
      });
    }

    res.json(chat);
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
