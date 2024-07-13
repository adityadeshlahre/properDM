import React from "react";
import { useNavigate } from "react-router-dom";

const CreateChatButton: React.FC = () => {
  const navigate = useNavigate();

  const createNewChat = () => {
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    navigate(`/chat/${randomId}`);
  };

  return <button onClick={createNewChat}>Create New Chat</button>;
};

export default CreateChatButton;
