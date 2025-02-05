import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { MessageRequest, ConversationType } from "@/types";
import { ApiError } from "@/types/errors";
import { useWebSocketStore } from "./webSocketStore";
import { useErrorStore } from "./errorStore";

interface QueuedMessage {
  id: string;
  message: MessageRequest;
  conversationType: ConversationType;
  timestamp: number;
  attempts: number;
  lastAttempt: number | null;
  error: string | null;
}

interface MessageQueueState {
  // State
  queue: QueuedMessage[];
  isProcessing: boolean;
  lastProcessTime: number | null;

  // Actions
  addToQueue: (
    message: MessageRequest,
    conversationType: ConversationType
  ) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => Promise<void>;
  retryMessage: (id: string) => Promise<void>;
  clearQueue: () => void;

  // Selectors
  getQueueLength: () => number;
  getFailedMessages: () => QueuedMessage[];
  getPendingMessages: () => QueuedMessage[];
  hasFailedMessages: () => boolean;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // Base delay in ms
const MAX_RETRY_DELAY = 30000; // Max delay of 30 seconds
const PROCESS_INTERVAL = 5000; // Process queue every 5 seconds

const INITIAL_STATE = {
  queue: [],
  isProcessing: false,
  lastProcessTime: null,
};

export const useMessageQueueStore = create<MessageQueueState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        addToQueue: (
          message: MessageRequest,
          conversationType: ConversationType
        ) => {
          const queuedMessage: QueuedMessage = {
            id: crypto.randomUUID(),
            message,
            conversationType,
            timestamp: Date.now(),
            attempts: 0,
            lastAttempt: null,
            error: null,
          };

          set((state) => ({
            queue: [...state.queue, queuedMessage],
          }));

          // Try to process queue immediately if not already processing
          if (!get().isProcessing) {
            get().processQueue();
          }
        },

        removeFromQueue: (id: string) => {
          set((state) => ({
            queue: state.queue.filter((item) => item.id !== id),
          }));
        },

        processQueue: async () => {
          const { queue, isProcessing, lastProcessTime } = get();
          const websocketStore = useWebSocketStore.getState();

          // Prevent concurrent processing and respect process interval
          if (
            isProcessing ||
            (lastProcessTime &&
              Date.now() - lastProcessTime < PROCESS_INTERVAL) ||
            !websocketStore.checkConnection() ||
            queue.length === 0
          ) {
            return;
          }

          set({ isProcessing: true });

          try {
            for (const item of queue) {
              if (item.attempts >= MAX_RETRY_ATTEMPTS) {
                continue;
              }

              try {
                await websocketStore.sendMessage(
                  { ...item.message, id: item.id } as MessageRequest & {
                    id: string;
                  },
                  item.conversationType
                );
                get().removeFromQueue(item.id);
              } catch (error) {
                const retryDelay = Math.min(
                  RETRY_DELAY * Math.pow(2, item.attempts),
                  MAX_RETRY_DELAY
                );

                set((state) => ({
                  queue: state.queue.map((qItem) =>
                    qItem.id === item.id
                      ? {
                          ...qItem,
                          attempts: qItem.attempts + 1,
                          lastAttempt: Date.now(),
                          error: (error as Error).message,
                        }
                      : qItem
                  ),
                }));

                if (error instanceof Error) {
                  const apiError: ApiError = {
                    name: "Message Queue Error",
                    message: `Failed to send message: ${error.message}`,
                    type: "websocket",
                    title: "Message Queue Error",
                    status: 1006,
                    detail: `Message ID: ${item.id}, Attempt: ${
                      item.attempts + 1
                    }`,
                  };
                  useErrorStore.getState().addError(apiError);
                }

                // Wait before trying the next message
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
              }
            }
          } finally {
            set({
              isProcessing: false,
              lastProcessTime: Date.now(),
            });

            // Schedule next process if there are still messages to process
            const remainingMessages = get().queue.filter(
              (item) => item.attempts < MAX_RETRY_ATTEMPTS
            );
            if (remainingMessages.length > 0) {
              setTimeout(() => get().processQueue(), PROCESS_INTERVAL);
            }
          }
        },

        retryMessage: async (id: string) => {
          const { queue } = get();
          const message = queue.find((item) => item.id === id);

          if (!message) return;

          set((state) => ({
            queue: state.queue.map((item) =>
              item.id === id
                ? {
                    ...item,
                    attempts: 0,
                    lastAttempt: null,
                    error: null,
                  }
                : item
            ),
          }));

          get().processQueue();
        },

        clearQueue: () => {
          set(INITIAL_STATE);
        },

        // Selectors
        getQueueLength: () => {
          return get().queue.length;
        },

        getFailedMessages: () => {
          return get().queue.filter(
            (item) => item.attempts >= MAX_RETRY_ATTEMPTS
          );
        },

        getPendingMessages: () => {
          return get().queue.filter(
            (item) => item.attempts < MAX_RETRY_ATTEMPTS
          );
        },

        hasFailedMessages: () => {
          return get().queue.some(
            (item) => item.attempts >= MAX_RETRY_ATTEMPTS
          );
        },
      }),
      {
        name: "message-queue-store",
        partialize: (state) => ({
          queue: state.queue.filter(
            (item) => item.attempts < MAX_RETRY_ATTEMPTS
          ),
        }),
      }
    ),
    { name: "MessageQueueStore" }
  )
);
