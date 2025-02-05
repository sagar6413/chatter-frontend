import { useCallback, useEffect, useState } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { useError } from "./useError";
import { ConversationType, MessageType } from "@/types";
import { ErrorSource } from "@/types/errors";

const TYPING_TIMEOUT = 3000; // 3 seconds
const TYPING_THROTTLE = 1000; // 1 second

interface TypingIndicatorHookReturn {
  isTyping: boolean;
  setTyping: (typing: boolean) => void;
  typingUsers: Set<string>;
}

/**
 * Hook for managing typing indicators in a conversation
 * Handles both sending and receiving typing status updates
 */
export function useTypingIndicator(
  conversationId: number,
  type: ConversationType
): TypingIndicatorHookReturn {
  const { sendMessage } = useWebSocketStore();
  const { handleError } = useError();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [lastTypingTime, setLastTypingTime] = useState(0);

  // Send typing status
  const setTyping = useCallback(
    (typing: boolean) => {
      const now = Date.now();
      if (typing && now - lastTypingTime < TYPING_THROTTLE) {
        return; // Throttle typing notifications
      }

      try {
        setIsTyping(typing);
        setLastTypingTime(now);
        sendMessage(
          {
            conversationId,
            content: JSON.stringify({
              action: typing ? "startTyping" : "stopTyping",
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
    [conversationId, type, sendMessage, handleError, lastTypingTime]
  );

  // Auto-stop typing after timeout
  useEffect(() => {
    if (!isTyping) return;

    const timer = setTimeout(() => {
      setTyping(false);
    }, TYPING_TIMEOUT);

    return () => clearTimeout(timer);
  }, [isTyping, setTyping]);

  // Clear typing users who haven't updated their status
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const newTypingUsers = new Set(prev);
        let hasChanges = false;

        for (const user of newTypingUsers) {
          const [, timestamp] = user.split("|");
          if (now - parseInt(timestamp) > TYPING_TIMEOUT) {
            newTypingUsers.delete(user);
            hasChanges = true;
          }
        }

        return hasChanges ? newTypingUsers : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isTyping,
    setTyping,
    typingUsers,
  };
}
