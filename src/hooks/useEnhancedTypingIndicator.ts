import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocketStore } from "@/store/webSocketStore";
import { useUserStore } from "@/store/userStore";
import { ConversationType } from "@/types";
import { useDebounce } from "./useDebounce";

interface TypingUser {
  username: string;
  timestamp: number;
}

interface TypingState {
  typingUsers: TypingUser[];
  isTyping: boolean;
}

const TYPING_TIMEOUT = 3000; // 3 seconds
const DEBOUNCE_DELAY = 500; // 500ms

export function useEnhancedTypingIndicator(
  conversationId: number,
  type: ConversationType
) {
  const [state, setState] = useState<TypingState>({
    typingUsers: [],
    isTyping: false,
  });

  const webSocketStore = useWebSocketStore();
  const user = useUserStore((state) => state.user);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounced typing state
  const debouncedIsTyping = useDebounce(state.isTyping, DEBOUNCE_DELAY);

  const cleanupTypingTimeout = useCallback((username: string) => {
    if (typingTimeoutRef.current[username]) {
      clearTimeout(typingTimeoutRef.current[username]);
      delete typingTimeoutRef.current[username];
    }
  }, []);

  const removeTypingUser = useCallback(
    (username: string) => {
      setState((prev) => ({
        ...prev,
        typingUsers: prev.typingUsers.filter((u) => u.username !== username),
      }));
      cleanupTypingTimeout(username);
    },
    [cleanupTypingTimeout]
  );

  const addTypingUser = useCallback(
    (username: string) => {
      cleanupTypingTimeout(username);

      setState((prev) => ({
        ...prev,
        typingUsers: [
          ...prev.typingUsers.filter((u) => u.username !== username),
          { username, timestamp: Date.now() },
        ],
      }));

      typingTimeoutRef.current[username] = setTimeout(() => {
        removeTypingUser(username);
      }, TYPING_TIMEOUT);
    },
    [cleanupTypingTimeout, removeTypingUser]
  );

  // Send typing indicator
  const setTyping = useCallback(
    (typing: boolean) => {
      if (!user) return;

      setState((prev) => ({ ...prev, isTyping: typing }));

      if (typing) {
        webSocketStore.sendTypingIndicator(conversationId, type, true);
      }
    },
    [user, conversationId, type, webSocketStore]
  );

  // Subscribe to typing indicators
  useEffect(() => {
    if (!user) return;

    const unsubscribe = webSocketStore.subscribe(
      `/topic/typing.${conversationId}`,
      (data: { username: string; isTyping: boolean }) => {
        if (data.username === user.username) return;

        if (data.isTyping) {
          addTypingUser(data.username);
        } else {
          removeTypingUser(data.username);
        }
      }
    );

    return () => {
      unsubscribe?.();
      // Cleanup all timeouts
      Object.keys(typingTimeoutRef.current).forEach(cleanupTypingTimeout);
    };
  }, [
    user,
    conversationId,
    webSocketStore,
    addTypingUser,
    removeTypingUser,
    cleanupTypingTimeout,
  ]);

  // Send stopped typing indicator when debounced typing state changes to false
  useEffect(() => {
    if (!debouncedIsTyping && user) {
      webSocketStore.sendTypingIndicator(conversationId, type, false);
    }
  }, [debouncedIsTyping, user, conversationId, type, webSocketStore]);

  // Format typing indicator message
  const typingMessage = useCallback(() => {
    const { typingUsers } = state;
    if (typingUsers.length === 0) return "";
    if (typingUsers.length === 1)
      return `${typingUsers[0].username} is typing...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    return `${typingUsers[0].username} and ${
      typingUsers.length - 1
    } others are typing...`;
  }, [state]);

  return {
    typingUsers: state.typingUsers,
    isTyping: state.isTyping,
    setTyping,
    typingMessage,
  };
}
