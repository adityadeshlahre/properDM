import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "./hooks/ws";
import { messages, SingleChatProps } from "./types/chat";
import CreateChatButton from "./button/CreateChatButton";
import { BASE_URL } from "./hooks/utils";
import MarkAsUnreadButton from "./button/MarkAsUnreadedChat";

const SingleChat: React.FC<SingleChatProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatRead, setIsChatRead] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    const fetchFullChatInfo = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/message/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        const messageContents = data.messages.map(
          (message: messages) => message.content
        );
        if (!data.last_message.read) {
          markChatAsRead(id as string);
        }
        setMessages(messageContents);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFullChatInfo();
  }, [id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/messages/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        const messageContents = data.messages.map(
          (message: messages) => message.content
        );
        setMessages(messageContents);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const text = await event.data.text();
        setMessages((prevMessages) => [...prevMessages, text]);
      } else {
        setMessages((prevMessages) => [...prevMessages, event.data]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, [socket]);

  const sendMessage = async () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setNewMessage("");

      try {
        const response = await fetch(`${BASE_URL}/api/sendmessage/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        console.log(data.message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const markChatAsRead = async (chatId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/markasread/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark chat as read");
      }

      setIsChatRead(true);
    } catch (error) {
      console.error(error);
    }
  };

  if (!socket)
    return (
      <>
        <div className="text-white">Connecting.......</div>
      </>
    );

  return (
    <div>
      <h1>Chat {id}</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <br />
      <br />
      <button onClick={sendMessage}>Send</button>
      <br />
      <br />
      <MarkAsUnreadButton chatId={id as string} isRead={isChatRead} />
      <br />
      <br />
      <CreateChatButton />
    </div>
  );
};

export default SingleChat;
