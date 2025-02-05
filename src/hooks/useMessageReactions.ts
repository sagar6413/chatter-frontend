import { useCallback } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { useError } from "./useError";
import { ConversationType, MessageType, ReactionType } from "@/types";
import { ErrorSource } from "@/types/errors";

interface MessageReactionsHookReturn {
  addReaction: (messageId: number, reactionType: ReactionType) => void;
  removeReaction: (messageId: number, reactionType: ReactionType) => void;
}

/**
 * Hook for managing message reactions
 * Provides functionality to add and remove reactions from messages
 */
export function useMessageReactions(
  conversationId: number,
  type: ConversationType
): MessageReactionsHookReturn {
  const { sendMessage } = useWebSocketStore();
  const { handleError } = useError();

  const addReaction = useCallback(
    (messageId: number, reactionType: ReactionType) => {
      try {
        sendMessage(
          {
            conversationId,
            content: JSON.stringify({
              messageId,
              reactionType,
              action: "add",
            }),
            type: MessageType.SYSTEM,
            mediaIds: new Set(),
          },
          type
        );
      } catch (error) {
        handleError(error, "websocket" as ErrorSource);
      }
    },
    [conversationId, type, sendMessage, handleError]
  );

  const removeReaction = useCallback(
    (messageId: number, reactionType: ReactionType) => {
      try {
        sendMessage(
          {
            conversationId,
            content: JSON.stringify({
              messageId,
              reactionType,
              action: "remove",
            }),
            type: MessageType.SYSTEM,
            mediaIds: new Set(),
          },
          type
        );
      } catch (error) {
        handleError(error, "websocket" as ErrorSource);
      }
    },
    [conversationId, type, sendMessage, handleError]
  );

  return {
    addReaction,
    removeReaction,
  };
}
