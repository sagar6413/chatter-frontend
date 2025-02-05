import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
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
import { ApiError } from "@/types/errors";
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
import { useErrorStore } from "./errorStore";

interface ChatState {
  // State
  privateConversations: Map<number, PrivateConversationResponse>;
  groupConversations: Map<number, GroupConversationResponse>;
  messages: Map<number, MessageResponse[]>;
  queuedMessages: Map<string, MessageRequest>;
  isLoading: boolean;
  selectedConversationId: number | null;

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
  addToQueue: (message: MessageRequest & { id: string }) => void;
  removeFromQueue: (messageId: string) => void;
  processQueue: () => Promise<void>;

  // UI State
  setSelectedConversation: (conversationId: number | null) => void;
  clearMessages: (conversationId: number) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  privateConversations: new Map(),
  groupConversations: new Map(),
  messages: new Map(),
  queuedMessages: new Map(),
  isLoading: false,
  selectedConversationId: null,
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        // Private Chat Actions
        fetchPrivateChats: async () => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // const chats = await api.get<PrivateConversationResponse[]>("/api/chats/private-chats");

            // Mock implementation
            const chats = await mockGetPrivateChats();
            const conversationsMap = new Map(
              chats.map((chat) => [chat.conversationId, chat])
            );
            set({ privateConversations: conversationsMap });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        createPrivateChat: async (username: string) => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // const newChat = await api.post<PrivateConversationResponse>(
            //   `/api/chats/private/${username}`
            // );

            // Mock implementation
            const newChat = await mockCreatePrivateChat(username);
            set((state) => ({
              privateConversations: new Map(state.privateConversations).set(
                newChat.conversationId,
                newChat
              ),
            }));
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        // Group Chat Actions
        fetchGroupChats: async () => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // const chats = await api.get<GroupConversationResponse[]>("/api/chats/group-chats");

            // Mock implementation
            const chats = await mockFetchGroupConversations();
            const conversationsMap = new Map(
              chats.map((chat) => [chat.conversationId, chat])
            );
            set({ groupConversations: conversationsMap });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        createGroupChat: async (
          participantUsernames: Set<string>,
          settings: GroupSettingsRequest
        ) => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // const newChat = await api.post<GroupConversationResponse>("/api/chats/group", {
            //   participantUsernames,
            //   groupSettings: settings,
            // });

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
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        updateGroupSettings: async (
          groupId: number,
          settings: GroupSettingsResponse
        ) => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // const updatedSettings = await api.put<GroupSettingsResponse>(
            //   `/api/chats/${groupId}/settings`,
            //   settings
            // );

            // Mock implementation
            const updatedSettings = await mockUpdateGroupSettings(
              groupId,
              settings
            );
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
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        addGroupParticipants: async (
          groupId: number,
          usernames: Set<string>
        ) => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // await api.post(`/api/chats/${groupId}/participants`, [...usernames]);
            // const updatedGroup = await api.get<GroupConversationResponse>(`/api/chats/group/${groupId}`);

