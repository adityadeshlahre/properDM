import React, { useEffect, useState } from "react";
import { Chat } from "./types/chat";
import { useNavigate } from "react-router-dom";

const AllChat: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnread, setShowUnread] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/chats");
        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }
        const data = await response.json();
        setChats(data.chats);
      } catch (error) {
        setError(error as string);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const filterChats = (chat: Chat) => {
    if (showUnread) {
      return chat.last_message.read === "false";
    }
    return true; // Show all chats when showUnread is false
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>All Chats</h1>
      <div>
        <button onClick={() => setShowUnread(false)}>All Chats</button>{" "}
        <button onClick={() => setShowUnread(true)}>Unread Chats</button>
      </div>
      <ul>
        {chats.filter(filterChats).map((chat) => (
          <li key={chat.chat_id}>
            <div
              key={chat.chat_id}
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                margin: "8px 0",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/chat/${chat.chat_id}`)}
            >
              <h2>
                {chat.sender_details.profile_data.first_name}{" "}
                {chat.sender_details.profile_data.last_name}
              </h2>
              <p>{chat.last_message.content}</p>
              <p>{new Date(chat.last_message.created_at).toLocaleString()}</p>
              <p>Status: {chat.last_message.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllChat;
