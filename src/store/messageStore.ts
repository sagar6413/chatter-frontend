// messageStore.ts
import { create } from "zustand";
import { MessageResponse, MessageStatus } from "@/types";
import { messageService } from "@/services/messageService";
import { AxiosError } from "axios";

interface MessageState {
  conversations: Map<number, MessageResponse[]>;
  loading: boolean;
  loadingMore: boolean;

  // Actions
  loadInitialMessages: (conversationId: number) => Promise<void>;
  loadMoreMessages: (conversationId: number) => Promise<void>;
  addMessage: (conversationId: number, message: MessageResponse) => void;
  updateMessageStatus: (
    conversationId: number,
    messageId: number,
    username: string,
    status: MessageStatus
  ) => void;
  clearMessages: (conversationId: number) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: new Map(),
  loading: false,
  loadingMore: false,
  error: null,

  loadInitialMessages: async (conversationId: number) => {
    set({ loading: true });

    try {
      const response = await messageService.loadInitialMessages(conversationId);
      const conversations = new Map(get().conversations);

      conversations.set(conversationId, response);

      set({ conversations, loading: false });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      throw new Error("Error fetching user");
    }
  },

  loadMoreMessages: async (conversationId: number) => {
    const conversation = get().conversations.get(conversationId);

    set({ loadingMore: true });

    try {
      const response = await messageService.loadMoreMessages(conversationId, {
        page: 2,
        size: 30,
      });

      const conversations = new Map(get().conversations);
      const existingMessages = conversation || [];
      conversations.set(conversationId, [...existingMessages, ...response]);

      set({ conversations, loadingMore: false });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      throw new Error("Error fetching user");
    }
  },

  addMessage: (conversationId: number, message: MessageResponse) => {
    const conversations = new Map(get().conversations);
    const conversation = conversations.get(conversationId);

    if (conversation) {
      conversations.set(conversationId, [...conversation, message]);
      set({ conversations });
    }
  },

  updateMessageStatus: async (
    conversationId: number,
    messageId: number,
    username: string,
    status: MessageStatus
  ) => {
    try {
      const updatedDeliveryStatus = await messageService.updateMessageStatus(
        conversationId,
        messageId,
        status
      );

      const conversations = new Map(get().conversations);
      const conversation = conversations.get(conversationId);

      if (conversation) {
        conversation.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                deliveryStatus: Array.from(msg.deliveryStatus).map((ds) =>
                  ds.recipient.username === username
                    ? { ...ds, status: updatedDeliveryStatus.status }
                    : ds
                ),
              }
            : msg
        );

        conversations.set(conversationId, conversation);

        set({ conversations });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      throw new Error("Error fetching user");
    }
  },

  clearMessages: (conversationId: number) => {
    const conversations = new Map(get().conversations);
    conversations.delete(conversationId);
    set({ conversations });
  },
}));
