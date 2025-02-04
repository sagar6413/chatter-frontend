import { useChatStore } from "./chatStore";
import { useWebSocketStore } from "./webSocketStore";
import { ConversationType } from "@/types";
import { useMemo } from "react";

// Chat selectors
export const usePrivateConversations = () =>
  useChatStore((state) => state.privateConversations);

export const useGroupConversations = () =>
  useChatStore((state) => state.groupConversations);

export const useConversationMessages = (conversationId: number) =>
  useChatStore((state) => state.messages.get(conversationId) || []);

export const useConversation = (
  conversationId: number,
  type: ConversationType
) => {
  const store = useChatStore();
  return type === ConversationType.PRIVATE
    ? store.privateConversations.get(conversationId)
    : store.groupConversations.get(conversationId);
};

// WebSocket selectors
export const useWebSocketConnection = () => {
  const connected = useWebSocketStore((state) => state.connected);
  const error = useWebSocketStore((state) => state.connectionError);

  return useMemo(
    () => ({
      connected,
      error,
    }),
    [connected, error]
  );
};

export const useWebSocketSubscription = () => {
  const subscribeToConversation = useWebSocketStore(
    (state) => state.subscribeToConversation
  );
  const connected = useWebSocketStore((state) => state.connected);

  return useMemo(
    () => ({
      subscribeToConversation,
      connected,
    }),
    [subscribeToConversation, connected]
  );
};

// Chat actions
export const useChatActions = () => {
  const store = useChatStore();
  return {
    addMessage: store.addMessage,
    updateMessageStatus: store.updateMessageStatus,
    addReaction: store.addReaction,
    loadMessages: store.loadMessages,
    loadMoreMessages: store.loadMoreMessages,
  };
};

// Conversation actions
export const useConversationActions = () => {
  const store = useChatStore();

  return {
    createPrivateChat: store.createPrivateChat,
    createGroupChat: store.createGroupChat,
    updateGroupSettings: store.updateGroupSettings,
    addGroupParticipants: store.addGroupParticipants,
    removeGroupParticipant: store.removeGroupParticipant,
  };
};
