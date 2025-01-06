// Authentication-related interfaces
export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  displayName: string;
  avatar: string;
}

// User and related interfaces
export interface User {
  username: string;
  displayName: string;
  avatar: string; // Added for the UI
}

// Chat-related interfaces and enums
export enum ChatType {
  PRIVATE = "PRIVATE",
  GROUP = "GROUP",
}

export interface Chat {
  status: string;
  id: number;
  name: string;
  type: ChatType;
  participants: User[];
  latestMessage: Message | null;
  unreadCount: number;
  createdAt: string; // ISO 8601 format
}

// Message and reactions
export interface Reaction {
  emoji: string;
  count: number;
  selected?: boolean;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  sender: "self" | "other";
  createdAt: string; // ISO 8601 format
  avatar: string;
  senderName: string;
  reactions: Reaction[];
  status: "sent" | "delivered" | "read";
}

// Group-related interface
export interface GroupDTO {
  id: number;
  name: string;
  description: string;
  members: User[];
  createdAt: string; // ISO 8601 format
  avatar: string; // Added for the UI
}

// Settings and state management
export interface SettingOption {
  id: number;
  icon: string; // Icon identifier string
  title: string;
  description: string;
  type: "toggle" | "button";
  value?: boolean;
  category: "general" | "privacy" | "appearance";
}

export interface ChatState {
  settings: SettingOption[];
  updateSetting: (id: number, value: boolean) => void;
}

// Default reactions
export const defaultReactions: Reaction[] = [
  { emoji: "👍", count: 0 },
  { emoji: "❤️", count: 0 },
  { emoji: "😂", count: 0 },
  { emoji: "😮", count: 0 },
  { emoji: "😢", count: 0 },
  { emoji: "🙏", count: 0 },
];
