import { create } from "zustand";
import {
  ReactionResponse,
  MessageStatus,
  MessageResponse,
  PrivateConversationResponse,
  GroupConversationResponse,
  MessageRequest,
  GroupSettingsRequest,
  GroupSettingsResponse,
} from "@/types";
import {
  getPrivateChats as mockGetPrivateChats,
  createPrivateChat as mockCreatePrivateChat,
  fetchGroupConversations as mockFetchGroupConversations,
  createGroupChat as mockCreateGroupChat,
  updateGroupSettings as mockUpdateGroupSettings,
  addParticipants as mockAddParticipants,
  removeParticipant as mockRemoveParticipant,
  loadInitialMessages as mockLoadInitialMessages,
  loadMoreMessages as mockLoadMoreMessages,
  updateMessageStatus as mockUpdateMessageStatus,
} from "@/mock/api";

interface ChatState {
  // Conversations
  privateConversations: Map<number, PrivateConversationResponse>;
  groupConversations: Map<number, GroupConversationResponse>;
  messages: Map<number, MessageResponse[]>;

  // Actions - Private Chats
  fetchPrivateChats: () => Promise<void>;
  createPrivateChat: (username: string) => Promise<void>;

  // Actions - Group Chats
  fetchGroupChats: () => Promise<void>;
  createGroupChat: (
    participantUsernames: Set<string>,
    settings: GroupSettingsRequest
  ) => Promise<void>;
  updateGroupSettings: (
    groupId: number,
    settings: GroupSettingsResponse
  ) => Promise<void>;
  addGroupParticipants: (
    groupId: number,
    usernames: Set<string>
  ) => Promise<void>;
  removeGroupParticipant: (groupId: number, username: string) => Promise<void>;

  // Actions - Messages
  addMessage: (conversationId: number, message: MessageResponse) => void;
  updateMessageStatus: (
    conversationId: number,
    messageId: number,
    username: string,
    status: MessageStatus
  ) => void;
  addReaction: (
    conversationId: number,
    messageId: number,
    reaction: ReactionResponse
  ) => void;
  loadMessages: (conversationId: number, page?: number) => Promise<void>;
  loadMoreMessages: (conversationId: number) => Promise<void>;

  // Message Queue
  queuedMessages: Map<string, MessageRequest>;
  addToQueue: (message: MessageRequest) => void;
  removeFromQueue: (messageId: string) => void;
  processQueue: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  privateConversations: new Map(),
  groupConversations: new Map(),
  messages: new Map(),
  queuedMessages: new Map(),

  // Private Chat Actions
  fetchPrivateChats: async () => {
    try {
      // Original API call
      // const response = await fetch("/api/chats/private-chats");
      // const chats: PrivateConversationResponse[] = await response.json();

      // Mock implementation
      const chats = await mockGetPrivateChats();
      const conversationsMap = new Map(
        chats.map((chat) => [chat.conversationId, chat])
      );
      set({ privateConversations: conversationsMap });
    } catch (error) {
      console.error("Error fetching private chats:", error);
    }
  },

  createPrivateChat: async (username: string) => {
    try {
      // Original API call
      // const response = await fetch(`/api/chats/private/${username}`, {
      //   method: "POST",
      // });
      // const newChat: PrivateConversationResponse = await response.json();

      // Mock implementation
      const newChat = await mockCreatePrivateChat(username);
      set((state) => ({
        privateConversations: new Map(state.privateConversations).set(
          newChat.conversationId,
          newChat
        ),
      }));
    } catch (error) {
      console.error("Error creating private chat:", error);
    }
  },

  // Group Chat Actions
  fetchGroupChats: async () => {
    try {
      // Original API call
      // const response = await fetch("/api/chats/group-chats");
      // const chats: GroupConversationResponse[] = await response.json();

      // Mock implementation
      const chats = await mockFetchGroupConversations();
      const conversationsMap = new Map(
        chats.map((chat) => [chat.conversationId, chat])
      );
      set({ groupConversations: conversationsMap });
    } catch (error) {
      console.error("Error fetching group chats:", error);
    }
  },

  createGroupChat: async (
    participantUsernames: Set<string>,
    settings: GroupSettingsRequest
  ) => {
    try {
      // Original API call
      // const response = await fetch("/api/chats/group", {
      //   method: "POST",
      //   body: JSON.stringify({ participantUsernames, groupSettings: settings }),
      // });
      // const newChat: GroupConversationResponse = await response.json();

      // Mock implementation
      const newChat = await mockCreateGroupChat({
        participantUsernames,
        groupSettings: settings,
      });
      set((state) => ({
        groupConversations: new Map(state.groupConversations).set(
          newChat.conversationId,
          newChat
        ),
      }));
    } catch (error) {
      console.error("Error creating group chat:", error);
    }
  },

  updateGroupSettings: async (
    groupId: number,
    settings: GroupSettingsResponse
  ) => {
    try {
      // Original API call
      // const response = await fetch(`/api/chats/${groupId}/settings`, {
      //   method: "PUT",
      //   body: JSON.stringify(settings),
      // });
      // const updatedSettings: GroupSettingsResponse = await response.json();

      // Mock implementation
      const updatedSettings = await mockUpdateGroupSettings(groupId, settings);
      set((state) => {
        const groupConversations = new Map(state.groupConversations);
        const group = groupConversations.get(groupId);
        if (group) {
          groupConversations.set(groupId, {
            ...group,
            ...updatedSettings,
          });
        }
        return { groupConversations };
      });
    } catch (error) {
      console.error("Error updating group settings:", error);
    }
  },

