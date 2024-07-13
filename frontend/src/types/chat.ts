interface ProfileData {
  first_name: string;
  last_name: string;
  profile_picture: string;
  headline: string;
  followers: string;
}

interface SenderDetails {
  user_id: number;
  profile_data: ProfileData;
}

interface LastMessage {
  id: string;
  content: string;
  created_at: string;
  status: string;
  read: string;
}

export interface Chat {
  chat_id: number;
  sender_details: SenderDetails;
  last_message: LastMessage;
}

export interface SingleChatProps {
  id: string;
}

export interface messages {
  id: string;
  content: string;
  created_at: string;
}

export interface MarkAsUnreadButtonProps {
  chatId: string;
  isRead: boolean;
}
