import { useChatStore } from "./chatStore";
import { useWebSocketStore } from "./webSocketStore";
import { ConversationType, MessageResponse } from "@/types";
import { useMemo, useCallback } from "react";

// Selector functions
const selectPrivateConversations = (
  state: ReturnType<typeof useChatStore.getState>
) => state.privateConversations;
const selectGroupConversations = (
  state: ReturnType<typeof useChatStore.getState>
) => state.groupConversations;

// Chat selectors
export const usePrivateConversations = () => {
  return useChatStore(selectPrivateConversations);
};

export const useGroupConversations = () => {
  return useChatStore(selectGroupConversations);
};

export const useConversationMessages = (conversationId: number) => {
  const messages = useChatStore(
    useCallback(
      (state) => state.messages.get(conversationId) || EMPTY_ARRAY,
      [conversationId]
    )
  );
  return messages;
};

const EMPTY_ARRAY: MessageResponse[] = [];

export const useConversation = (
  conversationId: number,
  type: ConversationType
) => {
  const selectConversation = useCallback(
    (state: ReturnType<typeof useChatStore.getState>) => {
      return type === ConversationType.PRIVATE
        ? state.privateConversations.get(conversationId)
        : state.groupConversations.get(conversationId);
    },
    [conversationId, type]
  );
  return useChatStore(selectConversation);
};

// WebSocket selectors
const selectWebSocketConnected = (
  state: ReturnType<typeof useWebSocketStore.getState>
) => state.connected;
const selectWebSocketError = (
  state: ReturnType<typeof useWebSocketStore.getState>
) => state.connectionError;
const selectWebSocketSubscribe = (
  state: ReturnType<typeof useWebSocketStore.getState>
) => state.subscribeToConversation;

export const useWebSocketConnection = () => {
  const connected = useWebSocketStore(selectWebSocketConnected);
  const error = useWebSocketStore(selectWebSocketError);

  return useMemo(
    () => ({
      connected,
      error,
    }),
    [connected, error]
  );
};

export const useWebSocketSubscription = () => {
  const subscribeToConversation = useWebSocketStore(selectWebSocketSubscribe);
  const connected = useWebSocketStore(selectWebSocketConnected);

  return useMemo(
    () => ({
      subscribeToConversation,
      connected,
    }),
    [subscribeToConversation, connected]
  );
};

// Chat actions
const selectChatActions = (
  state: ReturnType<typeof useChatStore.getState>
) => ({
  addMessage: state.addMessage,
  updateMessageStatus: state.updateMessageStatus,
  addReaction: state.addReaction,
  loadMessages: state.loadMessages,
  loadMoreMessages: state.loadMoreMessages,
});

export const useChatActions = () => {
  return useChatStore(selectChatActions);
};

// Conversation actions
const selectConversationActions = (
  state: ReturnType<typeof useChatStore.getState>
) => ({
  createPrivateChat: state.createPrivateChat,
  createGroupChat: state.createGroupChat,
  updateGroupSettings: state.updateGroupSettings,
  addGroupParticipants: state.addGroupParticipants,
  removeGroupParticipant: state.removeGroupParticipant,
});

export const useConversationActions = () => {
  return useChatStore(selectConversationActions);
};