            // Mock implementation
            await mockAddParticipants(groupId, usernames);
            const updatedGroup = await mockFetchGroupConversations().then(
              (groups) => groups.find((g) => g.conversationId === groupId)
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
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        removeGroupParticipant: async (groupId: number, username: string) => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // await api.delete(`/api/chats/${groupId}/participants/${username}`);

            // Mock implementation
            await mockRemoveParticipant(groupId, username);
            set((state) => {
              const groupConversations = new Map(state.groupConversations);
              const group = groupConversations.get(groupId);
              if (group) {
                group.participants = new Set(
                  [...group.participants].filter((p) => p.username !== username)
                );
                group.participantCount--;
              }
              return { groupConversations };
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        // Message Actions
        addMessage: (conversationId: number, message: MessageResponse) => {
          set((state) => {
            const messages = new Map(state.messages);
            const conversationMessages = messages.get(conversationId) || [];
            messages.set(conversationId, [message, ...conversationMessages]);

            // Update last message in conversation
            const isGroupChat = message.conversationId > 10;
            if (isGroupChat) {
              const groupConversations = new Map(state.groupConversations);
              const group = groupConversations.get(conversationId);
              if (group) {
                groupConversations.set(conversationId, {
                  ...group,
                  lastMessage: message,
                });
              }
              return { messages, groupConversations };
            } else {
              const privateConversations = new Map(state.privateConversations);
              const chat = privateConversations.get(conversationId);
              if (chat) {
                privateConversations.set(conversationId, {
                  ...chat,
                  lastMessage: message,
                });
              }
              return { messages, privateConversations };
            }
          });
        },

        updateMessageStatus: async (
          conversationId: number,
          messageId: number,
          username: string,
          status: MessageStatus
        ) => {
          try {
            // Uncomment for real API implementation
            // await api.put(`/api/messages/${messageId}/status`, {
            //   username,
            //   status,
            // });

            // Mock implementation
            await mockUpdateMessageStatus(
              conversationId,
              username,
              messageId,
              status
            );
            set((state) => {
              const messages = new Map(state.messages);
              const conversationMessages = messages.get(conversationId) || [];
              const messageIndex = conversationMessages.findIndex(
                (m) => m.id === messageId
              );

              if (messageIndex !== -1) {
                const message = conversationMessages[messageIndex];
                message.deliveryStatus = message.deliveryStatus.map((ds) =>
                  ds.recipient.username === username
                    ? { ...ds, status, statusTimestamp: new Date() }
                    : ds
                );
                messages.set(conversationId, [...conversationMessages]);
              }

              return { messages };
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
          }
        },

        addReaction: (
          conversationId: number,
          messageId: number,
          reaction: ReactionResponse
        ) => {
          set((state) => {
            const messages = new Map(state.messages);
            const conversationMessages = messages.get(conversationId) || [];
            const messageIndex = conversationMessages.findIndex(
              (m) => m.id === messageId
            );

            if (messageIndex !== -1) {
              const message = conversationMessages[messageIndex];
              const existingReactionIndex = message.reactions.findIndex(
                (r) =>
                  r.type === reaction.type && r.username === reaction.username
              );

              if (existingReactionIndex !== -1) {
                message.reactions.splice(existingReactionIndex, 1);
              } else {
                message.reactions.push(reaction);
              }

              messages.set(conversationId, [...conversationMessages]);
            }

            return { messages };
          });
        },

        loadMessages: async (conversationId: number, page = 0) => {
          set({ isLoading: true });
          try {
            // Uncomment for real API implementation
            // const response = await api.get<Page<MessageResponse>>(
            //   `/api/messages/${conversationId}`,
            //   { params: { page, size: 30 } }
            // );

            // Mock implementation
            const response = await mockLoadInitialMessages(conversationId, {
              page,
              size: 30,
            });

            set((state) => ({
              messages: new Map(state.messages).set(
                conversationId,
                response.content
              ),
            }));
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        loadMoreMessages: async (conversationId: number) => {
          set({ isLoading: true });
          try {
            const currentMessages = get().messages.get(conversationId) || [];
            if (currentMessages.length === 0) return;

            const oldestMessage = currentMessages[currentMessages.length - 1];

            // Uncomment for real API implementation
            // const response = await api.get<Page<MessageResponse>>(
            //   `/api/messages/${conversationId}`,
            //   { params: { before: oldestMessage.id, size: 30 } }
            // );

            // Mock implementation
            const response = await mockLoadMoreMessages(conversationId, {
              before: oldestMessage.id,
              size: 30,
            });

            set((state) => ({
              messages: new Map(state.messages).set(conversationId, [
                ...currentMessages,
                ...response.content,
              ]),
            }));
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
          } finally {
            set({ isLoading: false });
          }
        },

        // Message Queue
        addToQueue: (message: MessageRequest & { id: string }) => {
          set((state) => ({
            queuedMessages: new Map(state.queuedMessages).set(
              message.id,
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
          const { queuedMessages, removeFromQueue } = get();
          for (const messageId of queuedMessages.keys()) {
            try {
              // Mock implementation
              // Simulate message sending
              await new Promise((resolve) => setTimeout(resolve, 500));
              removeFromQueue(messageId);
            } catch (error) {
              useErrorStore.getState().addError(error as ApiError);
            }
          }
        },

        // UI State
        setSelectedConversation: (conversationId: number | null) => {
          set({ selectedConversationId: conversationId });
        },

        clearMessages: (conversationId: number) => {
          set((state) => {
            const messages = new Map(state.messages);
            messages.delete(conversationId);
            return { messages };
          });
        },

        reset: () => {
          set(INITIAL_STATE);
        },
      }),
      {
        name: "chat-store",
        partialize: (state) => ({
          privateConversations: Array.from(
            state.privateConversations.entries()
          ),
          groupConversations: Array.from(state.groupConversations.entries()),
          selectedConversationId: state.selectedConversationId,
        }),
      }
    ),
    { name: "ChatStore" }
  )
);