  addGroupParticipants: async (groupId: number, usernames: Set<string>) => {
    try {
      // Original API call
      // await fetch(`/api/chats/${groupId}/participants`, {
      //   method: "POST",
      //   body: JSON.stringify([...usernames]),
      // });

      // Mock implementation
      await mockAddParticipants(groupId, usernames);
      const updatedGroup = await mockFetchGroupConversations().then((groups) =>
        groups.find((g) => g.conversationId === groupId)
      );

      if (updatedGroup) {
        set((state) => ({
          groupConversations: new Map(state.groupConversations).set(
            groupId,
            updatedGroup
          ),
        }));
      }
    } catch (error) {
      console.error("Error adding participants:", error);
    }
  },

  removeGroupParticipant: async (groupId: number, username: string) => {
    try {
      // Original API call
      // await fetch(`/api/chats/${groupId}/participants/${username}`, {
      //   method: "DELETE",
      // });

      // Mock implementation
      await mockRemoveParticipant(groupId, username);
      set((state) => {
        const groupConversations = new Map(state.groupConversations);
        const group = groupConversations.get(groupId);
        if (group) {
          group.participants = new Set(
            [...group.participants].filter((p) => p.username !== username)
          );
        }
        return { groupConversations };
      });
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  },

  // Message Actions
  addMessage: (conversationId: number, message: MessageResponse) => {
    set((state) => {
      const messages = new Map(state.messages);
      const conversationMessages = messages.get(conversationId) || [];
      messages.set(conversationId, [...conversationMessages, message]);
      return { messages };
    });
  },

  updateMessageStatus: async (
    conversationId: number,
    messageId: number,
    username: string,
    status: MessageStatus
  ) => {
    try {
      // Original API call
      // const response = await fetch(
      //   `/api/chats/${username}/messages/${messageId}/status`,
      //   { method: "PUT", body: JSON.stringify({ status }) }
      // );
      // const updatedStatus = await response.json();

      // Mock implementation
      await mockUpdateMessageStatus(
        conversationId,
        username,
        messageId,
        status
      );
      set((state) => {
        const messages = new Map(state.messages);
        const conversationMessages = messages.get(conversationId)?.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                deliveryStatus: msg.deliveryStatus.map((ds) =>
                  ds.recipient.username === username
                    ? { ...ds, status: status }
                    : ds
                ),
              }
            : msg
        );
        if (conversationMessages) {
          messages.set(conversationId, conversationMessages);
        }
        return { messages };
      });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  },

  addReaction: (
    conversationId: number,
    messageId: number,
    reaction: ReactionResponse
  ) => {
    set((state) => {
      const messages = new Map(state.messages);
      const conversationMessages = messages.get(conversationId)?.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: [...msg.reactions, reaction],
            }
          : msg
      );
      if (conversationMessages) {
        messages.set(conversationId, conversationMessages);
      }
      return { messages };
    });
  },

  loadMessages: async (conversationId: number, page = 0) => {
    try {
      // Original API call
      // const response = await fetch(
      //   `/api/chats/${conversationId}/messages?page=${page}&size=30`
      // );
      // const messages: MessageResponse[] = await response.json();

      // Mock implementation
      const response = await mockLoadInitialMessages(conversationId, {
        page,
        size: 30,
      });
      set((state) => ({
        messages: new Map(state.messages).set(conversationId, response.content),
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  },

  loadMoreMessages: async (conversationId: number) => {
    const currentMessages = get().messages.get(conversationId) || [];
    try {
      // Original API call
      // const response = await fetch(
      //   `/api/chats/${conversationId}/messages?page=${page}&size=30`
      // );
      // const newMessages: MessageResponse[] = await response.json();

      // Mock implementation
      const response = await mockLoadMoreMessages(conversationId, {
        before: currentMessages[0]?.id,
        size: 30,
      });
      if (response.content.length > 0) {
        set((state) => {
          const messages = new Map(state.messages);
          messages.set(conversationId, [
            ...response.content,
            ...currentMessages,
          ]);
          return { messages };
        });
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  },

  // Message Queue Actions
  addToQueue: (message: MessageRequest) => {
    set((state) => ({
      queuedMessages: new Map(state.queuedMessages).set(
        crypto.randomUUID(),
        message
      ),
    }));
  },

  removeFromQueue: (messageId: string) => {
    set((state) => {
      const queuedMessages = new Map(state.queuedMessages);
      queuedMessages.delete(messageId);
      return { queuedMessages };
    });
  },

  processQueue: async () => {
    const { queuedMessages } = get();
    for (const [messageId, message] of queuedMessages) {
      try {
        // Attempt to send the message
        await fetch("/api/chats/send", {
          method: "POST",
          body: JSON.stringify(message),
        });
        // Remove from queue if successful
        get().removeFromQueue(messageId);
      } catch (error) {
        console.error("Error processing queued message:", error);
      }
    }
  },
}));
