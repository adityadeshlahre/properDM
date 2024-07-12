import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "./hooks/ws";

interface SingleChatProps {
  id: string;
}

const SingleChat: React.FC<SingleChatProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useSocket();

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

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setNewMessage("");
    } else {
      console.error("WebSocket is not connected");
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
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default SingleChat;
