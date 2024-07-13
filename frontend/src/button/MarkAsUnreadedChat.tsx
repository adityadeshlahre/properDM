import React, { useState } from "react";
import { MarkAsUnreadButtonProps } from "../types/chat";
import { useNavigate } from "react-router-dom";

const MarkAsUnreadButton: React.FC<MarkAsUnreadButtonProps> = ({
  chatId,
  isRead,
}) => {
  const [readStatus, setReadStatus] = useState(isRead);
  const navigate = useNavigate();

  const toggleReadStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/markasread/${chatId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ read: !readStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: { message: string } = await response.json();
      setReadStatus(!readStatus);
      console.log(data.message);
      navigate("/");
    } catch (error) {
      console.error("Error toggling read status:", error);
    }
  };

  return (
    <button onClick={toggleReadStatus}>
      {readStatus ? "Mark as Unread" : "Mark as Read"}
    </button>
  );
};

export default MarkAsUnreadButton;
