import { create } from "zustand";
import {
  PrivateConversationResponse,
  MessageResponse,
} from "@/types/index";
import {
  createPrivateChat,
  getPrivateChats,
} from "@/services/privateChatService";
import { AxiosError } from "axios";

interface PrivateChatState {
  privateChats: PrivateConversationResponse[];
  messages: Record<string, MessageResponse[]>;
  createChat: (username: string) => Promise<void>;
  fetchPrivateChats: () => Promise<void>;
}

export const usePrivateChatStore = create<PrivateChatState>()((set) => ({
  privateChats: [],
  messages: {},

  createChat: async (username: string) => {
    try {
      const newChat = await createPrivateChat(username);
      set((state) => ({
        privateChats: [...state.privateChats, newChat],
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error creating private chat:", error.response?.data);
      } else {
        console.error("Error creating private chat:", error);
      }
    }
  },

  fetchPrivateChats: async () => {
    try {
      const chats = await getPrivateChats();
      set({ privateChats: chats });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching private chats:", error.response?.data);
      } else {
        console.error("Error fetching private chats:", error);
      }
    }
  },
}));
